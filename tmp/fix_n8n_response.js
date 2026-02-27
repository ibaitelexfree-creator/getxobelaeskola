import fs from 'fs';

const filePath = 'c:/Users/User/Desktop/getxobelaeskola/orchestration/n8n-workflows/Pipeline_5_Agentes.json';
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Ensure Agent 6 is correctly connected to Respondent
// Current path: ... -> Agent 6 -> Qdrant Store -> Response
// We want: ... -> Agent 6 -> Response
// AND Qdrant Store can be a parallel branch or placed after, but the Respondent must receive Agent 6.

// Change Respond to Webhook to respond with only the first item (Agent 6 output)
const responseNode = workflow.nodes.find(n => n.id === 'response-node');
if (responseNode) {
    responseNode.parameters.respondWith = 'firstItem';
}

// Ensure Agent 6 connects to Response
workflow.connections['Agent 6: Auditor'] = {
    main: [
        [
            {
                node: "Respond to Webhook",
                type: "main",
                index: 0
            },
            {
                node: "Qdrant: Store Audit Memory",
                type: "main",
                index: 0
            }
        ]
    ]
};

// Remove Qdrant Store -> Response connection to avoid duplicate/confusing triggers
if (workflow.connections['Qdrant: Store Audit Memory']) {
    delete workflow.connections['Qdrant: Store Audit Memory'];
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
console.log('✅ n8n workflow response logic fixed.');
