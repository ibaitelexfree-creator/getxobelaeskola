import Redis from 'ioredis';
import pg from './pg-client.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Límites configurables (Fase 2.3)
const LIMITS = {
    'google/gemini-2.0-flash-001': parseInt(process.env.GEMINI_LIMIT_HOUR || '55'),
    'grok-beta': parseInt(process.env.GROK_LIMIT_HOUR || '15'),
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * RateGuard: Control de cuotas de API con persistencia en Redis y logs en Postgres.
 * Implementa una estrategia de "cola de espera activa" (active wait).
 */
export class RateGuard {
    /**
     * Verifica si un modelo puede ser utilizado y bloquea si el límite ha sido alcanzado.
     * @param {string} modelId 
     * @returns {Promise<boolean>}
     */
    static async checkAndIncrement(modelId) {
        const limit = LIMITS[modelId] || 50;
        const bucket = new Date().toISOString().substring(0, 13); // Cache por hora (YYYY-MM-DDTHH)
        const key = `rate:${modelId}:${bucket}`;

        try {
            let count = await redis.get(key);
            count = count ? parseInt(count) : 0;

            if (count >= limit) {
                const ttl = await redis.ttl(key);
                const waitTime = (ttl > 0 ? ttl + 2 : 5) * 1000;

                console.warn(`[RateGuard] ⚠️ Límite alcanzado para ${modelId} (${count}/${limit}). Esperando ${waitTime / 1000}s...`);

                // Registrar bloqueo en PostgreSQL
                await pg.query(
                    'INSERT INTO rate_limit_log (model_id, action, reset_at) VALUES ($1, $2, $3)',
                    [modelId, 'BLOCK', new Date(Date.now() + waitTime)]
                );

                await sleep(waitTime);
                return await this.checkAndIncrement(modelId); // Reintento recursivo
            }

            // Incremento atómico
            const newCount = await redis.incr(key);
            if (newCount === 1) {
                await redis.expire(key, 3600); // 1 hora de vida
            }

            // Log de uso asíncrono (no bloquea el flujo principal)
            pg.query(
                'INSERT INTO rate_limit_log (model_id, action) VALUES ($1, $2)',
                [modelId, 'USE']
            ).catch(e => console.error('[RateGuard] DB Log Error:', e.message));

            return true;
        } catch (error) {
            console.error('[RateGuard] Redis Error:', error.message);
            // Failsafe: Si Redis cae, permitimos la llamada pero avisamos
            return true;
        }
    }

    /**
     * Obtiene métricas actuales de uso
     */
    static async getMetrics() {
        const metrics = {};
        for (const modelId of Object.keys(LIMITS)) {
            const bucket = new Date().toISOString().substring(0, 13);
            const key = `rate:${modelId}:${bucket}`;
            const count = await redis.get(key);
            metrics[modelId] = {
                usage: count ? parseInt(count) : 0,
                limit: LIMITS[modelId]
            };
        }
        return metrics;
    }
}

export default RateGuard;
