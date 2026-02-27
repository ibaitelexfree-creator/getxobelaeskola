import pool from './db-client.js';
import { sendTelegramMessage } from '../telegram.js';
import { recordMissionMetrics } from './operational-monitor.js';

import axios from 'axios';
import crypto from 'crypto';
import { generateEmbedding } from './qdrant-client.js';


// Operational Memory Buffer for DB Failures
const degradedLogBuffer = [];
const MAX_BUFFER_SIZE = 1000;
let lastDriftAlertTime = 0;
const DRIFT_ALERT_COOLDOWN = 3600000; // 1 hour cooldown for same alert

/**
 * Parses the raw n8n response to extract the auditor's JSON verdict.
 * @param {object|Array} rawResult - Raw response from n8n pipeline
 * @returns {object} Parsed audit result
 */
export function parseAuditResult(rawResult) {
    let data = rawResult;

    // n8n returns array of arrays sometimes
    if (Array.isArray(data) && data.length > 0) data = data[0];

    let jsonToParse = null;

    // If data comes in the OpenRouter format from n8n
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
        jsonToParse = data.choices[0].message.content;
    } else if (typeof data === 'object' && !Array.isArray(data)) {
        // Already a JSON object from n8n Code Node
        return validateAuditContract(data);
    } else if (typeof data === 'string') {
        jsonToParse = data;
    }

    if (jsonToParse) {
        try {
            const parsed = JSON.parse(jsonToParse);
            return validateAuditContract(parsed);
        } catch {
            return getContractViolationFallback("Invalid JSON format from LLM");
        }
    }

    return getContractViolationFallback("Invalid or empty response structure");
}

function validateAuditContract(parsed) {
    return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        security_check: parsed.security_check || 'FAIL', // Kept for backward compat
        recommendation: ['PROCEED', 'RETRY', 'BLOCK', 'HUMAN_REVIEW'].includes(parsed.recommendation)
            ? parsed.recommendation
            : 'HUMAN_REVIEW',
        missed_requirements: Array.isArray(parsed.missed_requirements) ? parsed.missed_requirements : [],
        qdrant_conflict: parsed.qdrant_conflict || false,
        qdrant_similar_failures: Array.isArray(parsed.qdrant_similar_failures) ? parsed.qdrant_similar_failures : [],
        confidence_delta: typeof parsed.confidence_delta === 'number' ? parsed.confidence_delta : 0.0,
        reasoning_summary: parsed.reasoning_summary || ''
    };
}

function getContractViolationFallback(reason) {
    return {
        score: 0,
        security_check: 'FAIL',
        recommendation: 'HUMAN_REVIEW',
        missed_requirements: [reason],
        qdrant_conflict: false,
        qdrant_similar_failures: [],
        confidence_delta: -1.0,
        reasoning_summary: "Output contract violation"
    };
}


/**
 * Decides the next action based on audit result.
 * Prioritizes the recommendation string, falls back to score-based mapping (0-100 scale).
 * @param {object} audit - Parsed audit JSON
 * @returns {'PROCEED_TRIBUNAL' | 'RETRY' | 'BLOCK' | 'HUMAN_REVIEW'}
 */
export function decideFlow(audit) {
    const rec = audit.recommendation;

    // 1. Respect Auditor string primary
    if (rec === 'BLOCK') return 'BLOCK';
    if (rec === 'RETRY') return 'RETRY';
    if (rec === 'PROCEED') return 'PROCEED_TRIBUNAL';
    if (rec === 'HUMAN_REVIEW') return 'HUMAN_REVIEW';

    // 2. Score-based fallback (0-100 scale)
    if (audit.score < 50) return 'BLOCK';
    if (audit.score >= 50 && audit.score <= 80) return 'RETRY';
    if (audit.score > 80) return 'PROCEED_TRIBUNAL';

    return 'HUMAN_REVIEW';
}


/**
 * Persists audit result to PostgreSQL and Qdrant.
 * @param {object} params
 */
