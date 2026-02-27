import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const N8N_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function n8nRequest(endpoint, options = {}) {
    const response = await fetch(`${N8N_URL}${endpoint}`, {
        ...options,
        headers: {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`n8n API error (${response.status}): ${text}`);
    }
    return response.json();
}

async function pull() {
    console.log('📥 Pulling workflows from Cloud...');
    const data = await n8nRequest('/workflows?limit=100');
    const workflows = data.data || [];

    // Save to orchestration/n8n-workflows-vps.json
    fs.writeFileSync(
        path.join(__dirname, 'n8n-workflows-vps.json'),
        JSON.stringify(workflows, null, 2)
    );

    // Also save individual files in a subfolder for easier editing
    const workflowDir = path.join(__dirname, 'n8n-workflows');
    if (!fs.existsSync(workflowDir)) fs.mkdirSync(workflowDir);

    workflows.forEach(w => {
        const fileName = `${w.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        fs.writeFileSync(path.join(workflowDir, fileName), JSON.stringify(w, null, 2));
    });

    console.log(`✅ Success: Pulled ${workflows.length} workflows to local.`);
}

async function push(workflowName) {
    console.log(`📤 Pushing workflow "${workflowName}" to Cloud...`);
    const workflowDir = path.join(__dirname, 'n8n-workflows');
    const files = fs.readdirSync(workflowDir);
    const file = files.find(f => f.startsWith(workflowName.replace(/[^a-z0-9]/gi, '_')));

    if (!file) {
        throw new Error(`Workflow file for "${workflowName}" not found locally.`);
    }

    const localData = JSON.parse(fs.readFileSync(path.join(workflowDir, file), 'utf8'));

    const cleanedData = {
        name: localData.name,
        nodes: localData.nodes,
        connections: localData.connections,
        settings: localData.settings || {}
    };

    // Get cloud workflows to find the ID
    const cloudData = await n8nRequest('/workflows?limit=100');
    const cloudWorkflow = cloudData.data.find(w => w.name === workflowName);

    if (cloudWorkflow) {
        console.log(`Matching found (ID: ${cloudWorkflow.id}). Updating...`);
        await n8nRequest(`/workflows/${cloudWorkflow.id}`, {
            method: 'PUT',
            body: JSON.stringify(cleanedData)
        });
        console.log('✅ Update successful.');
    } else {
        console.log('No matching workflow found in cloud. Creating new...');
        await n8nRequest('/workflows', {
            method: 'POST',
            body: JSON.stringify(cleanedData)
        });
        console.log('✅ Creation successful.');
    }
}

const action = process.argv[2];
const arg = process.argv[3];

if (action === 'pull') {
    pull().catch(e => console.error('❌ Error:', e.message));
} else if (action === 'push' && arg) {
    push(arg).catch(e => console.error('❌ Error:', e.message));
} else {
    console.log('Usage: node n8n_utils.js pull | push "Workflow Name"');
}
