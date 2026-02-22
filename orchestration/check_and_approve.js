import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const JULES_API_KEYS = [
    process.env.JULES_API_KEY,
    process.env.JULES_API_KEY_2,
    process.env.JULES_API_KEY_3,
].filter(Boolean);

function julesRequest(apiKey, method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'jules.googleapis.com',
            port: 443,
            path: '/v1alpha' + path,
            method: method,
            headers: {
                'X-Goog-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch { resolve(data); }
                } else {
                    reject(new Error(`Status ${response.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function checkAll() {
    console.log(`Checking ${JULES_API_KEYS.length} keys...`);
    for (let i = 0; i < JULES_API_KEYS.length; i++) {
        const key = JULES_API_KEYS[i];
        console.log(`\n--- Jules Account ${i + 1} ---`);
        try {
            const resp = await julesRequest(key, 'GET', '/sessions');
            const sessions = resp.sessions || [];
            console.log(`Found ${sessions.length} sessions.`);
            for (const s of sessions) {
                console.log(`- [${s.state}] ${s.name.split('/').pop()}: ${s.title || 'Untitled'}`);
                if (s.state === 'WAITING_FOR_APPROVAL' || s.state === 'AWAITING_PLAN_APPROVAL') {
                    console.log(`  APPROVING PLAN for ${s.name}...`);
                    await julesRequest(key, 'POST', `/${s.name}:approvePlan`, {});
                    console.log(`  Done.`);
                } else if (s.state === 'AWAITING_USER_FEEDBACK') {
                    console.log(`  SENDING PROCEED MESSAGE for ${s.name}...`);
                    await julesRequest(key, 'POST', `/${s.name}:sendMessage`, {
                        prompt: "Please proceed autonomously with the best possible approach. No manual review is needed."
                    });
                    console.log(`  Done.`);
                }
            }
        } catch (err) {
            console.error(`Error: ${err.message}`);
        }
    }
}

checkAll();
