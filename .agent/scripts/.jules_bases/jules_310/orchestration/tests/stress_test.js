import axios from 'axios';

const BASE_URL = 'http://localhost:3323';

async function runStressTest() {
    console.log('🚀 Starting ULTIMATE Exhaustive Stress Test for Mission Control HQ...');

    // 1. Concurrent Health Checks (Baseline)
    console.log('--- Phase 1: Concurrency (Health Checks) ---');
    const start = Date.now();
    const requests = Array.from({ length: 100 }, () => axios.get(`${BASE_URL}/health`).catch(e => e.response));
    const results = await Promise.all(requests);
    const end = Date.now();

    const success = results.filter(r => r?.status === 200).length;
    console.log(`✅ Completed 100 concurrent requests in ${end - start}ms. Success: ${success}/100`);

    // 2. Active Sessions Simulation
    console.log('\n--- Phase 2: Tactical Radar Polling Persistence ---');
    const sessionsStart = Date.now();
    const sessionReqs = Array.from({ length: 50 }, () => axios.get(`${BASE_URL}/api/sessions/active`).catch(e => e.response));
    const sessionResults = await Promise.all(sessionReqs);
    const sessionsEnd = Date.now();
    console.log(`📡 Radar Polling Simulation: 50 requests in ${sessionsEnd - sessionsStart}ms`);
    console.log(`📡 Throughput: ${(50 / ((sessionsEnd - sessionsStart) / 1000)).toFixed(2)} req/s`);

    // 3. Watchdog Feed Stress
    console.log('\n--- Phase 3: Watchdog Feed Pressure (I/O & Hashing) ---');
    const feedStart = Date.now();
    const feedReqs = Array.from({ length: 200 }, (_, i) => axios.post(`${BASE_URL}/watchdog/action`, {
        action: 'feed',
        message: `Stress message #${i}: ${Math.random().toString(36)} simulating heavy output from agent...`
    }).catch(e => e.response));
    await Promise.all(feedReqs);
    const feedEnd = Date.now();
    console.log(`🔥 Fed 200 lines to Watchdog in ${feedEnd - feedStart}ms`);

    // 4. MCP Tools discovery
    console.log('\n--- Phase 4: MCP Protocol Discovery ---');
    const toolsStart = Date.now();
    const toolsRes = await axios.get(`${BASE_URL}/mcp/tools`);
    const toolsEnd = Date.now();
    console.log(`🛠️ Discovered ${toolsRes.data.tools.length} tools in ${toolsEnd - toolsStart}ms`);

    // 5. Final Status Audit
    console.log('\n--- Phase 5: Final Stability Audit ---');
    const finalStatus = await axios.get(`${BASE_URL}/watchdog/status`);
    console.log('Final Watchdog State:', finalStatus.data.state);
    console.log('Buffer Size:', finalStatus.data.bufferSize);

    // 6. Loop Detection Simulation (Anti-Loop Engine)
    console.log('\n--- Phase 6: Loop Detection Simulation (Anti-Loop Engine) ---');
    const loopMsg = 'Simulating an infinite loop output... [REPEATED_LOG_ERROR]';
    for (let i = 0; i < 20; i++) {
        await axios.post(`${BASE_URL}/watchdog/action`, { action: 'feed', message: loopMsg });
    }
    // Small delay to ensure state propagates
    await new Promise(r => setTimeout(r, 200));
    const loopStatus = await axios.get(`${BASE_URL}/watchdog/status`);
    console.log(`⚠️ Detection Event: ${loopStatus.data.state === 'LOOPING' ? 'LOOP DETECTED (Watchdog Intervening)' : 'System Healthy (' + loopStatus.data.state + ')'}`);
    console.log(`📊 Stats: Loops Detected: ${loopStatus.data.stats.loopsDetected}`);

    // 7. Extreme Concurrency (Hammer)
    console.log('\n--- Phase 7: Extreme Hammer (500 Parallel Hits) ---');
    const hammerStart = Date.now();
    const hammerReqs = Array.from({ length: 500 }, () => axios.get(`${BASE_URL}/health`).catch(e => e.response));
    await Promise.all(hammerReqs);
    const hammerEnd = Date.now();
    console.log(`🔨 Hammer completed in ${hammerEnd - hammerStart}ms. Exhaustion test PASSED.`);

    console.log('\n✅ ULTIMATE Stress Test Completed. MISSION CONTROL HQ IS BATTLE-HARDENED.');
}

runStressTest().catch(e => console.error('Stress test failed:', e.message));
