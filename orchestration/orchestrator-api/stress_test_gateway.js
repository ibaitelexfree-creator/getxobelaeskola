import axios from 'axios';

const API_URL = 'http://localhost:3000';
const DURATION_MS = 300000; // 5 minutes for trending demo
const CONCURRENCY = 3;

async function runStress() {
    console.log(`🚀 [STRESS] Starting Fatiga Test (${DURATION_MS / 1000}s) - Concurrency: ${CONCURRENCY}\n`);

    const startTime = Date.now();
    let stats = {
        requests: 0,
        errors: 0,
        chaos_results: {}
    };

    const interval = setInterval(async () => {
        try {
            const health = await axios.get(`${API_URL}/api/v2/system/health`);
            const h = health.data.node;
            console.log(`📊 [TELEMETRY] Heap: ${h.memory.current.toFixed(2)}MB (Trend: ${h.memory.trend.toFixed(4)} MB/m) | Lag p95: ${h.lag.p95}ms | Drift: ${health.data.drift_pct}%`);
        } catch (e) {
            console.error('❌ Telemetry Error');
        }
    }, 10000);

    const worker = async () => {
        while (Date.now() - startTime < DURATION_MS) {
            const types = ['semantic_ambiguity', 'token_flood', 'manifest_tamper', 'gateway_blackout', 'qdrant_offline'];
            const type = types[Math.floor(Math.random() * types.length)];

            try {
                const res = await axios.post(`${API_URL}/api/v2/chaos/run`, { type });
                stats.requests++;
                stats.chaos_results[res.data.result.status] = (stats.chaos_results[res.data.result.status] || 0) + 1;
            } catch (e) {
                stats.errors++;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    };

    const workers = Array(CONCURRENCY).fill(0).map(() => worker());
    await Promise.all(workers);

    clearInterval(interval);
    console.log('\n🏁 [STRESS] Fatigue Test Finished.');
    console.log('Final Stats:', JSON.stringify(stats, null, 2));

    try {
        const rateCheck = await axios.get(`${API_URL}/api/v2/metrics`); // We check metrics endpoint for rate blocks
        console.log('📈 [RATE GUARD] Check block counts/governance in Control Room or metrics endpoint.');
    } catch (e) { }
}

runStress();
