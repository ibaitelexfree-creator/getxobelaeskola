import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: './orchestrator-api/.env' });

async function deactivateWorkflow(workflowId) {
    try {
        const headers = {
            'X-N8N-API-KEY': process.env.N8N_API_KEY,
            'Accept': 'application/json'
        };

        console.log(`Attempting to deactivate workflow ${workflowId}...`);

        await axios.post(`${process.env.N8N_API_URL}/workflows/${workflowId}/deactivate`, {}, { headers });
        console.log(`✅ Successfully deactivated via POST /deactivate`);

    } catch (error) {
        console.error(`❌ Error deactivating workflow:`, error.message);
        if (error.response) {
            console.error(JSON.stringify(error.response.data));
        }
    }
}

const targetId = process.argv[2];
if (!targetId) {
    console.log('Usage: node deactivate_n8n.js <workflow-id>');
} else {
    deactivateWorkflow(targetId);
}
