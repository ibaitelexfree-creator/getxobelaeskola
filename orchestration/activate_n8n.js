import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const N8N_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function activateWorkflow(id) {
    console.log(`Attempting to activate workflow ${id}...`);
    // Try POST /workflows/{id}/activate (Standard n8n API)
    const response = await fetch(`${N8N_URL}/workflows/${id}/activate`, {
        method: 'POST',
        headers: {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
        },
    });

    if (response.ok) {
        console.log('✅ Successfully activated via POST /activate');
        return;
    }

    const text = await response.text();
    console.log(`Failed POST /activate (${response.status}): ${text}`);

    // Try PATCH /workflows/{id} with { active: true }
    console.log('Trying PATCH /workflows/{id}...');
    const response2 = await fetch(`${N8N_URL}/workflows/${id}`, {
        method: 'PATCH',
        headers: {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: true })
    });

    if (response2.ok) {
        console.log('✅ Successfully activated via PATCH');
        return;
    }

    const text2 = await response2.text();
    console.log(`Failed PATCH (${response2.status}): ${text2}`);
}

const id = process.argv[2];
if (!id) {
    console.log('Usage: node activate_n8n.js <workflow_id>');
} else {
    activateWorkflow(id).catch(console.error);
}
