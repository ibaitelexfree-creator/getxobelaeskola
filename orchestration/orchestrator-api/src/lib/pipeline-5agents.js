import { N8nClient } from './n8n-client.js';
import { parseAuditResult, decideFlow, persistAudit, updateAndPersistMetrics, pool, checkCostAndStatus } from './auditor-client.js';
import { searchContext } from './qdrant-client.js';
import crypto from 'crypto';




const DIAGNOSTIC_MODE = true; // Low-Budget Diagnostic Mode

const rollingTierWindow = [];
const TIER_WINDOW_SIZE = 100;

/**
 * Token Budget Governor: Optimizes reasoning depth vs remaining credits.
 * Tier 1: Lite (Analyst, Auditor) - 256/512 tokens.
 * Tier 2: Standard (Analyst, Planner, Auditor) - 512/1024 tokens.
 * Tier 3: Deep (All 5) - 1024/2048 tokens. (Disabled in Diagnostic Mode)
 */
function getBudgetPolicy(prompt, memoryPrediction) {
    // Se recalibra la activación del Tier 3 profundo (ROI Score < 40 en lugar de 50) para ahorro de costes masivo.
    const isCritical = memoryPrediction.activated && memoryPrediction.score < 40;

    // Tier 3: Deep Reflection (Auditor is leaner than Architect)
    // 🧨 Bonus Test: Disminuyendo 10% el presupuesto (2048 -> 1843) para medir elasticidad en retries
    if (isCritical && !DIAGNOSTIC_MODE) {
        return {
            tier: 3,
            model: process.env.OPENROUTER_PIPELINE_T3_MODEL || process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
            max_tokens: 1843,
            agent_limits: { analyst: 1024, architect: 1843, planner: 1024, critic: 1024, auditor: 512 },
            agents: ['analyst', 'architect', 'planner', 'critic', 'auditor']
        };
    }

    // 1️⃣ Probabilidad de mejora real en SSI
    const needsHigherTier = (memoryPrediction.activated && memoryPrediction.score < 72) ||
        (memoryPrediction.activated && memoryPrediction.rec === 'RETRY') ||
        prompt.length >= 950; // Umbral de impacto estructural

    // 2️⃣ Introduce un Budget Cap Rolling (Max Tier 2 = 40%)
    const tier2Count = rollingTierWindow.filter(t => t === 2).length;
    const currentTier2Ratio = rollingTierWindow.length > 10 ? (tier2Count / rollingTierWindow.length) : 0;

    if (needsHigherTier && currentTier2Ratio <= 0.40) {
        rollingTierWindow.push(2);
        if (rollingTierWindow.length > TIER_WINDOW_SIZE) rollingTierWindow.shift();

        // Tier 2: Standard (Sweet Spot)
        return {
            tier: 2,
            model: process.env.OPENROUTER_PIPELINE_T2_MODEL || process.env.OPENROUTER_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free',
            max_tokens: 1024,
            agent_limits: { analyst: 1024, planner: 1024, auditor: 512 },
            agents: ['analyst', 'planner', 'auditor']
        };
    }

    // Tier 1: Lite Efficiency (Fast path o Fallback si Cap superado)
    rollingTierWindow.push(1);
    if (rollingTierWindow.length > TIER_WINDOW_SIZE) rollingTierWindow.shift();

    return {
        tier: 1,
        model: process.env.OPENROUTER_PIPELINE_T1_MODEL || process.env.OPENROUTER_MODEL || 'google/gemma-3-12b-it:free',
        max_tokens: 512,
        agent_limits: { analyst: 512, auditor: 256 },
        agents: ['analyst', 'auditor']
    };
}



/**
 * 5-Agent Pipeline (Sequential Reflection via n8n)
 */
