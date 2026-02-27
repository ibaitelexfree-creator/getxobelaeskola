/**
 * @file openrouter-client.js
 * @description Client for OpenRouter API - Primary engine for Swarm CI/CD 2.0
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPEN_ROUTER_API_KEY;

/**
 * Calls OpenRouter AI API
 * @param {Array} messages - Chat messages array
 * @param {Object} options - Configuration options (model, temperature, max_tokens, etc.)
 * @returns {Promise<Object>} Response containing text, tokens used, and latency
 */
export async function callOpenRouter(messages, options = {}) {
    const {
        model = process.env.OPENROUTER_MODEL || 'google/gemini-flash-1.5',
        temperature = 0.3,
        max_tokens = 8192,
        response_format = null,
    } = options;

    if (!API_KEY) {
        throw new Error('OPEN_ROUTER_API_KEY is not defined in environment variables');
    }

    const startTime = Date.now();

    try {
        const body = {
            model,
            messages,
            temperature,
            max_tokens,
        };

        if (response_format) {
            body.response_format = response_format;
        }

        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://getxobelaeskola.cloud',
                'X-Title': 'Swarm CI/CD 2.0',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error?.message || response.statusText;
            if (response.status === 429) {
                throw new Error(`OpenRouter Rate Limit: ${errorMessage}`);
            }
            throw new Error(`OpenRouter API Error (${response.status}): ${errorMessage}`);
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
        console.error('OpenRouter Client Error:', error.message);
        throw error;
    }
}
