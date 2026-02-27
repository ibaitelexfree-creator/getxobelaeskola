import test from 'node:test';
import assert from 'node:assert/strict';
import { callGrok } from '../lib/xai-client.js';

test('xAI/Grok Client - Ping Test', async (t) => {
    try {
        // Skipping if API key is not real
        if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY.includes('your_xai_key_here')) {
            console.warn('Skipping Grok API test: No valid API KEY found');
            return;
        }

        const response = await callGrok([
            { role: 'user', content: 'Di solo la palabra PING' }
        ], {
            max_tokens: 10,
            temperature: 0
        });

        console.log('Grok Response:', response.text);

        assert.ok(response.text, 'Response text should not be empty');
        assert.ok(response.text.toUpperCase().includes('PING'), 'Response should contain PING');
    } catch (error) {
        if (error.message.includes('XAI_API_KEY')) {
            console.warn('Skipping Grok API test: ' + error.message);
            return;
        }
        throw error;
    }
});
