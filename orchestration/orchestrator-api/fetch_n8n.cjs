
const axios = require('axios');
require('dotenv').config();

async function fetchWorkflow() {
    const workflowId = 'I3GRws1KTRTvQevh';
    const url = `${process.env.N8N_API_URL}/workflows/${workflowId}`;
    const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };

    try {
        const response = await axios.get(url, { headers });
        require('fs').writeFileSync('n8n_workflow_v2.json', JSON.stringify(response.data, null, 2));
        console.log('Workflow saved to n8n_workflow_v2.json');
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}
fetchWorkflow();
