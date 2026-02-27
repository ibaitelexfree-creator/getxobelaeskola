import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WEBHOOK_URL = process.env.N8N_SWARM_DISPATCHER_URL;

const payload = {
    original_prompt: "Test Swarm: Create a simple hello world landing page with a contact form.",
    proposal: [
        {
            role: "Lead Architect",
            count: 1,
            account: "getxobelaeskola@gmail.com"
        },
        {
            role: "UI Engine",
            count: 1,
            account: "ibaitelexfree@gmail.com"
        }
    ],
    metadata: {
        timestamp: new Date().toISOString(),
        source: "Debug Script"
    }
};

async function test() {
    console.log('🚀 Sending trigger to n8n Swarm Dispatcher...');
    console.log('URL:', WEBHOOK_URL);

    try {
        const response = await axios.post(WEBHOOK_URL, payload);
        console.log('✅ Success! n8n response:', response.data);
    } catch (error) {
        console.error('❌ Error triggering webhook:', error.response?.data || error.message);
    }
}

test();