export async function run5AgentPipeline(prompt) {


    try {
        const correlationId = crypto.randomUUID();
        let contextWarnings = [];
        console.log(`🚀 [${correlationId}] Checking Semantic Memory for prompt: ${prompt}`);


        // 1. Cost & Governance Check
        const costStatus = await checkCostAndStatus();
        if (!costStatus.allowed) {
            console.error(`🚨 [${correlationId}] Governance Block: ${costStatus.reason}`);
            return { audit: { score: 1, recommendation: 'BLOCK', missed_requirements: [costStatus.reason] }, flow: 'BLOCK', latencyMs: 0 };
        }

        // Anti-Loop Check (Max 2 RETRYs auto)
        const dbRes = await pool.query(
            `SELECT COUNT(*) as retries FROM sw2_audit_results WHERE original_prompt = $1 AND recommendation = 'RETRY'`,
            [prompt]
        );
        const retryCount = parseInt(dbRes.rows[0].retries, 10) || 0;


        let penalty = 0;
        let earlyFailReason = null;
        let memoryPrediction = { score: 100, rec: 'PROCEED', activated: false };

        if (retryCount >= 2) {
            penalty += 10;
            earlyFailReason = 'Anti-loop triggered: Max 2 automatic RETRYs exceeded.';
        } else {
            // Early Semantic Penalty (Advisory Mode)
            const searchResults = await searchContext('audit-history', prompt, 3);
            const historicalWarnings = [];

            for (const result of searchResults) {
                const failure = result.payload;
                const matchScore = result.score;

                if (matchScore > 0.85) {
                    memoryPrediction.activated = true;
                    if (failure.recommendation === 'BLOCK' || failure.score <= 30) {
                        penalty += 5;
                        memoryPrediction.score = Math.min(memoryPrediction.score, failure.score || 20);
                        memoryPrediction.rec = 'BLOCK';
                        historicalWarnings.push(`[ADVISORY] Highly similar to a previous BLOCKED task (Match: ${(matchScore * 100).toFixed(1)}%). Context: ${failure.reasoning_summary}`);
                    } else if (failure.recommendation === 'RETRY' || failure.score <= 60) {
                        penalty += 3;
                        memoryPrediction.score = Math.min(memoryPrediction.score, failure.score || 55);
                        memoryPrediction.rec = 'RETRY';
                        historicalWarnings.push(`[ADVISORY] Similar to a previous RETRY (Match: ${(matchScore * 100).toFixed(1)}%). Context: ${failure.reasoning_summary}`);
                    }
                }
            }
            contextWarnings = historicalWarnings;
        }



        let audit, flow, latencyMs = 0;
        const startTime = Date.now();
        let simulatedTokens = 0;
        let simulatedCostUsd = 0.0;




        // Hard blocks only for Anti-loop (penalty >= 10)
        // Advisory mode (penalty >= 5) allows investigation but flags as activated.
        if (penalty >= 10) {
            console.log(`⚠️ [${correlationId}] HARD BLOCK: ${earlyFailReason}`);
            audit = {
                score: 1,
                security_check: 'FAIL',
                recommendation: 'BLOCK',
                missed_requirements: [earlyFailReason]
            };
            flow = 'BLOCK';

        } else {
            const budget = getBudgetPolicy(prompt, memoryPrediction);
            console.log(`🚀 [${correlationId}] Triggering Tier ${budget.tier} Pipeline (Budget: ${budget.max_tokens} t/agent)`);

            // Budget Gate pre-ejecución
            const maxProjectedTokens = budget.agents.map(a => budget.agent_limits[a]).reduce((a, b) => a + b, 0);
            const maxProjectedCost = (maxProjectedTokens / 1000) * 0.0015;
            const remainingBudget = costStatus.daily_limit_usd - costStatus.total_cost_usd;

            if (maxProjectedCost > remainingBudget) {
                console.error(`🚨 [${correlationId}] Pre-Execution Budget Gate Block! Projected: $${maxProjectedCost.toFixed(4)}, Remaining: $${remainingBudget.toFixed(4)}`);
                audit = { score: 1, recommendation: 'BLOCK', security_check: 'FAIL', missed_requirements: ['Pre-Execution Budget Gate triggered: Insufficient daily funds.'] };
                flow = 'BLOCK';
                latencyMs = Date.now() - startTime;
            } else {
                let result = await N8nClient.triggerWorkflow('N8N_PIPELINE_5AGENTS_URL', {
                    prompt,
                    correlationId,
                    historicalMemory: contextWarnings.join('\n'),
                    budget,
                    tier: budget.tier,
                    timestamp: new Date().toISOString()
                });

                latencyMs = Date.now() - startTime;

                if (!result) {
                    return { audit: { score: 1, recommendation: 'RETRY', security_check: 'FAIL' }, flow: 'RETRY' };
                }

                audit = parseAuditResult(result);
                flow = decideFlow(audit);
            }


            // POST-EXECUTION INTELLIGENCE AUDIT (Observation Mode)
            const { recordIntelligenceMetrics, logIntelligenceDiscrepancy, recordMissionMetrics } = await import('./operational-monitor.js');

            recordIntelligenceMetrics(memoryPrediction.activated, memoryPrediction.score, audit.score);

            // Log Discrepancies
            if (memoryPrediction.rec === 'BLOCK' && audit.score > 70) {
                logIntelligenceDiscrepancy('FALSE_POSITIVE', prompt, contextWarnings[0], audit);
            }
            if (!memoryPrediction.activated && audit.score <= 25) {
                logIntelligenceDiscrepancy('FALSE_NEGATIVE', prompt, 'No memory activation', audit);
            }



            // Stacked Latency Recording
            const simTokensIn = prompt.length * 4 + contextWarnings.join('').length * 4;
            const simTokensOut = JSON.stringify(audit).length * 4 + 1500;
            const escalated = flow === 'RETRY' || flow === 'BLOCK';
            recordMissionMetrics(simTokensIn + simTokensOut, simTokensOut, audit.score, latencyMs, budget.tier, escalated);


            simulatedTokens = simTokensIn + simTokensOut;
            simulatedCostUsd = (simulatedTokens / 1000) * 0.0015;

        }


        // Persist to PostgreSQL 
        let auditId = null;
        try {
            auditId = await persistAudit({
                originalPrompt: prompt,
                synthesizedOutput: audit.instruction || audit.missed_requirements?.[0] || 'Early Rejection',
                audit,
                swarmId: null,
                taskId: null,
                latencyMs,
                correlationId,
                tokensUsed: simulatedTokens,
                costUsd: simulatedCostUsd,

                pipelineVersion: 'v2.2',
                qdrant_memory_active: memoryPrediction.activated,
                match_score: memoryPrediction.score
            });

            await updateAndPersistMetrics(simulatedCostUsd);
        } catch (e) {
            console.error(`⚠️ [${correlationId}] Failed to persist audit result or metrics:`, e.message);
        }

        console.log(`✅ [${correlationId}] Pipeline completed. Score: ${audit.score} -> ${flow} | Cost: $${simulatedCostUsd.toFixed(4)}`);
        return { auditId, audit, flow, latencyMs, correlationId };


    } catch (error) {
        console.error(`❌ [PIPELINE ERROR]`, error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }


}
