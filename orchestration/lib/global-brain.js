import { LRUCache } from 'lru-cache';
import QdrantClient from './qdrant-client.js';

// Cache para reducir la latencia de RAG (Fase 11)
const ragCache = new LRUCache({
    max: 500, // Máximo 500 contextos cacheados
    ttl: 1000 * 60 * 60 * 2, // 2 horas de vida útil
});

/**
 * Global Brain — Centralizado de contexto vectorial (Fase 1024).
 * Unifica la recuperación de memorias históricas, lecciones aprendidas
 * y conocimiento de expertos para todos los agentes del Swarm.
 */
export class GlobalBrain {
    /**
     * Recupera el contexto unificado basado en una tarea.
     * @param {string} query - Descripción de la tarea o prompt.
     * @param {Object} options - Filtros opcionales (expert, limit, etc.)
     * @returns {Promise<string>} Bloque de texto con el contexto RAG.
     */
    static async getUnifiedContext(query, options = {}) {
        if (!query) return '';

        const cacheKey = `${query}_${options.expert || 'all'}_${options.limit || 3}`;
        const cachedContext = ragCache.get(cacheKey);

        if (cachedContext !== undefined) {
            console.log(`[GlobalBrain] ⚡ RAG Cache Hit para: "${query.substring(0, 50)}..."`);
            return cachedContext;
        }

        console.log(`[GlobalBrain] 🧠 Recuperando contexto unificado para: "${query.substring(0, 50)}..."`);

        try {
            // 1. Memorias de infraestructura y Git
            const histories = await QdrantClient.searchSimilar('git-history', query, options.limit || 3);
            const lessons = await QdrantClient.searchSimilar('swarm-lessons', query, 2);
            const rca = await QdrantClient.searchSimilar('pipeline-rca', query, 2);
            const swarmMemory = await QdrantClient.searchSimilar('memory_swarm', query, 3);

            // 2. Memorias de Agentes Expertos (Jules)
            const expertPaths = options.expert ? [`jules-${options.expert}`] : ['jules-architect', 'jules-data', 'jules-ui'];
            const expertMemories = [];

            for (const collection of expertPaths) {
                try {
                    const hits = await QdrantClient.searchSimilar(collection, query, 1);
                    expertMemories.push(...hits);
                } catch (e) {
                    // Skip si la colección no existe o falla
                }
            }

            const allHits = [...histories, ...lessons, ...rca, ...swarmMemory, ...expertMemories];

            if (allHits.length === 0) {
                ragCache.set(cacheKey, '');
                return '';
            }

            let context = "\n### MEMORIA DEL REPOSITORIO (Global Brain - RAG):\n";
            const seenTexts = new Set();

            allHits.forEach((hit, i) => {
                const text = hit.payload.text || hit.payload.message || hit.payload.summary || '';
                if (text && !seenTexts.has(text.substring(0, 100))) {
                    seenTexts.add(text.substring(0, 100));
                    context += `\n[Memoria ${i + 1}]: ${text.substring(0, 800)}`;
                }
            });

            // Guardar en caché antes de retornar
            ragCache.set(cacheKey, context);
            return context;
        } catch (error) {
            console.warn(`[GlobalBrain] ⚠️ Error en recuperación: ${error.message}`);
            return '';
        }
    }
}

export default GlobalBrain;
