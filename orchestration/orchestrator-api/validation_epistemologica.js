import dotenv from 'dotenv';
dotenv.config(); // Cargar ANTES de importar módulos que dependen de process.env

import { executeSpecializedJules } from './src/lib/jules-executor.js';
import { analyzeWithRcaEngine } from './src/lib/rca-engine.js';

/**
 * Epistemological Validation Suite for Swarm CI/CD 2.0
 */
async function runValidation() {
    console.log("=== 🔎 INICIANDO ÚLTIMA VALIDACIÓN CRÍTICA: CONFIANZA BAJO AMBIGÜEDAD ===\n");

    // 1. Ambigüedad Semántica Controlada
    console.log("1️⃣  PROBANDO: Ambigüedad Semántica Controlada...");
    const task1 = "Optimiza la tabla users para rendimiento y consistencia.";
    try {
        const res1 = await executeSpecializedJules('ARCHITECT', task1, 'valid-swarm-id-1');
        console.log("   - Voto:", res1.vote);
        console.log("   - Razón:", res1.vote_reason);

        // Criterio de éxito: O falla pidiendo datos, o propone con advertencias.
        const notes = JSON.stringify(res1.result || {}).toLowerCase();
        if (res1.vote === 'OK' && (notes.includes('asumo') || notes.includes('assumption') || notes.includes('hypothes') || notes.includes('ambig'))) {
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
        console.log("   - Categoría:", res2.category);
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
    const noisyLog = "Error: Connection... [TRUNCATED] ...at internal/stream:12:4. No more info available.";
    const task3 = "Sync user database with main node.";
    try {
        console.log("   - Enviando log con ruido al RCA Engine...");
        const res3 = await analyzeWithRcaEngine(noisyLog, task3, 'DEVELOPER', 'swarm-noise-test');
        console.log("   - RCA Output:", res3);
        const resLower = res3.toLowerCase();
        if (resLower.includes('incertidumbre') || resLower.includes('uncertain') || resLower.includes('insufficient') || resLower.includes('truncado') || resLower.includes('limited')) {
            console.log("   ✅ RESULTADO: El RCA Engine declaró honestidad sobre la falta de datos.");
        } else {
            console.log("   ⚠️  WARNING: El RCA podría estar sobre-infiriendo (posible alucinación).");
        }
    } catch (e) {
        console.error("   ❌ ERROR en Test 3:", e.message);
    }

    console.log("\n=== 🎯 VALIDACIÓN FINALIZADA ===");
    process.exit(0);
}

runValidation();
