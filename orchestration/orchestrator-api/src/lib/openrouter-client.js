import axios from 'axios';

/**
 * OpenRouter Client for SWARM CI/CD 2.0
 * Handles communication with Gemini Flash and other models via OpenRouter.
 */
export async function callOpenRouter({
    model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
    prompt,
    systemPrompt,
    temperature = 0.3,
    maxTokens = 2000,
    jsonMode = false
}) {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPEN_ROUTER_API_KEY is not defined in environment variables');
    }

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                response_format: jsonMode ? { type: 'json_object' } : undefined
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://scarmonit.com',
                    'X-Title': 'Swarm CI/CD 2.0',
                    'Content-Type': 'application/json'
                },
                timeout: 60000 // 60s timeout for complex tasks
            }
        );

        const content = response.data.choices[0].message.content;

        if (jsonMode) {
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse OpenRouter JSON response:', content);
                throw new Error('Invalid JSON response from model');
            }
        }

        return content;
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        throw error;
    }
}
