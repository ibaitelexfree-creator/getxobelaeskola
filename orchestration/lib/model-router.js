import { callOpenRouter } from './openrouter-client.js';
import { callGrok } from './xai-client.js';
import RateGuard from './rate-guard.js';
import Classifier from './classifier.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ModelRouter: Orquestador inteligente de ejecución de LLMs.
 * Fase 2.5 - Maneja clasificación, Rate Limiting y Fallback automático.
 */
export class ModelRouter {
    /**
     * Ejecuta una consulta al modelo más apropiado.
     * @param {string} prompt - Prompt de la tarea.
     * @param {Object} options - Parámetros de ejecución.
     * @returns {Promise<Object>} Resultado estandarizado (text, tokens, latency).
     */
    static async execute(prompt, options = {}) {
        const {
            systemPrompt = "Eres un asistente técnico experto en el Swarm CI/CD 2.0.",
            forceModel = null,
            temperature = null
        } = options;

        const primaryModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';
        const fallbackModel = process.env.XAI_MODEL || 'grok-beta';

        // 1. Determinar categoría si no hay modelo forzado
        let category = 'GENERAL';
        if (!forceModel) {
            category = await Classifier.classifyTask(prompt);
            console.log(`[ModelRouter] Tarea clasificada como: ${category}`);
        }

        // 2. Intento de ejecución con el modelo primario
        try {
            // Validar cuota antes de llamar
            await RateGuard.checkAndIncrement(primaryModel);

            console.log(`[ModelRouter] Ejecutando con ${primaryModel}...`);
            const result = await callOpenRouter([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ], {
                model: primaryModel,
                temperature: temperature || parseFloat(process.env.OPENROUTER_JULES_TEMP || '0.3'),
                ...options
            });

            return {
                ...result,
                category,
                engine: 'primary'
            };

        } catch (error) {
            console.error(`[ModelRouter] ❌ Error en modelo primario: ${error.message}`);

            // 3. Estrategia de Fallback a Grok
            if (error.message.includes('Rate Limit') || error.message.includes('API Error')) {
                console.log(`[ModelRouter] 🔄 Iniciando Fallback a ${fallbackModel}...`);

                try {
                    await RateGuard.checkAndIncrement(fallbackModel);

                    const fallbackResult = await callGrok([
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ], {
                        model: fallbackModel,
                        temperature: temperature || 0.4,
                        ...options
                    });

                    return {
                        ...fallbackResult,
                        category,
                        engine: 'fallback'
                    };
                } catch (fallbackError) {
                    console.error(`[ModelRouter] 💀 Error crítico: Fallback también falló. ${fallbackError.message}`);
                    throw fallbackError;
                }
            }

            throw error; // Si no es un error de rate limit o API, lanzamos el error original
        }
    }
}

export default ModelRouter;
