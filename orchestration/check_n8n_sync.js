// Native fetch used
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const N8N_URL = process.env.N8N_API_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function checkSync() {
    console.log('--- checking n8n sync ---');
    console.log('Cloud URL:', N8N_URL);

    try {
        const response = await fetch(`${N8N_URL}/workflows`, {
            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`Cloud API Error: ${response.status}`);
        }

        const cloudData = await response.json();
        const cloudWorkflows = cloudData.data || [];
        console.log(`Cloud has ${cloudWorkflows.length} workflows.`);

        const localFilePath = path.join(__dirname, 'n8n-workflows-vps.json');
        let localWorkflows = [];
        if (fs.existsSync(localFilePath)) {
            localWorkflows = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
            console.log(`Local file has ${localWorkflows.length} workflows.`);
        } else {
            console.log('Local file not found.');
        }

        // Compare
        const cloudNames = cloudWorkflows.map(w => w.name).sort();
        const localNames = localWorkflows.map(w => w.name).sort();

        console.log('\nCloud Workflows:', cloudNames);
        console.log('Local Workflows:', localNames);

        if (JSON.stringify(cloudNames) === JSON.stringify(localNames)) {
            console.log('\n✅ SYNC STATUS: Workflows names match.');
        } else {
            console.log('\n❌ SYNC STATUS: Mismatch in workflow names.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkSync();
