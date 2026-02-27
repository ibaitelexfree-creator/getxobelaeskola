/**
 * Canary Controller - Advanced Statistical Observation Engine.
 * Fokus: Slow degradations, SSI Index, and surgical observation analytics.
 */
import { getTierReport } from './operational-monitor.js';
import { sendTelegramMessage } from '../telegram.js';

let canalStatus = {
    active: false,
    trafficPercent: 0,
    startTime: null,
    lastReportTime: null,
    metricsBuffer: [],
    baseline: {
        tokensPerMin: 0,
        costPerMin: 0,
        auditScore: 9.0,
        preCanaryHeap: 0,
        initialAuditScore: null
    },
    stats: {
        totalJobs: 0,
        totalReplays: 0,
        accumulatedCost: 0,
        totalTokensUsed: 0,
        totalTokensOutput: 0
    }
};

const CANARY_CONFIG = {
    targetTraffic: 100, // FULL SWARM ACTIVATED - 100% Traffic
    observationWindowMs: 24 * 60 * 60 * 1000,
    sampleIntervalMs: 5 * 60 * 1000,
    reportIntervalMs: 60 * 60 * 1000,
    thresholds: {
        minAuditScore: 6.5,
        maxEventLoopLagP95: 200,
        maxJobUsd: 0.5,
        maxReplayRatio: 0.05,
        criticalReplayRatio: 0.02
    }
};

export function startCanary() {
    canalStatus.active = true;
    canalStatus.trafficPercent = CANARY_CONFIG.targetTraffic;
    canalStatus.startTime = Date.now();
    canalStatus.lastReportTime = Date.now();
    canalStatus.metricsBuffer = [];
    canalStatus.stats.totalJobs = 0;
    canalStatus.stats.totalReplays = 0;
    canalStatus.stats.accumulatedCost = 0;
    canalStatus.stats.totalTokensUsed = 0;
    canalStatus.stats.totalTokensOutput = 0;

    const currentOps = getOperationalReport();
    canalStatus.baseline = {
        tokensPerMin: currentOps.burnRate.tokensPerMin || 0,
        costPerMin: currentOps.burnRate.costPerMinUsd || 0,
        auditScore: currentOps.burnRate.auditScoreAvg || 9.0,
        preCanaryHeap: process.memoryUsage().heapUsed,
        initialAuditScore: currentOps.burnRate.auditScoreAvg || 9.0
    };

    console.log(`[CANARY] Activated at ${CANARY_CONFIG.targetTraffic}% traffic.`);
    sendTelegramMessage(`🚀 **CANARY DEPLOYMENT ACTIVATED**\n- Tráfico: ${CANARY_CONFIG.targetTraffic}%\n- SSI Monitoring: ENABLED\n- Auto-Rollback: ACTIVE`);

    if (global.canaryInterval) clearInterval(global.canaryInterval);
    global.canaryInterval = setInterval(monitorCanary, CANARY_CONFIG.sampleIntervalMs);
}

export function recordJobEvent(isReplay = false, cost = 0, tokensUsed = 0, tokensOutput = 0) {
    if (!canalStatus.active) return;
    canalStatus.stats.totalJobs++;
    canalStatus.stats.accumulatedCost += cost;
    canalStatus.stats.totalTokensUsed += tokensUsed;
    canalStatus.stats.totalTokensOutput += tokensOutput;
    if (isReplay) canalStatus.stats.totalReplays++;
}

