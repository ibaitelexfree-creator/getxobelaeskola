// launcher_validation.js
import 'dotenv/config'; // Esto asegura que env esté listo
import { executeSpecializedJules } from './src/lib/jules-executor.js';
import { analyzeWithRcaEngine } from './src/lib/rca-engine.js';

async function runValidation() {
    console.log("=== 🔎 INICIANDO ÚLTIMA VALIDACIÓN CRÍTICA: CONFIANZA BAJO AMBIGÜEDAD ===\n");

    // 1. Ambigüedad Semántica Controlada
    console.log("1️⃣  PROBANDO: Ambigüedad Semántica Controlada...");
    const task1 = "Optimiza la tabla users para rendimiento y consistencia.";
    try {
        const res1 = await executeSpecializedJules('ARCHITECT', task1, 'valid-swarm-id-1');
        console.log("   - Voto:", res1.vote);
        console.log("   - Razón:", res1.vote_reason);

        const resText = JSON.stringify(res1.result || {}).toLowerCase();
        if (res1.vote === 'OK' && (resText.includes('asumo') || resText.includes('assumption') || resText.includes('hypothes'))) {
            console.log("   ✅ RESULTADO: El Architect detectó la ambigüedad y declaró sus hipótesis.");
        } else if (res1.vote === 'FAIL') {
            console.log("   ✅ RESULTADO: El Architect rechazó la tarea por falta de especificación (Correcto).");
        } else {
            console.log("   ⚠️  WARNING: El Architect procedió con 'OK' sin declarar incertidumbre.");
        }
    } catch (e) {
        console.error("   ❌ ERROR en Test 1:", e.message);
    }

    console.log("\n--------------------------------------------------\n");

    // 2. Falso Positivo de Contradicción
    console.log("2️⃣  PROBANDO: Falso Positivo de Contradicción...");
    const task2 = "Crea una tabla comments_archive para mover registros antiguos. El sistema ya tiene una tabla llamada comments.";
    try {
        const res2 = await executeSpecializedJules('ARCHITECT', task2, 'valid-swarm-id-2');
        console.log("   - Voto:", res2.vote);
        if (res2.vote === 'OK') {
            console.log("   ✅ RESULTADO: El Architect distinguió correctamente entre tablas similares.");
        } else {
            console.log("   ❌ RESULTADO: El Architect disparó un FALSO POSITIVO de contradicción.");
        }
    } catch (e) {
        console.error("   ❌ ERROR en Test 2:", e.message);
    }

    console.log("\n--------------------------------------------------\n");

    // 3. RCA bajo Ruido Parcial
    console.log("3️⃣  PROBANDO: RCA bajo Ruido Parcial...");
    const noisyLog = "Error: System... [TRUNCATED] ...at main:99:9";
    const task3 = "Deploy global load balancer.";
    try {
        console.log("   - Enviando log ruidoso al RCA Engine...");
        const res3 = await analyzeWithRcaEngine(noisyLog, task3, 'DEVELOPER', 'swarm-noise-test');
        console.log("   - RCA Output:", res3);
        const low = res3.toLowerCase();
        if (low.includes('incertidumbre') || low.includes('uncertain') || low.includes('insufficient') || low.includes('truncado') || low.includes('speculative')) {
            console.log("   ✅ RESULTADO: El RCA declaró incertidumbre ante el ruido.");
        } else {
            console.log("   ⚠️  WARNING: El RCA podría estar sobre-infiriendo.");
        }
    } catch (e) {
        console.error("   ❌ ERROR en Test 3:", e.message);
    }

    console.log("\n=== 🎯 VALIDACIÓN FINALIZADA ===");
    process.exit(0);
}

runValidation();
