import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: './orchestration/.env' });

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'swarm_v2_code_intelligence';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

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
    if (!vector) return "";
    try {
        const res = await axios.post(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
            vector,
            limit: 3,
            with_payload: true
        });
        return res.data.result.map(r => `--- De ${r.payload.file} ---\n${r.payload.text}`).join('\n\n');
    } catch (e) {
        return "";
    }
}

async function askModel(prompt, useRAG = false) {
    let finalPrompt = prompt;
    if (useRAG) {
        const context = await getRAGContext(prompt);
        finalPrompt = `CONTEXTO DEL REPOSITORIO:\n${context}\n\nPREGUNTA USUARIO:\n${prompt}`;
    }

    try {
        // Usamos OpenRouter para probar con un modelo potente (Gemini 2.0 Flash)
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: finalPrompt }]
        }, {
            headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (e) {
        return `Error: ${e.message}`;
    }
}

async function runBenchmark() {
    const tests = [
        {
            name: "Conocimiento de Arquitectura Interna",
            query: "¿Cómo interactúa el script maestro.js con ClawdeBot y Jules en el sistema de orquestación?"
        },
        {
            name: "Generación de Código Específico",
            query: "Escribe un pequeño ejemplo de cómo usar la función setupMaestroHandlers() definida en el código."
        }
    ];

    console.log("=== 📊 BENCHMARK: SIN RAG vs CON RAG (ENTRENAMIENTO) ===\n");

    for (const t of tests) {
        console.log(`\nTEST: ${t.name}`);
        console.log(`PREGUNTA: ${t.query}`);
        console.log("-".repeat(50));

        console.log("\n[1] GENERACIÓN SIN ENTRENAMIENTO (ZERO-SHOT):");
        const resNoRag = await askModel(t.query, false);
        console.log(resNoRag);

        console.log("\n[2] GENERACIÓN CON ENTRENAMIENTO (RAG):");
        const resRag = await askModel(t.query, true);
        console.log(resRag);
        console.log("=".repeat(80));
    }
}

if (!OPENROUTER_KEY) {
    console.error("Error: Se necesita OPENROUTER_API_KEY en el .env de orchestration para ejecutar el benchmark.");
} else {
    runBenchmark();
}
