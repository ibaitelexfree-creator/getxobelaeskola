/**
 * @file xai-client.js
 * @description Client for xAI (Grok) API - Fallback engine for Swarm CI/CD 2.0
 */

import dotenv from 'dotenv';
dotenv.config();

const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const API_KEY = process.env.XAI_API_KEY;

/**
 * Calls xAI (Grok) API
 * @param {Array} messages - Chat messages array
 * @param {Object} options - Configuration options (model, temperature, etc.)
 * @returns {Promise<Object>} Response containing text, tokens used, and latency
 */
export async function callGrok(messages, options = {}) {
    const {
        model = process.env.XAI_MODEL || 'grok-2-latest',
        temperature = 0.5,
        max_tokens = 4096,
    } = options;

    if (!API_KEY || API_KEY.includes('your_xai_key_here')) {
        throw new Error('XAI_API_KEY is not configured with a valid key');
    }

    const startTime = Date.now();

    try {
        const response = await fetch(XAI_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error?.message || response.statusText;
            if (response.status === 429) {
                throw new Error(`Grok Rate Limit: ${errorMessage}`);
            }
            throw new Error(`Grok API Error (${response.status}): ${errorMessage}`);
        }

        const latencyMs = Date.now() - startTime;
        const text = data.choices[0]?.message?.content || '';
        const tokensUsed = data.usage?.total_tokens || 0;

        return {
            text,
            tokensUsed,
            latencyMs,
            model: data.model || model,
            raw: data
        };
    } catch (error) {
        console.error('Grok Client Error:', error.message);
        throw error;
    }
}
