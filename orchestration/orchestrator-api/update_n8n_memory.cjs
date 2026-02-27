
const axios = require('axios');
require('dotenv').config();

async function update() {
    const workflowId = 'I3GRws1KTRTvQevh';
    const url = `${process.env.N8N_API_URL}/workflows/${workflowId}`;
    const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };

    try {
        const res = await axios.get(url, { headers });
        const workflow = res.data;

        // 1. Update Agent 1: Analyst
        const analyst = workflow.nodes.find(n => n.name === 'Agent 1: Analyst');
        if (analyst) {
            let body = JSON.parse(analyst.parameters.jsonBody);
            body.messages[0].content = "You are the Deep Analyst. Break down the problem into atomic parts.\n\n" +
                "HISTORICAL FAILURE MEMORY: {{ $node['Webhook'].json['body']['historicalMemory'] || 'None recorded for this pattern.' }}\n" +
                "If memory shows a previous BLOCK or RETRY for a similar prompt, identify the specific pitfall early.";
            analyst.parameters.jsonBody = JSON.stringify(body, null, 2);
        }

        // 2. Update Agent 2: Architect
        const architect = workflow.nodes.find(n => n.name === 'Agent 2: Architect');
        if (architect) {
            let body = JSON.parse(architect.parameters.jsonBody);
            body.messages[0].content = "You are the Architect. Create a modular data and UI structure.\n\n" +
                "HISTORICAL FAILURE MEMORY: {{ $node['Webhook'].json['body']['historicalMemory'] || 'None recorded.' }}\n" +
                "Use this memory to avoid flawed design patterns that were previously rejected by the Auditor.";
            architect.parameters.jsonBody = JSON.stringify(body, null, 2);
        }

        // Clean payload: remove EVERYTHING not in the whitelist
        const allowed = ['name', 'nodes', 'connections', 'settings', 'staticData', 'meta', 'tags', 'pinData'];
        const payload = {};
        allowed.forEach(k => { if (workflow[k] !== undefined) payload[k] = workflow[k]; });

        try {
            await axios.put(url, payload, { headers });
            console.log('✅ n8n workflow updated with Intelligence Memory injects.');
        } catch (e) {
            console.error('Update failed:', e.response?.data || e.message);
            // If it still fails, try without meta and staticData
            delete payload.meta;
            delete payload.staticData;
            await axios.put(url, payload, { headers });
            console.log('✅ n8n workflow updated (fallback payload).');
        }
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}
update();
