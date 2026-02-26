
import 'dotenv/config';
import axios from 'axios';
import { buildAuthHeaders } from './src/account-health.js';

const accounts = [
    { email: 'getxobelaeskola@gmail.com', key: process.env.JULES_API_KEY },
    { email: 'ibaitnt@gmail.com', key: process.env.JULES_API_KEY_2 },
    { email: 'ibaitelexfree@gmail.com', key: process.env.JULES_API_KEY_3 }
];

async function test() {
    for (const acc of accounts) {
        console.log(`\nTesting: ${acc.email}`);
        if (!acc.key) {
            console.log('SKIPPED: No key in ENV');
            continue;
        }
        const headers = buildAuthHeaders(acc.key);
        try {
            const response = await axios.get('https://jules.googleapis.com/v1alpha/sessions?pageSize=1', { headers, timeout: 5000 });
            console.log(`SUCCESS! Status: ${response.status}`);
        } catch (err) {
            console.error(`FAILED! Status: ${err.response?.status || 'TIMEOUT/ERROR'}`);
            console.error(`Error: ${err.response?.data?.error?.message || err.message}`);
        }
    }
}

test();
