import fs from 'fs';

const filePath = 'c:/Users/User/Desktop/getxobelaeskola/orchestration/n8n-workflows/Pipeline_5_Agentes.json';
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const QDRANT_API_KEY = 'maestro_seguro_qdrant_2026';

// Update nodes in the main object
workflow.nodes.forEach(node => {
    if (node.id === 'qdrant-audit-fetch' || node.id === 'qdrant-audit-store') {
        node.parameters.sendHeaders = true;
        node.parameters.headerParameters = {
            parameters: [
                {
                    name: "api-key",
                    value: QDRANT_API_KEY
                }
            ]
        };

        // Also fix the vector size if it was [0.0]
        if (node.parameters.jsonBody.includes('"vector": [0.0]')) {
            const dummyVector = Array(1536).fill(0).map(() => 0.001).join(', ');
            node.parameters.jsonBody = node.parameters.jsonBody.replace('"vector": [0.0]', `"vector": [${dummyVector}]`);
        }
    }
});

// Update nodes in the activeVersion object
if (workflow.activeVersion && workflow.activeVersion.nodes) {
    workflow.activeVersion.nodes.forEach(node => {
        if (node.id === 'qdrant-audit-fetch' || node.id === 'qdrant-audit-store') {
            node.parameters.sendHeaders = true;
            node.parameters.headerParameters = {
                parameters: [
                    {
                        name: "api-key",
                        value: QDRANT_API_KEY
                    }
                ]
            };
            if (node.parameters.jsonBody.includes('"vector": [0.0]')) {
                const dummyVector = Array(1536).fill(0).map(() => 0.001).join(', ');
                node.parameters.jsonBody = node.parameters.jsonBody.replace('"vector": [0.0]', `"vector": [${dummyVector}]`);
            }
        }
    });
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
console.log('✅ n8n workflow Qdrant auth & vector size fixed.');