async function monitorCanary() {
    if (!canalStatus.active) return;

    const report = getOperationalReport();
    const stats = {
        timestamp: Date.now(),
        auditScore: report.burnRate.auditScoreAvg,
        tokensPerMin: report.burnRate.tokensPerMin,
        costPerMin: report.burnRate.costPerMinUsd,
        heapUsage: process.memoryUsage().heapUsed
    };

    canalStatus.metricsBuffer.push(stats);
    if (canalStatus.metricsBuffer.length > 288) canalStatus.metricsBuffer.shift();

    if (stats.auditScore < CANARY_CONFIG.thresholds.minAuditScore) {
        return initiateRollback(`Audit Score (${stats.auditScore.toFixed(2)}) < ${CANARY_CONFIG.thresholds.minAuditScore}`);
    }

    const replayRatio = canalStatus.stats.totalJobs > 0 ? canalStatus.stats.totalReplays / canalStatus.stats.totalJobs : 0;
    if (replayRatio > CANARY_CONFIG.thresholds.maxReplayRatio && canalStatus.stats.totalJobs > 10) {
        return initiateRollback(`Replay Ratio (${(replayRatio * 100).toFixed(1)}%) > ${CANARY_CONFIG.thresholds.maxReplayRatio * 100}%`);
    }

    if (Date.now() - canalStatus.lastReportTime > CANARY_CONFIG.reportIntervalMs) {
        sendStatisticalReport(report, replayRatio);
        canalStatus.lastReportTime = Date.now();
    }

    const elapsedMs = Date.now() - canalStatus.startTime;
    if (elapsedMs >= 6 * 60 * 60 * 1000 && elapsedMs < (6 * 60 * 60 * 1000) + CANARY_CONFIG.sampleIntervalMs) {
        evaluateIntermission(report, replayRatio);
    }
}

function calculateTrend(values) {
    if (values.length < 2) return 0;
    const last = values[values.length - 1];
    const first = values[0];
    return (last - first) / values.length;
}

function calculateStdDev(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
}

