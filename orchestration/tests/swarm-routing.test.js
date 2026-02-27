import ModelRouter from '../lib/model-router.js';
import RateGuard from '../lib/rate-guard.js';
import pg from '../lib/pg-client.js';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function testRouting() {
    console.log('🚀 Iniciando Test de Orquestación Swarm (Fase 02)...');

    try {
        // 1. Limpiar logs anteriores (opcional, solo para el test)
        await pg.query('DELETE FROM rate_limit_log');
        const bucket = new Date().toISOString().substring(0, 13);
        await redis.del(`rate:${process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'}:${bucket}`);

        // 2. Ejecutar una tarea tipo ARCHITECT
        console.log('\n--- Test 1: Tarea Architect ---');
        const res1 = await ModelRouter.execute(
            "Diseña una API REST para gestionar el inventario de una tienda de drones.",
            { systemPrompt: "Eres un arquitecto de software senior." }
        );
        console.log('✅ Clasificación:', res1.category);
        console.log('✅ Motor usado:', res1.engine);
        console.log('✅ Latencia:', res1.latencyMs, 'ms');

        // 3. Ejecutar una tarea tipo UI
        console.log('\n--- Test 2: Tarea UI ---');
        const res2 = await ModelRouter.execute(
            "Crea un botón flotante con efecto glassmorphism usando CSS puro.",
            { systemPrompt: "Eres un experto en UX/UI." }
        );
        console.log('✅ Clasificación:', res2.category);
        console.log('✅ Motor usado:', res2.engine);

        // 4. Verificar DB
        const dbLogs = await pg.query('SELECT model_id, action, timestamp FROM rate_limit_log ORDER BY timestamp DESC');
        console.log('\n--- Verificación DB (Postgres) ---');
        console.log(`Logs encontrados: ${dbLogs.rowCount}`);
        dbLogs.rows.forEach(log => {
            console.log(`- [${log.timestamp.toISOString()}] ${log.model_id}: ${log.action}`);
        });

        // 5. Verificar Redis
        const metrics = await RateGuard.getMetrics();
        console.log('\n--- Verificación Redis ---');
        console.log(JSON.stringify(metrics, null, 2));

        console.log('\n✨ Todos los componentes de la Fase 02 están operativos.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test Fallido:', error.message);
        process.exit(1);
    }
}

testRouting();
