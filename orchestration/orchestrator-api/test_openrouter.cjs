
const axios = require('axios');
require('dotenv').config();

async function test() {
    try {
        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: "hi" }]
        }, {
            headers: {
                'Authorization': `Bearer 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`,
                'HTTP-Referer': 'https://scarmonit.com',
                'X-Title': 'n8n Swarm'
            }
        });
        console.log('✅ OpenRouter Response:', res.data.choices[0].message.content);
    } catch (e) {
        console.error('❌ OpenRouter Error:', e.response?.data || e.message);
    }
}
test();
