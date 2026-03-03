
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testV1() {
    const apiKey = "AIzaSyDz-Ezt6Ehdge9ebE_ieN5qaZwOOdCs_KE";
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Try explicitly using v1
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (e) {
        console.log("Error:", e.message);
        console.log("Full error data:", JSON.stringify(e, null, 2));
    }
}

testV1();
