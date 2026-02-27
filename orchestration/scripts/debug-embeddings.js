import axios from 'axios';
const key = "AIzaSyAcQrQ9aUXm5JRJm8COikwX0GOtsh-nlg8";
const versions = ["v1", "v1beta"];
const models = ["text-embedding-004", "embedding-001"];

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
                // console.log(`❌ ${v}/${m} failed`);
            }
        }
    }
    console.log("None worked.");
}
test();
