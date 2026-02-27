
const axios = require('axios');
require('dotenv').config();

async function update() {
    const workflowId = 'I3GRws1KTRTvQevh';
    const url = `${process.env.N8N_API_URL}/workflows/${workflowId}`;
    const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };

    try {
        const res = await axios.get(url, { headers });
        const workflow = res.data;

        // Surgical Update of Nodes
        workflow.nodes.forEach(node => {
            if (node.name === 'Agent 1: Analyst') {
                node.parameters.jsonBody = JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        { role: "system", content: "You are the Deep Analyst. Break down the problem into atomic parts.\n\nADVISORY MEMORY: {{ $node['Webhook'].json['body']['historicalMemory'] || 'No historical failures detected.' }}\nIf memory warns of a previous BLOCK/RETRY, identify it early." },
                        { role: "user", content: "Analyze the core problem: {{ $node['Webhook'].json['body']['prompt'] }}" }
                    ]
                }, null, 2);
            }
            if (node.name === 'Agent 2: Architect') {
                node.parameters.jsonBody = JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        { role: "system", content: "You are the Architect. Create a modular data and UI structure.\n\nADVISORY MEMORY: {{ $node['Webhook'].json['body']['historicalMemory'] || 'None.' }}\nUse this context to avoid repeating known architectural flaws." },
                        { role: "user", content: "Based on this analysis: {{ $node['Agent 1: Analyst'].json['choices'][0]['message']['content'] }}, design a solution for: {{ $node['Webhook'].json['body']['prompt'] }}" }
                    ]
                }, null, 2);
            }
        });

        const payload = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings
        };

        await axios.put(url, payload, { headers });
        console.log('✅ n8n workflow updated with Advisory injections.');
    } catch (e) {
        console.error('Update failed:', e.response?.data || e.message);
    }
}
update();
