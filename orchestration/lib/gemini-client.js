import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const GEMINI_API_BASE = 'generativelanguage.googleapis.com';
const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Gemini Client: Wrapper for direct Google AI API calls.
 */
export async function callGemini(messages, options = {}) {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const {
        model = 'gemini-flash-latest',
        temperature = 0.2,
        maxOutputTokens = 2048
    } = options;

    const startTime = Date.now();

    // Convert OpenAI style messages to Gemini style
    const contents = messages.map(m => ({
        role: m.role === 'system' ? 'user' : (m.role === 'assistant' ? 'model' : 'user'),
        parts: [{ text: m.content }]
    }));

    const body = JSON.stringify({
        contents,
        generationConfig: {
            maxOutputTokens,
            temperature
        }
    });

    return new Promise((resolve, reject) => {
        const reqOptions = {
            hostname: GEMINI_API_BASE,
            port: 443,
            path: `/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const latencyMs = Date.now() - startTime;
                if (res.statusCode >= 400) {
                    reject(new Error(`Gemini API Error (${res.statusCode}): ${data}`));
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const tokensUsed = parsed.usageMetadata?.totalTokenCount || 0;
                    resolve({ text, tokensUsed, latencyMs, model });
                } catch (e) {
                    reject(new Error(`Gemini Parse Error: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

export default callGemini;
