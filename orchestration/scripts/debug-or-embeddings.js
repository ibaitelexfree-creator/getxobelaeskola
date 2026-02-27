import axios from 'axios';
const key = "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";
const model = "openai/text-embedding-3-small";

async function test() {
    try {
        console.log(`Testing OpenRouter with ${model}...`);
        const res = await axios.post("https://openrouter.ai/api/v1/embeddings", {
            model: model,
            input: "test"
        }, {
            headers: { Authorization: `Bearer ${key}` }
        });
        console.log(`✅ Success! Size: ${res.data.data[0].embedding.length}`);
    } catch (e) {
        console.log(`❌ Failed: ${e.response?.data?.error?.message || e.message}`);
    }
}
test();
