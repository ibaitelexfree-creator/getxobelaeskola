
import 'dotenv/config';
import axios from 'axios';
import { buildAuthHeaders } from './src/account-health.js';

const email = 'getxobelaeskola@gmail.com';
const apiKey = process.env.JULES_API_KEY;

async function testPost() {
    console.log(`Testing POST session creation with email: ${email}`);
    const headers = buildAuthHeaders(apiKey);

    try {
        const response = await axios.post('https://jules.googleapis.com/v1alpha/sessions', {
            prompt: 'Test session creation - just checking connection',
            sourceContext: {
                source: 'sources/github/ibaitelexfree-creator/getxobelaeskola',
                githubRepoContext: { startingBranch: 'main' }
            },
            automationMode: 'AUTO_CREATE_PR'
        }, { headers, timeout: 30000 });

        console.log('SUCCESS! Session created:', response.data.name);
    } catch (err) {
        console.error('FAILED! Status:', err.response?.status || 'TIMEOUT/ERROR');
        console.error('Error:', err.response?.data?.error?.message || err.message);
    }
}

testPost();
