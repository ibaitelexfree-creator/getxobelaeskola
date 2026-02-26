const config = require('./config.json');

async function activateWorkflow(id) {
    const headers = {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
    };

    try {
        console.log(`Activating workflow ${id}...`);
        const response = await fetch(`${config.baseUrl}/api/v1/workflows/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ active: true })
        });

        if (!response.ok) {
            throw new Error(`Error activating workflow: ${response.statusText}`);
        }

        console.log(`✅ Workflow ${id} ya está ACTIVO.`);
    } catch (error) {
        console.error('❌ Failed to activate workflow:', error.message);
    }
}

activateWorkflow('3vp9ZZMX9SGUpd6D');
