const fs = require('fs');
const path = require('path');
const config = require('./config.json');

async function pushWorkflow() {
    const workflowPath = path.join(process.cwd(), 'orchestration', 'n8n-notebooklm-daily.json');
    if (!fs.existsSync(workflowPath)) {
        console.error('El archivo de workflow no existe en orchestration/n8n-notebooklm-daily.json');
        return;
    }

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

    // Eliminar IDs si existen para crear uno nuevo
    delete workflowData.id;
    delete workflowData.active;

    const headers = {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    try {
        console.log(`Pushing workflow to ${config.baseUrl}...`);
        const response = await fetch(`${config.baseUrl}/api/v1/workflows`, {
            method: 'POST',
            headers,
            body: JSON.stringify(workflowData)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Error pushing workflow: ${response.statusText} - ${err}`);
        }

        const result = await response.json();
        console.log(`✅ Workflow '${result.name}' creado con ID: ${result.id}`);
        console.log(`URL: ${config.baseUrl}/workflow/${result.id}`);
    } catch (error) {
        console.error('❌ Failed to push workflow:', error.message);
    }
}

pushWorkflow();
