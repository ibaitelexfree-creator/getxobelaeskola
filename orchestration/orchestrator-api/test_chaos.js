import axios from 'axios';

async function runTests() {
    const tests = [
        'semantic_ambiguity',
        'token_flood',
        'manifest_tamper',
        'gateway_blackout',
        'qdrant_offline'
    ];

    console.log('🧨 Iniciando Control Chaos Suite 🧨\n');

    for (const t of tests) {
        try {
            const res = await axios.post('http://localhost:3000/api/v2/chaos/run', { type: t });
            console.log(`✅ [${t}] - STATUS: ${res.data.result.status} | Latency: ${res.data.result.time_to_fail_ms}ms`);
            if (t === 'token_flood') console.log(`   ↳ Kill Switch Active: ${res.data.result.kill_switch_active}`);
            if (t === 'manifest_tamper') console.log(`   ↳ Tamper Detected: ${res.data.result.tamper_detected}`);
        } catch (e) {
            console.log(`❌ [${t}] - FAILED Request: ${e.response?.data?.error || e.message}`);
        }
    }
}

runTests();
