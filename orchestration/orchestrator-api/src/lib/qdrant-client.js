import axios from 'axios';
import crypto from 'crypto';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const PREFIX = process.env.QDRANT_COLLECTION_PREFIX || 'swarm_v2_';

/**
 * Qdrant Client for SWARM CI/CD 2.0
 * Handles vector searches for RAG context.
 */
export async function searchContext(collection, queryText, limit = 5, scoreThreshold = 0.85) {
    const fullName = `${PREFIX}${collection}`;

    try {
        // 1. Generate Embeddings (Using Gemini via OpenRouter or a specific embedding endpoint)
        const vector = await generateEmbedding(queryText);

        const headers = {};
        if (QDRANT_API_KEY) {
            headers['api-key'] = QDRANT_API_KEY;
        }

        // 2. Search in Qdrant
        const response = await axios.post(`${QDRANT_URL}/collections/${fullName}/points/search`, {
            vector,
            limit,
            with_payload: true,
            score_threshold: scoreThreshold
        }, { headers });


        return response.data.result.map(r => ({
            payload: r.payload,
            score: r.score
        }));

    } catch (error) {
        console.error(`Qdrant Search Error (${fullName}):`, error.message);
        return []; // Return empty context on failure
    }
}

/**
 * Stores context vectors in Qdrant (e.g., RCA results)
 */
export async function storeContext(collection, id, textPayload, metadata = {}) {
    const fullName = `${PREFIX}${collection}`;
    try {
        const vector = await generateEmbedding(textPayload);
        const headers = {};
        if (QDRANT_API_KEY) headers['api-key'] = QDRANT_API_KEY;

        await axios.put(`${QDRANT_URL}/collections/${fullName}/points?wait=true`, {
            points: [
                {
                    id: id || crypto.randomUUID(),
                    vector,
                    payload: { text: textPayload, ...metadata } // Ensure text field is present
                }
            ]
        }, { headers });
        console.log(`[Qdrant] Persisted knowledge to ${fullName}`);
    } catch (e) {
        console.error(`[Qdrant] Store Error (${fullName}):`, e.response?.data || e.message);
    }
}

/**
 * Placeholder for Embedding Generation
 * In CI/CD 2.0, this should call Gemini Embedding model via OpenRouter.
 */
/**
 * Real Embedding Generation via LOCAL Ollama
 * Uses mxbai-embed-large (1024 dimensions)
 */
export async function generateEmbedding(text) {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const MODEL = 'mxbai-embed-large';

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
            model: MODEL,
            prompt: (text || '').substring(0, 8000)
        });

        const embedding = response.data?.embedding;
        if (!embedding || !Array.isArray(embedding)) {
            throw new Error(`[Qdrant] No embedding returned from Ollama (model: ${MODEL})`);
        }

        // Runtime vector integrity check
        if (embedding.length !== 1024) {
            throw new Error(`[Qdrant] Dimension mismatch: Expected 1024, got ${embedding.length}`);
        }

        return embedding;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('[Qdrant] Ollama is not running. Start it with "ollama serve"');
        }
        console.error('[Qdrant] Local embedding generation failed:', error.message);
        throw error;
    }
}
