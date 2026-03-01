import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ModelRouter from './model-router.js';
import QdrantClient from './qdrant-client.js';
import GlobalBrain from './global-brain.js';
import pg from './pg-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * JulesExecutor: Ejecutor especializado de agentes expertos.
 * Fase 3.3 - Maneja Prompts, RAG, Retries y Checkpoints.
 */
export class JulesExecutor {
    /**
     * Ejecuta un experto específico con contexto RAG
     * @param {string} expert - 'architect' | 'data' | 'ui'
     * @param {string} task - Descripción de la tarea
     * @param {string} swarmId - ID del Swarm padre
     * @returns {Promise<Object>} Resultado parseado
     */
    static async executeJules(expert, task, swarmId) {
        console.log(`[JulesExecutor] 🚀 Iniciando experto: ${expert}...`);

        const taskDesc = typeof task === 'object' ? (task.description || task.title) : task;

        // 1. Cargar Prompt de Sistema
        const promptPath = path.join(__dirname, `../prompts/jules-${expert}.md`);
        const systemPrompt = await fs.readFile(promptPath, 'utf-8');

        // 2. Global Brain: Priorizar contexto inyectado si existe
        let ragContext = (typeof task === 'object' && task.context) ? task.context : '';

        // Fallback: Si no hay contexto, consultamos Global Brain directamente
        if (!ragContext) {
            ragContext = await GlobalBrain.getUnifiedContext(taskDesc, { expert });
        }

        // 3. Ejecutar via ModelRouter (Maneja Rate Limit y Fallback)
        const prompt = `TAREA A REALIZAR:\n${taskDesc}\n\n${ragContext}\n\nResponde siguiendo estrictamente el formato JSON definido en tu prompt de sistema.`;

        const result = await ModelRouter.execute(prompt, {
            systemPrompt,
            forceModel: null // Dejamos que ModelRouter decida o use primary
        });

        // 4. Parsear JSON robusto
        try {
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON object found in response');

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                ...parsed,
                model_used: result.model,
                engine: result.engine
            };
        } catch (e) {
            console.error('[JulesExecutor] JSON Parse Error. Raw text:', result.text);
            throw new Error(`Invalid JSON response from ${expert}: ${e.message}`);
        }
    }

    /**
     * Ejecución con Reintentos y Backoff Exponencial
     */
    static async executeWithRetry(expert, task, swarmId, maxRetries = 3) {
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = Math.pow(attempt, 2) * 5000; // 5s, 20s, 45s...
                    console.log(`[JulesExecutor] Reintento ${attempt}/${maxRetries} para ${expert} en ${delay / 1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                }

                const output = await this.executeJules(expert, task, swarmId);

                // Guardar Checkpoint Exitoso en Postgres
                await this.saveCheckpoint(swarmId, expert, output, 'SUCCESS');

                return output;
            } catch (error) {
                lastError = error;
                console.error(`[JulesExecutor] ❌ Intento ${attempt} fallido para ${expert}: ${error.message}`);

                // Registrar fallo parcial
                await this.saveCheckpoint(swarmId, expert, { error: error.message }, 'FAILED', attempt);
            }
        }

        throw new Error(`Expert ${expert} failed after ${maxRetries} retries. Last error: ${lastError.message}`);
    }

    /**
     * Persistencia de estado en PostgreSQL (sw2_tasks)
     */
    static async saveCheckpoint(swarmId, expert, output, status, retryCount = 0) {
        const query = `
      INSERT INTO sw2_tasks (swarm_id, agent_role, status, response_payload, retry_count, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET 
        status = EXCLUDED.status,
        response_payload = EXCLUDED.response_payload,
        retry_count = EXCLUDED.retry_count,
        completed_at = EXCLUDED.completed_at
    `;

        // Simplificación: Para este MVP, si no tenemos taskId previo, creamos uno nuevo.
        // El orquestador v2 manejará los UUIDs de forma más estricta.
        try {
            await pg.query(
                'INSERT INTO sw2_tasks (swarm_id, agent_role, status, response_payload, retry_count, completed_at) VALUES ($1, $2, $3, $4, $5, $6)',
                [swarmId, expert, status, JSON.stringify(output), retryCount, status === 'SUCCESS' ? new Date() : null]
            );
        } catch (e) {
            console.error('[JulesExecutor] DB Checkpoint Error:', e.message);
        }
    }
}

export default JulesExecutor;
