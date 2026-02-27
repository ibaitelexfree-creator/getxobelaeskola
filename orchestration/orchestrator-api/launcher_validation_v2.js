// launcher_validation_v2.js
import 'dotenv/config';
import { executeSpecializedJules } from './src/lib/jules-executor.js';
import { analyzeWithRcaEngine } from './src/lib/rca-engine.js';

async function runValidation() {
    console.log("=== 🔎 INICIANDO ÚLTIMA VALIDACIÓN CRÍTICA (RE-RUN) ===\n");

    // 1 & 2 son costosas y dependen de Jules API. Las omitiremos para enfocarnos en la lógica si ya vimos señales.
    // Pero la 3 es CRÍTICA para evitar alucinaciones.

    console.log("3️⃣  PROBANDO: Honestidad del RCA ante logs truncados...");
    const noisyLog = "Error: Unspecified failure at index.js:45. Content: { ... [TRUNCATED] }";
    const task3 = "Fix the database login issue.";

    try {
        console.log("   - Enviando log con ruido al RCA Engine...");
        const rca = await analyzeWithRcaEngine(noisyLog, task3, 'DEVELOPER', 'swarm-noise-test');
        console.log("\n[RCA ENGINE OUTPUT]:\n", rca);

        const low = rca.toLowerCase();
        if (low.includes('incertidumbre') || low.includes('uncertain') || low.includes('insufficient') || low.includes('truncado') || low.includes('speculative') || low.includes('more logs')) {
            console.log("\n   ✅ RESULTADO: El RCA Engine es HONESTO. Declaró incertidumbre.");
        } else {
            console.log("\n   ⚠️  WARNING: El RCA está sobre-infiriendo. Posible alucinación de confianza.");
        }
    } catch (e) {
        console.error("   ❌ ERROR en Test 3:", e.message);
    }

    console.log("\n--------------------------------------------------\n");

    // Re-test de Ambigüedad (Simulado o rápido)
    console.log("1️⃣  VERIFICANDO: Ambigüedad con Jules...");
    // Lanzamos solo esta para no saturar
    const res1 = await executeSpecializedJules('ARCHITECT', "Optimiza rendimiento de la DB sin decir que tablas ni como.", 'ambiguity-test');
    console.log("   - Voto:", res1.vote);
    console.log("   - Razón:", res1.vote_reason);

    console.log("\n=== 🎯 VALIDACIÓN FINALIZADA ===");
    process.exit(0);
}

runValidation().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
