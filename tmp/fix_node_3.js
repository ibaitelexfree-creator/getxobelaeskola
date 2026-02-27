import fs from 'fs';

const N8N_URL = 'https://n8n.srv1368175.hstgr.cloud/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYmY3NGMyNS0yMTNjLTQ2YjktYTYzYi1lMzQ5ZGUwMjE5NWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmJiMDEyMWUtNDc0Yi00NTIyLWI3MWMtMWJhZTZkZGRmYmMzIiwiaWF0IjoxNzcyMDkxNjE3fQ.sXFkMQMerkFpR6cnmliYVR25yumpL92A8Yy_6Pu9rnI';
const WORKFLOW_ID = '40AUNe77gzCV02QA';

async function updateWorkflow() {
    console.log(`Fetching workflow ${WORKFLOW_ID}...`);
    const getRes = await fetch(`${N8N_URL}/workflows/${WORKFLOW_ID}`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    const workflow = await getRes.json();

    // Find node "HTTP Request1"
    const node = workflow.nodes.find(n => n.name === 'HTTP Request1');
    if (node) {
        console.log('Found HTTP Request1, updating...');

        // Correct structure for /api/v1/sessions as per index.js
        node.parameters.jsonBody = JSON.stringify({
            parameters: [
                {
                    name: "task",
                    value: "={{$node['Webhook'].json['body']['original_prompt']}} - Rol: {{$json['role']}}"
                },
                {
                    name: "account",
                    value: "={{$json['account']}}"
                },
                {
                    name: "title",
                    value: "={{$json['role']}} Task from Swarm"
                }
            ]
        }, null, 2);
    }

    // Also check Split Out just in case
    const splitNode = workflow.nodes.find(n => n.name === 'Split Out');
    if (splitNode) {
        splitNode.parameters.fieldToSplitOut = 'body.proposal';
    }

    console.log('Pushing updated workflow...');
    const putRes = await fetch(`${N8N_URL}/workflows/${WORKFLOW_ID}`, {
        method: 'PUT',
        headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: {}
        })
    });

    const result = await putRes.json();
    console.log('Result:', JSON.stringify(result, null, 2));
}

updateWorkflow();
