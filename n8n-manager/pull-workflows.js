const fs = require('fs');
const path = require('path');
const config = require('./config.json');

async function pullWorkflows() {
    const headers = {
        'X-N8N-API-KEY': config.apiKey,
        'Accept': 'application/json'
    };

    try {
        console.log(`Fetching workflows from ${config.baseUrl}...`);
        const response = await fetch(`${config.baseUrl}/api/v1/workflows`, { headers });

        if (!response.ok) {
            throw new Error(`Error fetching workflows: ${response.statusText}`);
        }

        const { data } = await response.json();
        console.log(`Found ${data.length} workflows.`);

        const workflowsDir = path.join(__dirname, 'workflows');
        if (!fs.existsSync(workflowsDir)) {
            fs.mkdirSync(workflowsDir);
        }

        for (const workflow of data) {
            const fileName = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${workflow.id}.json`;
            const filePath = path.join(workflowsDir, fileName);

            // Fetch full workflow detail to get nodes and connections
            const detailResponse = await fetch(`${config.baseUrl}/api/v1/workflows/${workflow.id}`, { headers });
            const detail = await detailResponse.json();

            fs.writeFileSync(filePath, JSON.stringify(detail, null, 2));
            console.log(`Saved: ${fileName}`);
        }

        console.log('All workflows pulled successfully.');
    } catch (error) {
        console.error('Failed to pull workflows:', error.message);
    }
}

pullWorkflows();
