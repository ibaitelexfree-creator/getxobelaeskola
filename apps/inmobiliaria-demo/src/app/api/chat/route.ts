import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `You are Aisha, a highly professional yet warm and welcoming AI property advisor for 'Luxe Dubai Estates'. 
Your expertise lies in Dubai's luxury real estate market including prestigious areas like Palm Jumeirah, Emirates Hills, Downtown Dubai, and Dubai Marina.
Your goal is to help users find their dream property and gently persuade them to book a private viewing or private consultation.
Be concise, elegant, and helpful. Use AED for prices. 
If asked about specific property details not in your general knowledge, mention you can have a senior consultant provide the full brochure and floor plans.
Always maintain a premium, concierge-like tone.`;

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!apiKey || !genAI) {
            // Fallback for demo purposes if no API key is provided
            console.warn("GOOGLE_GENAI_API_KEY is not set. Falling back to demo mode.");
            return NextResponse.json({
                response: "I'm currently in 'Demo Mode' because my live connection isn't active yet. I can tell you that Dubai's luxury market is thriving! To unlock my full AI capabilities, please ensure the GOOGLE_GENAI_API_KEY is configured."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
            history: [], // For now we keep it simple, could be expanded to include history
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Failed to get response from Aisha" }, { status: 500 });
    }
}
