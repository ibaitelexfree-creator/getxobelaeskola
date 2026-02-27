import axios from 'axios';

/**
 * xAI (Grok) Client for SWARM CI/CD 2.0
 * Handles fallback communication for complex Root Cause Analysis (RCA).
 */
export async function callGrok({
    model = process.env.XAI_MODEL || 'grok-2-latest',
    prompt,
    systemPrompt,
    temperature = 0.5,
    maxTokens = 4096
}) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || apiKey === 'your_xai_key_here') {
        throw new Error('XAI_API_KEY is not configured');
    }

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await axios.post(
            'https://api.x.ai/v1/chat/completions',
            {
                model,
                messages,
                temperature,
                max_tokens: maxTokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 90000 // 90s for deep reasoning
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('xAI API Error:', error.response?.data || error.message);
        throw error;
    }
}
