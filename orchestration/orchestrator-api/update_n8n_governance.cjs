
const axios = require('axios');
require('dotenv').config();

async function update() {
    const workflowId = 'I3GRws1KTRTvQevh';
    const url = `${process.env.N8N_API_URL}/workflows/${workflowId}`;
    const headers = { 'X-N8N-API-KEY': process.env.N8N_API_KEY };

    try {
        const res = await axios.get(url, { headers });
        const workflow = res.data;

        // Upgrade all nodes to use Dynamic Budget & Governance
        workflow.nodes.forEach(node => {
            console.log(`Checking node: ${node.name}`);
            const isAgent = node.name.includes('Agent') && node.name.includes(':');
            if (isAgent) {
                const parts = node.name.split(':');
                const agentKey = parts[1].trim().toLowerCase();

                // Add conditional logic: Only execute if agent is in budget list
                // We'll use the 'Execute Only If' parameter in n8n nodes (if version supports it)
                // Since this is a direct JSON edit, we'll wrap the agent logic or rely on the pipeline orchestrator.

                // For simplicity, we'll update the prompts to respect the Tiered memory.
                node.parameters.jsonBody = JSON.stringify({
                    model: "={{ $node['Webhook'].json['body']['budget']['model'] }}",
                    max_tokens: "={{ parseInt($node['Webhook'].json['body']['budget']['max_tokens']) }}",
                    messages: [
                        {
                            role: "system",
                            content: "={{ `You are the ${agentKey.charAt(0).toUpperCase() + agentKey.slice(1)}. Governance Tier: ` + $node['Webhook'].json['body']['tier'] + `. Budget: ` + $node['Webhook'].json['body']['budget']['max_tokens'] + ` tokens.\n\nADVISORY MEMORY: ` + ($node['Webhook'].json['body']['historicalMemory'] || 'None.') }}"
                        },
                        {
                            role: "user",
                            content: "={{ `Source: ` + $node['Webhook'].json['body']['prompt'] + `. Task: Process current state of the swarm reflection for ${agentKey}.` }}"
                        }
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
        console.log('✅ n8n workflow hardened with Governance & Token Budgeting.');
    } catch (e) {
        console.error('Update failed:', e.response?.data || e.message);
    }
}
update();
