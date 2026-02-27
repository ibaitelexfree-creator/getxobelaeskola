import axios from 'axios';

async function testReplay() {
    try {
        console.log('--- TEST: POST /api/v2/swarms/:id/replay ---');
        // Fetch recent swarm
        const listRes = await axios.get('http://localhost:3000/api/v2/swarms');

        if (listRes.data.length === 0) {
            console.log('No swarms found. Create one first to test replay.');
            return;
        }

        const swarmId = listRes.data[0].id;
        console.log(`📡 Selected Swarm ID: ${swarmId}`);

        const replayRes = await axios.post(`http://localhost:3000/api/v2/swarms/${swarmId}/replay`);
        console.log(`✅ Replay response:`, replayRes.data);
    } catch (e) {
        console.error('❌ Replay error:', e.message);
    }
}

testReplay();
