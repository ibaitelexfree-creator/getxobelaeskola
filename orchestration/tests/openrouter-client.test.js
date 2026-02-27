import test from 'node:test';
import assert from 'node:assert/strict';
import { callOpenRouter } from '../lib/openrouter-client.js';

test('OpenRouter Client - Ping Test', async (t) => {
    try {
        const response = await callOpenRouter([
            { role: 'user', content: 'Di solo la palabra PING' }
        ], {
            max_tokens: 10,
            temperature: 0
        });

        console.log('OpenRouter Response:', response.text);

        assert.ok(response.text, 'Response text should not be empty');
        assert.ok(response.text.toUpperCase().includes('PING'), 'Response should contain PING');
        assert.ok(response.latencyMs > 0, 'Latency should be calculated');
        assert.ok(response.tokensUsed > 0, 'Tokens used should be returned');
    } catch (error) {
        if (error.message.includes('API_KEY')) {
            console.warn('Skipping actual API test: No API KEY found');
            return;
        }
        throw error;
    }
});