export async function persistAudit({
    originalPrompt, synthesizedOutput, audit, swarmId, taskId, latencyMs,
    correlationId = null, tokensUsed = 0, costUsd = 0.0,
    pipelineVersion = 'v2.0', embeddingModelVersion = 'gemini-2.0-flash-001',
    auditorVersion = 'v1.0', thresholdPolicyVersion = 'v1.0'
}) {
    const query = `
        INSERT INTO sw2_audit_results (
            swarm_id, task_id, original_prompt, synthesized_output,
            audit_score, security_check, missed_requirements,
            qdrant_conflict, qdrant_similar_failures, confidence_delta,
            recommendation, latency_ms,
            correlation_id, tokens_used, cost_usd,
            pipeline_version, embedding_model_version, auditor_version, threshold_policy_version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id
    `;
    const values = [
        swarmId || null, taskId || null, originalPrompt, synthesizedOutput,
        audit.score || 0, audit.security_check || 'FAIL',
        JSON.stringify(audit.missed_requirements || []),
        audit.qdrant_conflict || false,
        JSON.stringify(audit.qdrant_similar_failures || []),
        audit.confidence_delta || 0, audit.recommendation || 'HUMAN_REVIEW',
        latencyMs || 0,
        correlationId || crypto.randomUUID(), tokensUsed, costUsd,
        pipelineVersion, embeddingModelVersion, auditorVersion, thresholdPolicyVersion
    ];
    // 0. Record operational metrics in memory for real-time burn-rate monitoring
    recordMissionMetrics(tokensUsed, costUsd, audit.score);

    let auditId = crypto.randomUUID(); // Placeholder if DB fails
    try {
        const result = await pool.query(query, values);
        auditId = result.rows[0].id;
    } catch (e) {
        console.error(`[Auditor] DATABASE CRITICAL ERROR during persistAudit (Failing to Memory): ${e.message}`);
        // Store in memory for later reconciliation or manual audit
        if (degradedLogBuffer.length < MAX_BUFFER_SIZE) {
            degradedLogBuffer.push({
                type: 'audit_log',
                timestamp: new Date().toISOString(),
                data: values
            });
        }
    }

    // Attempt background reconciliation if buffer has items
    if (degradedLogBuffer.length > 0) {
        reconcileDegradedLogs().catch(err => console.error('[Auditor] Background reconciliation error:', err.message));
    }

    // 2. Qdrant Memory (Long-term Audit History)
    const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
    const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
    const collection = `${process.env.QDRANT_COLLECTION_PREFIX || 'swarm_v2_'}audit-history`;

    try {
        const headers = {};
        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }


        const vector = await generateEmbedding(originalPrompt);
        await axios.put(`${QDRANT_URL}/collections/${collection}/points`, {
            points: [
                {
                    id: crypto.randomUUID(),
                    vector: vector,
                    payload: {
                        audit_id: auditId,
                        correlation_id: correlationId || values[12],

                        prompt: originalPrompt,
                        score: audit.score,
                        recommendation: audit.recommendation,
                        pipeline_version: pipelineVersion,
                        embedding_model_version: embeddingModelVersion,
                        auditor_version: auditorVersion,
                        tokens_used: tokensUsed,
                        cost_usd: costUsd,
                        timestamp: new Date().toISOString()
                    }
                }
            ]
        }, {
            timeout: 5000,
            headers
        });
    } catch (e) {
        console.error(`[Auditor] Failed to save to Qdrant memory: ${e.message}`);
    }

    return auditId;
}

/**
 * Records human feedback (👍 or 👎) with blame attribution.
 */
export async function recordFeedback({
    auditId, feedbackType, blamedAgent, blamedAgentNumber,
    blameReason, rcaResult, qdrantPointId, userComment
}) {
    const query = `
        INSERT INTO sw2_agent_feedback (
            audit_id, feedback_type, blamed_agent, blamed_agent_number,
            blame_reason, rca_result, qdrant_point_id, user_comment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    `;
    const values = [
        auditId, feedbackType, blamedAgent || null, blamedAgentNumber || null,
        blameReason || null, rcaResult ? JSON.stringify(rcaResult) : null,
        qdrantPointId || null, userComment || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0].id;
}


export async function checkCostAndStatus() {
    const query = `
        SELECT daily_limit_usd, total_cost_usd, kill_switch_active 
        FROM sw2_cost_governance 
        WHERE date = CURRENT_DATE
    `;
    try {
        const result = await pool.query(query);
        if (result.rows.length === 0) return { allowed: true, reason: 'No cost record' };

        const record = result.rows[0];
        if (record.kill_switch_active) return { allowed: false, reason: 'Kill switch active' };
        if (parseFloat(record.total_cost_usd) >= parseFloat(record.daily_limit_usd)) {
            return { allowed: false, reason: 'Daily cost limit exceeded' };
        }
        return { allowed: true };
    } catch (e) {
        console.warn(`[Governance] DB connection lost. Defaulting to ALLOWED (Survival Mode). Error: ${e.message}`);
        return { allowed: true, reason: 'Degraded connection' };
    }
}


