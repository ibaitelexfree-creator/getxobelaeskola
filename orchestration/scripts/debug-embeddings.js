import axios from 'axios';
const key = "AIzaSyAHg8xPQf-Hy_jaXoLBYmbEQBPXEQBqpVM";
const versions = ["v1", "v1beta"];
const models = ["gemini-embedding-001", "text-embedding-004"];

async function test() {
    for (const v of versions) {
        for (const m of models) {
            try {
                console.log(`Testing ${v} with ${m}...`);
                const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:embedContent?key=${key}`;
                const res = await axios.post(url, {
                    model: `models/${m}`,
                    content: { parts: [{ text: "test" }] }
                });
                console.log(`✅ ${v}/${m} works! Size: ${res.data.embedding.values.length}`);
                return;
            } catch (e) {
                console.log(`❌ ${v}/${m} failed:`, e.response?.data || e.message);
            }
        }
    }
    try {
        console.log("Listing models...");
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const listRes = await axios.get(listUrl);
        const embedModels = listRes.data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
        console.log("Available embedding models:", embedModels.map(m => m.name));
    } catch (err) {
        console.error("Listing models failed:", err.response?.data || err.message);
    }
    console.log("None worked.");
}
test();
