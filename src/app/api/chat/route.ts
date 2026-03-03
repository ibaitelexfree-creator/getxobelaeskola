import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSystemPrompt } from "@/lib/academy/chatbotContext";

export async function POST(req: Request) {
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "GOOGLE_API_KEY environment variable is not set." },
				{ status: 500 },
			);
		}

		const body = await req.json();
		const { messages } = body;

		if (!messages || !Array.isArray(messages)) {
			return NextResponse.json(
				{ error: "Messages array is required." },
				{ status: 400 },
			);
		}

		// Initialize Gemini
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// Construct the prompt
		// We will combine the system prompt with the recent conversation history
		// Gemini API supports a "system instruction" in newer versions, but concatenating text is safer across SDK versions.
		// However, let's use the SDK's chat history feature if possible, or just build a prompt string.
		// For simplicity and robustness with one-shot requests:

		const systemPrompt = getSystemPrompt();

		// Convert messages to Gemini format if needed, or just append to prompt.
		// Simple approach: System Prompt + History + Last User Message.

		// Take last user message
		const lastMessage = messages[messages.length - 1];
		if (!lastMessage || lastMessage.role !== "user") {
			return NextResponse.json(
				{ error: "Last message must be from user." },
				{ status: 400 },
			);
		}

		// Contextual History (limit to last few turns to save tokens/complexity)
		const recentHistory = messages
			.slice(-5, -1)
			.map(
				(msg: any) =>
					`${msg.role === "user" ? "Alumno" : "El Piloto"}: ${msg.content}`,
			)
			.join("\n");

		const fullPrompt = `
${systemPrompt}

---
Historial de conversación reciente:
${recentHistory}

Alumno: ${lastMessage.content}
El Piloto:
`.trim();

		const result = await model.generateContent(fullPrompt);
		const response = result.response;
		const text = response.text();

		return NextResponse.json({ response: text });
	} catch (error: any) {
		console.error("Error in chat API:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
