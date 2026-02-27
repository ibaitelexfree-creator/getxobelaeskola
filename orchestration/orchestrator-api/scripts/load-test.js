import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v2';

/**
 * Load Test for SWARM CI/CD 2.0
 * Triggers multiple parallel swarms to test RateGuard and Database stability.
 */
async function runLoadTest(concurrency = 5) {
    console.log(`🚀 Starting Load Test with concurrency: ${concurrency}`);
    console.log(`📡 Target API: ${API_BASE}/swarm`);

    const tasks = [
        "Implementar un sistema de notificaciones por email",
        "Crear un dashboard de analíticas para el administrador",
        "Añadir autenticación con OAuth2 (Google/Github)",
        "Refactorizar el módulo de base de datos para usar Pool",
        "Optimizar el tiempo de carga de la página principal",
        "Integrar pasarela de pagos con Stripe",
        "Crear sistema de backup automatizado para Qdrant"
    ];

    const results = await Promise.allSettled(
        tasks.slice(0, concurrency).map(task => triggerSwarm(task))
    );

    console.log('\n📊 Swarm Trigger Results:');
    results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
            console.log(`Swarm ${i + 1}: ✅ Accepted - ${res.value.message}`);
        } else {
            console.log(`Swarm ${i + 1}: ❌ Failed - ${res.reason.message}`);
        }
    });

    console.log('\n⏳ Swarms are running in the background. Check Mission Control or Telegram for execution logs.');
}

async function triggerSwarm(prompt) {
    try {
        const response = await axios.post(`${API_BASE}/swarm`, {
            prompt,
            name: `Load Test: ${prompt.substring(0, 20)}`
        });
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        throw new Error(`[API Error] ${msg}`);
    }
}

// Run if called directly
if (process.argv[1].endsWith('load-test.js')) {
    runLoadTest(parseInt(process.argv[2]) || 3).catch(console.error);
}