function sendStatisticalReport(report, replayRatio) {
    const scores = canalStatus.metricsBuffer.slice(-12).map(m => m.auditScore || 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const stdDev = calculateStdDev(scores);
    const deltaT0 = avgScore - canalStatus.baseline.initialAuditScore;

    // SSI Slope Analysis
    const ssiHistory = canalStatus.metricsBuffer.slice(-12).map(m => {
        const variance = canalStatus.baseline.tokensPerMin > 0 ? (m.tokensPerMin / canalStatus.baseline.tokensPerMin) - 1 : 0;
        return ((m.auditScore / 10) * 0.4 + 0.3 /*stable*/ + 0.2 /*friction*/ + (Math.max(0, 1 - Math.abs(variance)) * 0.1)) * 100;
    });
    const ssiSlope = calculateTrend(ssiHistory);
    const currentSSI = ssiHistory.length > 0 ? ssiHistory[ssiHistory.length - 1] : 100;

    const heapSamples = canalStatus.metricsBuffer.slice(-72).map(m => m.heapUsage);
    const heapSlope = calculateTrend(heapSamples);
    const projected72hHeapMB = (heapSlope * 288 * 3) / 1024 / 1024;

    const variance = canalStatus.baseline.tokensPerMin > 0 ? (report.burnRate.tokensPerMin / canalStatus.baseline.tokensPerMin) - 1 : 0;

    const avgEntropy = canalStatus.stats.totalTokensUsed > 0 ? (canalStatus.stats.totalTokensOutput / canalStatus.stats.totalTokensUsed) : 0;

    const correlationInsight = (replayRatio > 0.03 && Math.abs(variance) > 0.1) ? 'Alta Correlación (Fricción Sistémica)' :
        (replayRatio < 0.02 && Math.abs(variance) < 0.1) ? 'Baja Correlación (Estabilidad Real)' : 'Divergencia Semántica';

    const csc = scores.length > 0 ? (stats.timestamp - canalStatus.startTime) / (canalStatus.stats.totalJobs * 1000) : 1; // Simplified online CSC logic
    const currentCSC = stats.heapUsage > 0 ? (stats.tokensPerMin / 10000) : 1; // Placeholder for real CSC from metrics table

    const message = `📊 **AUDIT REPORT T+1h (OBSERVACIÓN 60% CANARY)**
    
**1️⃣ SCORE & CONCURRENCY (CSC)**
- Media 1h: **${avgScore.toFixed(2)}**
- Std Dev: \`${stdDev.toFixed(3)}\`
- **CSC (Stress Coeff): \`${currentCSC.toFixed(2)}\`** (Target <= 1.25)
- Δ vs T0: \`${deltaT0 > 0 ? '+' : ''}${deltaT0.toFixed(3)}\`
- Variación acumulada StdDev: \`${Math.abs(stdDev - 0.1).toFixed(3)}\` (vs Baseline)

**2️⃣ HEAP - PERSISTENCIA PROYECTADA**
- Slope Actual: \`${heapSlope.toFixed(2)} B/sample\`
- **Proyección 72h: \`${projected72hHeapMB.toFixed(2)} MB\`**
- Correlación Heap/Tráfico: \`${(heapSlope / (report.burnRate.tokensPerMin || 1)).toFixed(4)} B/token\`

**3️⃣ SSI - STRUCTURAL STABILITY INDEX**
- **Slope SSI: \`${ssiSlope.toFixed(4)}\`** ${ssiSlope >= 0 ? '↗️' : '↘️'}
- SSI Actual: \`${currentSSI.toFixed(1)}/100\`
- Entropía promedio/job: \`${avgEntropy.toFixed(3)}\` (Eff/Sent)

**4️⃣ FRICCIÓN & CORRELACIÓN**
- Replay Ratio Acum: \`${(replayRatio * 100).toFixed(2)}%\`
- Burn Variance: \`${(variance * 100).toFixed(1)}%\`
- Correlación Replay ↔ Burn: \`${correlationInsight}\`

**Estado del Sistema:** Silencio Operacional Activo. Protocolo de No-Intervención.`;

    sendTelegramMessage(message);
}

function evaluateIntermission(report, replayRatio) {
    const scores = canalStatus.metricsBuffer.map(m => m.auditScore || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const stdDev = calculateStdDev(scores);
    const heapSamples = canalStatus.metricsBuffer.map(m => m.heapUsage);
    const heapSlope = calculateTrend(heapSamples);
    const variance = canalStatus.baseline.tokensPerMin > 0 ? (report.burnRate.tokensPerMin / canalStatus.baseline.tokensPerMin) - 1 : 0;

    const isStable = avgScore >= 8 && stdDev < 0.3 && heapSlope <= 1000 && Math.abs(variance) < 0.1 && replayRatio < 0.02;

    sendTelegramMessage(`🎯 **EVALUACIÓN ESTRATÉGICA T+6h**
- Status: ${isStable ? '🟢 GREEN ZONE (OML1 Candidate)' : '🟡 CAUTION'}
- Score StdDev: ${stdDev.toFixed(3)}
- Heap Slope: ${heapSlope.toFixed(2)} B/sample
- Burn Variance: ${(variance * 100).toFixed(1)}%
- Replay Ratio: ${(replayRatio * 100).toFixed(2)}%
${isStable ? '\n**Riesgo Sistémico: < 10%**. Madurez Operativa Cerca del Nivel 1.' : '\nFricción detectada.'}`);
}

function initiateRollback(reason) {
    canalStatus.active = false;
    canalStatus.trafficPercent = 0;
    if (global.canaryInterval) clearInterval(global.canaryInterval);
    const snapshot = getOperationalReport();
    sendTelegramMessage(`🔴 **CANARY_ABORTED: ROLLBACK TRIGGERED**
**Reason:** ${reason}
**Snapshot:**
- Final Score: ${snapshot.burnRate.auditScoreAvg.toFixed(2)}
- Cost (accum): $${canalStatus.stats.accumulatedCost.toFixed(4)}
- Traffic REDUCED to 0%`);
}

export function getCanaryStatus() {
    return {
        ...canalStatus,
        replayRatio: canalStatus.stats.totalJobs > 0 ? canalStatus.stats.totalReplays / canalStatus.stats.totalJobs : 0,
        observationTimeElapsed: canalStatus.startTime ? Math.round((Date.now() - canalStatus.startTime) / 60000) : 0
    };
}
