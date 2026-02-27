import axios from 'axios';
import crypto from 'crypto';

async function testFailover() {
    const VALID_UUID = crypto.randomUUID();
    console.log(`🚀 [FAILOVER TEST] Target ID: ${VALID_UUID}`);

    try {
        console.log('--- Phase 1: Checking health ---');
        const health = await axios.get('http://localhost:3000/api/v2/system/health');
        console.log('Server Status:', health.data.status);

        console.log('\n--- Phase 2: Testing Persistence Fail-Open ---');
        console.log('This will attempt to trigger a DB persistence via a swarm replay.');
        console.log('Even if the swarm ID does not exist in the DB, the auditor logic should handle the fail-open.');

        const res = await axios.post(`http://localhost:3000/api/v2/swarms/${VALID_UUID}/replay`, {
            origin: '127.0.0.1'
        });

        console.log('Response Status:', res.status);
        console.log('Accepted:', res.data.accepted ? '✅ YES' : '❌ NO');
        console.log('If accepted is true, it means the orchestrator accepted the task despite potential DB audit logging failures.');

    } catch (e) {
        console.error('❌ Failover Test Failed:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Error Data:', e.response.data);
        }
    }
}

testFailover();
