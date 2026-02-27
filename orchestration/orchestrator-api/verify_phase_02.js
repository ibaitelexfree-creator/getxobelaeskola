import 'dotenv/config';
import { classifyTask } from './src/lib/classifier.js';
import { getOptimalPath } from './src/lib/model-router.js';
import { RateGuard } from './src/lib/rate-guard.js';

// If running from orchestrator-api, the .env is in the parent dir
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function verify() {
    console.log('--- Phase 02 Verification ---');

    const testPrompt = "Fix the CSS margin on the login button and ensure it works on mobile devices";

    console.log('1. Testing Classifier...');
    const classification = await classifyTask(testPrompt);
    console.log('Result:', JSON.stringify(classification, null, 2));

    console.log('\n2. Testing Model Router...');
    const path = await getOptimalPath(classification);
    console.log('Result:', JSON.stringify(path, null, 2));

    console.log('\n3. Testing RateGuard Register...');
    await RateGuard.register(path.model, 'TestProvider', true);
    const status = await RateGuard.check(path.model);
    console.log('Status after registration:', status);

    console.log('\n--- Verification Complete ---');
}

verify().catch(console.error);
