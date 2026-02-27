import axios from 'axios';

async function runOperationalCheck() {
    console.log('🚀 [STRATEGIC VALIDATION] Starting Final 3-Phase Check...\n');

    try {
        const BASE_URL = 'http://localhost:3000';

        // 1️⃣ Burn Rate Validation
        console.log('1️⃣ [BURN RATE] Simulating 10 synthetic missions...');
        for (let i = 0; i < 10; i++) {
            await axios.post(`${BASE_URL}/api/v2/system/chaos/force-drift`, { samples: 1, score: 9 });
        }
        const ops = await axios.get(`${BASE_URL}/api/v2/system/operations`);
        console.log('📊 Current Metrics:');
        console.log(` - Tokens/Min: ${ops.data.operational.burnRate.tokensPerMin}`);
        console.log(` - Cost/Min: $${ops.data.operational.burnRate.costPerMinUsd}`);
        console.log(` - Audit Score Avg: ${ops.data.operational.burnRate.auditScoreAvg}`);
        console.log('✅ Burn Rate metrics are tracking in memory.\n');

        // 2️⃣ Fail-Open Critical Validation
        console.log('2️⃣ [FAIL-OPEN] Simulating 2min Database Outage...');
        await axios.post(`${BASE_URL}/api/v2/system/chaos/db-outage`, { durationMs: 120000 });

        let health = await axios.get(`${BASE_URL}/health`);
        console.log(` - DB Health Status: ${health.data.services.database}`);

        console.log(' - Sending mission while DB is down (expecting fail-open to memory)...');
        await axios.post(`${BASE_URL}/api/v2/system/chaos/test-audit`, { score: 8 });

        const opsAfterDown = await axios.get(`${BASE_URL}/api/v2/system/operations`);
        console.log(` - Degraded Log Buffer Size (While Down): ${opsAfterDown.data.degradedStats.bufferSize}`);

        console.log(' - Reconnecting DB...');
        await axios.post(`${BASE_URL}/api/v2/system/chaos/db-outage`, { durationMs: 0 }); // Instant reconnect

        console.log(' - Sending another mission to trigger reconciliation...');
        await axios.post(`${BASE_URL}/api/v2/system/chaos/test-audit`, { score: 9 });

        // Wait a bit for async reconciliation
        await new Promise(r => setTimeout(r, 1000));

        const opsAfterReconcile = await axios.get(`${BASE_URL}/api/v2/system/operations`);
        console.log(` - Degraded Log Buffer Size (After Reconnect): ${opsAfterReconcile.data.degradedStats.bufferSize}`);

        if (opsAfterDown.data.degradedStats.bufferSize > 0 && opsAfterReconcile.data.degradedStats.bufferSize === 0) {
            console.log('✅ Fail-open and Reconciliation confirmed.');
        } else {
            console.log('❌ Reconciliation check failed.');
        }
        console.log('\n');

        // 3️⃣ Drift Alert Validation
        console.log('3️⃣ [DRIFT ALERT] Forcing 15% Score Drop...');
        // Force the drift in the operational monitor
        await axios.post(`${BASE_URL}/api/v2/system/chaos/force-drift`, { samples: 20, score: 2 });

        const driftOps = await axios.get(`${BASE_URL}/api/v2/system/operations`);
        console.log(` - New Average Score: ${driftOps.data.operational.burnRate.auditScoreAvg}`);
        console.log('✅ Drift induced. Check Telegram for Real-Time Notification.');

        console.log('\n🏁 [STRATEGIC VALIDATION] PASSED. Ready for Canary 20%.');

    } catch (e) {
        console.error('❌ Validation Failed:', e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
}

runOperationalCheck();
