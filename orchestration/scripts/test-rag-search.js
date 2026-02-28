import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: './orchestration/.env' });

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const COLLECTION_NAME = 'swarm_v2_code_intelligence';

async function generateEmbedding(text) {
    try {
        const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
            model: 'mxbai-embed-large',
            prompt: `query: ${text}`
        });
        return response.data.embedding;
    } catch (error) {
        console.error('Error generando embedding:', error.message);
        return null;
    }
}

async function search(query, limit = 5) {
    const vector = await generateEmbedding(query);
    if (!vector) return;

    try {
        const response = await axios.post(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
            vector: vector,
            limit: limit,
            with_payload: true,
            score_threshold: 0.5
        });

        console.log(`\n🔍 RESULTADOS PARA: "${query}"`);
        console.log(`================================================`);

        response.data.result.forEach((hit, i) => {
            console.log(`\n[${i + 1}] Score: ${hit.score.toFixed(4)} | Archivo: ${hit.payload.file}`);
            console.log(`---`);
            console.log(hit.payload.text.substring(0, 300) + (hit.payload.text.length > 300 ? '...' : ''));
        });
    } catch (error) {
        console.error('Error en búsqueda Qdrant:', error.message);
    }
}

const query = process.argv.slice(2).join(' ') || '¿Cómo funciona el sistema de orquestación de Jules?';
search(query);
