/**
 * Operational Monitor & CSC Tracking
 * Implements Concurrency Stress Coefficient (CSC) monitoring.
 * CSC = (Current P95 Latency) / (Baseline P95 Latency).
 * Target CSC <= 1.25 for scaling.
 */

import db from './db-client.js';


const BASELINE_P95 = 25000;

// Internal state for LER and Tier Analysis
let tierStats = {
    1: { count: 0, escalations: 0, total_tpms: 0, total_te: 0 },
    2: { count: 0, total_tpms: 0, total_te: 0 },
    3: { count: 0, total_tpms: 0, total_te: 0 }
};

export async function recordMissionMetrics(tokensUsed, tokensOutput, score, latencyMs, tier = 2, escalated = false) {
    try {
        const csc = latencyMs / BASELINE_P95;

        // 1. TPMS (Tokens Per Mission Score) - Lower is better efficiency
        const tpms = score > 0 ? tokensUsed / score : tokensUsed;

        // 2. Throughput Efficiency (Score / Latency) - Higher is better value/sec
        const throughputEfficiency = latencyMs > 0 ? score / (latencyMs / 1000) : 0;

        // Update In-Memory Tier Stats
        if (tierStats[tier]) {
            tierStats[tier].count++;
            tierStats[tier].total_tpms += tpms;
            tierStats[tier].total_te += throughputEfficiency;
            if (escalated && tier === 1) tierStats[1].escalations++;
        }

        // Persist to telemetry table
        await db.query(`
            INSERT INTO sw2_performance_metrics 
            (tokens_used, tokens_output, audit_score, latency_ms, csc, tpms, throughput_efficiency, tier, escalated, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [tokensUsed, tokensOutput, score, latencyMs, csc, tpms, throughputEfficiency, tier, escalated]);

        if (csc > 1.25) {
            console.warn(`⚠️ [CSC-ALERT] Pressure: ${csc.toFixed(2)}`);
        }
    } catch (e) {
        console.log(`[Metrics-Survival] Tier: ${tier}, Score: ${score}, Latency: ${latencyMs}ms`);
    }
}

export function getTierReport() {
    const report = {};
    const totalCount = Object.values(tierStats).reduce((a, b) => a + b.count, 0);

    for (const [tier, data] of Object.entries(tierStats)) {
        report[`tier${tier}`] = {
            distribution: totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(1) + '%' : '0%',
            avg_tpms: data.count > 0 ? (data.total_tpms / data.count).toFixed(2) : 0,
            avg_te: data.count > 0 ? (data.total_te / data.count).toFixed(2) : 0
        };
    }

    const ler = tierStats[1].count > 0 ? (tierStats[1].escalations / tierStats[1].count) * 100 : 0;
    return { ...report, LER: ler.toFixed(1) + '%' };
}

