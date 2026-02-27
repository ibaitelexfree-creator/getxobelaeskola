
const axios = require('axios');
require('dotenv').config();

async function update() {
    const workflowId = 'I3GRws1KTRTvQevh';
    const url = `${process.env.N8N_API_URL}/workflows/${workflowId}`;
    const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };

    try {
        const res = await axios.get(url, { headers });
        const workflow = res.data;

        // Try updating ONLY name as a test
        const originalName = workflow.name;
        workflow.name = originalName + " (Updated)";

        try {
            await axios.put(url, { name: workflow.name, nodes: workflow.nodes, connections: workflow.connections }, { headers });
            console.log('✅ Name update test passed.');
            // Restore name
            await axios.put(url, { name: originalName, nodes: workflow.nodes, connections: workflow.connections }, { headers });
        } catch (e) {
            console.error('Test update failed:', e.response?.data || e.message);
        }
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}
update();
