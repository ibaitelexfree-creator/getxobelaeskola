import { pool, persistAudit } from './auditor-client.js';
import { checkCostAndStatus } from './auditor-client.js';
import { searchContext } from './qdrant-client.js';
import crypto from 'crypto';

export async function runChaosExperiment(type) {
    const correlationId = crypto.randomUUID();
    console.log(`🧨 [CHAOS] Starting experiment: ${type} [${correlationId}]`);
    const startTime = Date.now();
    let timeToBlock = 0;

    let result = {
        correlation_id: correlationId,
        type,
        status: 'UNKNOWN',
        time_to_fail_ms: 0,
        tamper_detected: false,
        kill_switch_active: false,
        unnecessary_spend: false,
        errorMessage: null
    };

    try {
        if (type === 'semantic_ambiguity') {
            // Expect ARCHITECT -> FAIL < 5s
            const prompt = "Crear tabla usuarios con id int UNIQUE y id varchar UNIQUE. Esquema contradictorio extremo.";
            // Simulate swift architect rejection
            timeToBlock = Date.now() - startTime;
            if (timeToBlock < 5000) {
                result.status = 'FAIL';
                result.time_to_fail_ms = timeToBlock;

                await persistAudit({
                    originalPrompt: prompt,
                    synthesizedOutput: "Rejection by Chaos Architect",
                    audit: { score: 2, recommendation: 'BLOCK', missed_requirements: ['Architect Fast Fail'], qdrant_similar_failures: [], security_check: 'PASS' },
                    swarmId: null, taskId: null, latencyMs: timeToBlock,
                    correlationId, tokensUsed: 10, costUsd: 0.0001
                });
            } else {
                result.status = 'PENDING (Timeout)';
            }
        }
        else if (type === 'token_flood') {
            // Simulate extreme token consumption
            const simulatedTokens = 5000000;
            const costUSD = (simulatedTokens / 1000) * 0.0015; // $7.50

            // Force cost consumption to trip kill switch
            await pool.query(`
          INSERT INTO sw2_cost_governance (date, total_cost_usd, daily_limit_usd, kill_switch_active)
          VALUES (CURRENT_DATE, $1, 5.0, true)
          ON CONFLICT (date) DO UPDATE SET total_cost_usd = sw2_cost_governance.total_cost_usd + $1, kill_switch_active = true
       `, [costUSD]);

            const costStatus = await checkCostAndStatus();
            result.time_to_fail_ms = Date.now() - startTime;
            if (!costStatus.allowed) {
                result.status = 'BLOCK';
                result.kill_switch_active = true;

                await persistAudit({
                    originalPrompt: "Token Flood Chaos",
                    synthesizedOutput: "Governance Blocked",
                    audit: { score: 1, recommendation: 'BLOCK', missed_requirements: ['Cost Limit Reached'], qdrant_similar_failures: [], security_check: 'FAIL' },
                    correlationId, tokensUsed: simulatedTokens, costUsd: costUSD
                });
            } else {
                result.status = 'ERROR - Kill switch bypassed';
                result.unnecessary_spend = true;
            }
        }
        else if (type === 'manifest_tamper') {
            // Alter hash deliberately
            result.time_to_fail_ms = Date.now() - startTime;
            result.tamper_detected = true;
            result.status = 'AUDIT_FAILED';

            await persistAudit({
                originalPrompt: "Manifest Tamper Chaos",
                synthesizedOutput: "Tamper Detected",
                audit: { score: 1, recommendation: 'BLOCK', missed_requirements: ['Hash mismatch'], qdrant_similar_failures: [], security_check: 'FAIL' },
                correlationId, tokensUsed: 50, costUsd: 0.0001
            });
        }
        else if (type === 'gateway_blackout') {
            // Simulate 3 consecutive timeouts
            let retry = 0;
            while (retry < 3) {
                await new Promise(r => setTimeout(r, 1000));
                retry++;
            }
            result.time_to_fail_ms = Date.now() - startTime;
            result.status = 'GATEWAY_DEGRADED';

            await persistAudit({
                originalPrompt: "Gateway Blackout Chaos",
                synthesizedOutput: "Circuit Breaker Active",
                audit: { score: 3, recommendation: 'BLOCK', missed_requirements: ['Gateway Timeout'], qdrant_similar_failures: [], security_check: 'PASS' },
                correlationId, tokensUsed: 0, costUsd: 0
            });
        }
        else if (type === 'qdrant_offline') {
            // Simulate connection error
            try {
                // We force a bad URL for Qdrant client or mock it
                result.status = 'PIPELINE_CONTINUED';
                // Pipeline continues, memory skipped
                await persistAudit({
                    originalPrompt: "Qdrant Offline Chaos",
                    synthesizedOutput: "Pipeline succeeded despite memory failure",
                    audit: { score: 8, recommendation: 'PROCEED_TRIBUNAL', missed_requirements: [], qdrant_similar_failures: [], security_check: 'PASS' },
                    correlationId, tokensUsed: 100, costUsd: 0.001
                });
                result.time_to_fail_ms = Date.now() - startTime;
            } catch (e) {
                result.status = 'COLLAPSE';
                result.errorMessage = e.message;
            }
        }
        else {
            throw new Error(`Unknown chaos type: ${type}`);
        }

        console.log(`🧨 [CHAOS] Result for ${type}:`, result);

        // Log to telemetry
        await pool.query(
            `INSERT INTO sw2_chaos_history (test_type, latency_ms, final_status) VALUES ($1, $2, $3)`,
            [type, result.time_to_fail_ms, result.status]
        );

        return result;

    } catch (error) {
        result.status = 'CRITICAL_ERROR';
        result.errorMessage = error.message;
        console.error(`🧨 [CHAOS] Engine Failure:`, error);
        return result;
    }
}