export async function updateAndPersistMetrics(currentCost = 0.0) {
    try {
        const statsRes = await pool.query(`
            SELECT 
                COALESCE(AVG(audit_score), 0) as avg_score,
                COALESCE(STDDEV_POP(audit_score), 0) as std_dev_score
            FROM (SELECT audit_score FROM sw2_audit_results ORDER BY created_at DESC LIMIT 20) sub
        `);
        const avgScore = parseFloat(statsRes.rows[0].avg_score).toFixed(2);
        const stdDevScore = parseFloat(statsRes.rows[0].std_dev_score).toFixed(2);

        const ratesRes = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN recommendation = 'BLOCK' THEN 1 ELSE 0 END) as blocked_count,
                SUM(CASE WHEN recommendation = 'HUMAN_REVIEW' THEN 1 ELSE 0 END) as review_count
            FROM sw2_audit_results
        `);

        // Check for 15% drift drop alert
        const baselineRes = await pool.query(`
            SELECT COALESCE(AVG(audit_score), 0) as baseline 
            FROM (SELECT audit_score FROM sw2_audit_results ORDER BY created_at ASC LIMIT 50) sub
        `);
        const baselineScore = parseFloat(baselineRes.rows[0].baseline);
        const driftRatio = baselineScore > 0 ? (avgScore / baselineScore) : 1;

        if (baselineScore > 0 && driftRatio < 0.85) {
            const now = Date.now();
            if (now - lastDriftAlertTime > DRIFT_ALERT_COOLDOWN) {
                const alertMsg = `🚨 *MODEL DRIFT DETECTED*\n\n` +
                    `*Status:* CRITICAL\n` +
                    `*Current Score:* ${avgScore}\n` +
                    `*Baseline:* ${baselineScore.toFixed(2)}\n` +
                    `*Drop:* ${((1 - driftRatio) * 100).toFixed(2)}%\n` +
                    `*Impact:* Quality degradation detected in the last 20 missions.\n\n` +
                    `cc: @on-call`;

                await sendTelegramMessage(alertMsg);
                lastDriftAlertTime = now;
                console.error(`🚨 DRIFT ALERT SENT: ${avgScore} vs ${baselineScore}`);
            }
        }

        const { total, blocked_count, review_count } = ratesRes.rows[0];
        const totalNum = parseInt(total, 10) || 1;
        const blockRate = ((parseInt(blocked_count || 0, 10) / totalNum) * 100).toFixed(2);
        const reviewRate = ((parseInt(review_count || 0, 10) / totalNum) * 100).toFixed(2);

        // Update total daily cost
        const costRes = await pool.query(`
            UPDATE sw2_cost_governance 
            SET total_cost_usd = total_cost_usd + $1 
            WHERE date = CURRENT_DATE 
            RETURNING total_cost_usd, daily_limit_usd
        `, [currentCost]);
        const totalDailyCost = costRes.rows.length > 0 ? parseFloat(costRes.rows[0].total_cost_usd).toFixed(5) : 0;

        if (costRes.rows.length > 0 && parseFloat(costRes.rows[0].total_cost_usd) >= parseFloat(costRes.rows[0].daily_limit_usd)) {
            console.error('🚨 COST LIMIT EXCEEDED: Kill switch should be engaged.');
            await pool.query(`UPDATE sw2_cost_governance SET kill_switch_active = TRUE WHERE date = CURRENT_DATE`);
        }

        const insertQuery = `
            INSERT INTO sw2_audit_metrics (moving_avg_score, std_dev_score, block_rate_pct, human_review_rate_pct, total_daily_cost_usd)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const metricsResult = await pool.query(insertQuery, [avgScore, stdDevScore, blockRate, reviewRate, totalDailyCost]);
        return metricsResult.rows[0];
    } catch (e) {
        console.error('[Auditor] Failed to calculate metrics:', e.message);
        return null;
    }
}

export async function reconcileDegradedLogs() {
    if (degradedLogBuffer.length === 0) return;

    console.log(`[Auditor] Attempting to reconcile ${degradedLogBuffer.length} log items...`);
    const toReconcile = [...degradedLogBuffer];
    degradedLogBuffer.length = 0; // Clear buffer

    for (const item of toReconcile) {
        if (item.type === 'audit_log') {
            try {
                const query = `
                    INSERT INTO sw2_audit_results (
                        swarm_id, task_id, original_prompt, synthesized_output,
                        audit_score, security_check, missed_requirements,
                        qdrant_conflict, qdrant_similar_failures, confidence_delta,
                        recommendation, latency_ms,
                        correlation_id, tokens_used, cost_usd,
                        pipeline_version, embedding_model_version, auditor_version, threshold_policy_version
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `;
                await pool.query(query, item.data);
            } catch (e) {
                console.error(`[Auditor] Reconciliation failed for one item: ${e.message}`);
                // Put back in buffer
                if (degradedLogBuffer.length < MAX_BUFFER_SIZE) {
                    degradedLogBuffer.push(item);
                }
            }
        }
    }
}

export function getDegradedLogStats() {
    return {
        bufferSize: degradedLogBuffer.length,
        maxSize: MAX_BUFFER_SIZE,
        isDegraded: degradedLogBuffer.length > 0
    };
}

export { pool };
