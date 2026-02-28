import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/embeddings';
const OPENROUTER_KEY = process.env.OPEN_ROUTER_API_KEY;
// Usamos OpenAI via OpenRouter ya que el directo de Google falló
const EMBEDDING_MODEL = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';
const COLLECTION_PREFIX = process.env.QDRANT_COLLECTION_PREFIX || 'swarm_v2_';

/**
 * QdrantClient: Interfaz para memoria vectorial y RAG.
 */
export class QdrantClient {
    static async generateEmbedding(text) {
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

            return embedding;
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.error('[Qdrant] Ollama is not running. Start it with "ollama serve"');
            }
            console.error('[Qdrant] Local embedding generation failed:', error.message);
            throw error;
        }
    }

    /**
     * Busca elementos similares en una colección
     */
    static async searchSimilar(collectionName, queryText, topK = 5) {
        const fullCollection = `${COLLECTION_PREFIX}${collectionName}`;

        try {
            const vector = await this.generateEmbedding(queryText);

            const response = await axios.post(`${QDRANT_URL}/collections/${fullCollection}/points/search`, {
                vector: vector,
                limit: topK,
                with_payload: true
            });

            return response.data.result.map(hit => ({
                id: hit.id,
                score: hit.score,
                payload: hit.payload
            }));
        } catch (error) {
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    }

    /**
     * Inserta o actualiza un punto en la colección
     */
    static async upsertPoint(collectionName, id, text, payload = {}) {
        const fullCollection = `${COLLECTION_PREFIX}${collectionName}`;

        try {
            const vector = await this.generateEmbedding(text);

            await axios.put(`${QDRANT_URL}/collections/${fullCollection}/points`, {
                points: [
                    {
                        id: id,
                        vector: vector,
                        payload: {
                            ...payload,
                            text: text,
                            timestamp: new Date().toISOString()
                        }
                    }
                ]
            });

            return true;
        } catch (error) {
            console.error(`[Qdrant] Upsert Error in ${fullCollection}:`, error.message);
            throw error;
        }
    }

    /**
     * Asegura que una colección existe con el tamaño correcto.
     * Si el tamaño es diferente, la recrea.
     */
    static async ensureCollection(collectionName, size = 1024) {
        const fullCollection = `${COLLECTION_PREFIX}${collectionName}`;

        try {
            const info = await axios.get(`${QDRANT_URL}/collections/${fullCollection}`);
            const currentSize = info.data.result.config.params.vectors.size;

            if (currentSize !== size) {
                console.log(`[Qdrant] Tamaño incorrecto (${currentSize} vs ${size}). Recreando ${fullCollection}...`);
                await axios.delete(`${QDRANT_URL}/collections/${fullCollection}`);
                throw { response: { status: 404 } }; // Forzar recreación
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`[Qdrant] Creando colección ${fullCollection} (size: ${size})...`);
                await axios.put(`${QDRANT_URL}/collections/${fullCollection}`, {
                    vectors: {
                        size: size,
                        distance: 'Cosine'
                    }
                });
            } else {
                throw error;
            }
        }
    }
}

export default QdrantClient;
