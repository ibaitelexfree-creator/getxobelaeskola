import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'swarm_v2_code_intelligence';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateEmbedding(text) {
    try {
        const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
            model: 'mxbai-embed-large',
            prompt: `query: ${text}`
        });
        return response.data.embedding;
    } catch (e) {
        return null;
    }
}

async function getRAGContext(query) {
    const vector = await generateEmbedding(query);
    if (!vector) return "No se pudo obtener contexto (Ollama falló)";
    try {
        const res = await axios.post(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
            vector,
            limit: 3,
            with_payload: true
        });
        return res.data.result.map(r => `--- Archivo: ${r.payload.file} ---\n${r.payload.text}`).join('\n\n');
    } catch (e) {
        return "Error conectando con Qdrant";
    }
}

async function askGroq(prompt, useRAG = false) {
    let finalPrompt = prompt;
    if (useRAG) {
        const context = await getRAGContext(prompt);
        finalPrompt = `CONTEXTO DEL REPOSITORIO:\n${context}\n\nPREGUNTA USUARIO:\n${prompt}\n\nResponde de forma técnica basándote en el código superior. Si no lo sabes, di que no está en el contexto.`;
    }

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'Eres un experto en el código de este repositorio.' },
                { role: 'user', content: finalPrompt }
            ],
            temperature: 0.1
        }, {
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (e) {
        return `Error Groq: ${e.response?.data?.error?.message || e.message}`;
    }
}

async function runBenchmark() {
    const tests = [
        {
            name: "Arquitectura de Orquestación",
            query: "¿Cómo funciona el sistema de 'Relay' entre Architect, Data Master y UI Engine en el código?"
        },
        {
            name: "Identificación de Handlers",
            query: "Lista los comandos de Telegram registrados en maestro.js y qué función los procesa."
        }
    ];

    console.log("================================================================================");
    console.log("📊 BENCHMARK RAG: GROQ LLAMA-3.3-70B (CON vs SIN CONTEXTO)");
    console.log("================================================================================\n");

    for (const t of tests) {
        console.log(`TEST: ${t.name}`);
        console.log(`PREGUNTA: ${t.query}`);
        console.log("-".repeat(50));

        console.log("\n[1] MODO SIN RAG (Predicción General):");
        const resNoRag = await askGroq(t.query, false);
        console.log(resNoRag);

        console.log("\n" + ".".repeat(40));

        console.log("\n[2] MODO CON RAG (Conocimiento del Repositorio):");
        const resRag = await askGroq(t.query, true);
        console.log(resRag);
        console.log("\n" + "=".repeat(80) + "\n");
    }
}

if (!GROQ_API_KEY) {
    console.error("Falta GROQ_API_KEY en el .env");
} else {
    runBenchmark();
}
