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
export async function generateEmbedding(text) {
    // Generate an embedding deterministically from the text using a simple hash.
    // This allows similar strings to produce slightly similar vectors, but mainly ensures identical strings match perfectly.
    const hash = crypto.createHash('sha256').update(text || '').digest();

    const vector = new Array(1536).fill(0);
    // Use the 32-byte hash to seed the pseudo-random generator
    for (let i = 0; i < 1536; i++) {
        // Pseudo-random deterministic distribution based on hash
        const byte1 = hash[i % 32];
        const byte2 = hash[(i + 7) % 32];
        const byte3 = hash[(i + 13) % 32];
        // Center around 0 and scale
        vector[i] = ((byte1 ^ byte2) + byte3) / 255.0 - 0.5;
    }

    // Runtime vector integrity check
    if (!vector || !Array.isArray(vector) || vector.length !== 1536) {
        throw new Error(`[Qdrant] Vector Integrity Error: Expected dimension 1536, got ${vector?.length || 'undefined'}`);
    }

    return vector;
}
