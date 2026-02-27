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
    /**
     * Genera embedding para un texto usando OpenRouter (OpenAI model)
     * @returns {Promise<number[]>} Vector de 1536 dimensiones
     */
    static async generateEmbedding(text) {
        if (!OPENROUTER_KEY) throw new Error('OPEN_ROUTER_API_KEY missing');

        try {
            const response = await axios.post(OPENROUTER_URL, {
                model: EMBEDDING_MODEL,
                input: text.substring(0, 8000)
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (!response.data.data?.[0]?.embedding) {
                throw new Error('No embedding returned from OpenRouter');
            }

            return response.data.data[0].embedding;
        } catch (error) {
            console.error('[Qdrant] Embedding Error (OpenRouter):', error.response?.data || error.message);
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
    static async ensureCollection(collectionName, size = 1536) {
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
