import fs from 'fs';

const filePath = 'c:/Users/User/Desktop/getxobelaeskola/orchestration/n8n-workflows/Pipeline_5_Agentes.json';
const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Find the auditor node and update its system prompt to include the instruction
const auditorNode = workflow.nodes.find(n => n.id === 'auditor-node');
if (auditorNode) {
    let jsonBody = JSON.parse(auditorNode.parameters.jsonBody);
    jsonBody.messages[0].content = jsonBody.messages[0].content.replace(
        'RESPOND ONLY with this exact JSON schema:\n{',
        'RESPOND ONLY with this exact JSON schema:\n{\n  "instruction": "<copy exactly the synthesized instruction here>",'
    );
    auditorNode.parameters.jsonBody = JSON.stringify(jsonBody, null, 2);
}

// Do the same for activeVersion if it exists
if (workflow.activeVersion && workflow.activeVersion.nodes) {
    const activeAuditorNode = workflow.activeVersion.nodes.find(n => n.id === 'auditor-node');
    if (activeAuditorNode) {
        let jsonBody = JSON.parse(activeAuditorNode.parameters.jsonBody);
        jsonBody.messages[0].content = jsonBody.messages[0].content.replace(
            'RESPOND ONLY with this exact JSON schema:\n{',
            'RESPOND ONLY with this exact JSON schema:\n{\n  "instruction": "<copy exactly the synthesized instruction here>",'
        );
        activeAuditorNode.parameters.jsonBody = JSON.stringify(jsonBody, null, 2);
    }
}

fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
console.log('✅ Auditor prompt updated to include "instruction" field.');
