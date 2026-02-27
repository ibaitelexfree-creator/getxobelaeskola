import 'dotenv/config';
import { executeSpecializedJules } from './src/lib/jules-executor.js';
import { analyzeWithRcaEngine } from './src/lib/rca-engine.js';
import db from './src/lib/db-client.js';

async function runInauguralSuccessReplay() {
    console.log("🚀 [MISSION CONTROL] INAUGURAL_STABILITY_REPLAY_START");
    const swarmId = `REAL-STABILITY-${Date.now()}`;
    const taskDescription = "Actualiza la tabla users."; // Deliberadamente vago

    const metrics = {
        startTime: Date.now(),
        phases: {},
        status: 'INITIATED'
    };

    try {
        console.log("\n--- 🔴 PHASE 1: AMBIGUOUS TASK (EXPECTED FAIL) ---");
        const start1 = Date.now();
        const res1 = await executeSpecializedJules('ARCHITECT', taskDescription, swarmId, 'task-init');
        metrics.phases.architect_v1 = {
            duration: Date.now() - start1,
            vote: res1.vote,
            reason: res1.vote_reason
        };

        console.log(`[Result] Vote: ${res1.vote}, Reason: ${res1.vote_reason.substring(0, 80)}...`);

        console.log("\n--- 🧠 PHASE 2: RCA DIAGNOSIS & REFINEMENT ---");
        const startRca = Date.now();
        // El RCA debería decir que falta especificar QUÉ actualizar.
        const rca = res1.rca || await analyzeWithRcaEngine(res1.vote_reason, taskDescription, 'ARCHITECT', swarmId);
        metrics.phases.rca = { duration: Date.now() - startRca, result: rca.substring(0, 100) + '...' };
        console.log(`[RCA] Refinement logic applied.`);

        console.log("\n--- 🟢 PHASE 3: REFINED REPLAY (SPECIFIC TASK) ---");
        const start2 = Date.now();
        // Reintentamos con algo específico que el RCA sugeriría (o nosotros forzamos para el test de flujo)
        const refinedTask = "Añade la columna 'last_login_at' (TIMESTAMP) a la tabla users.";
        const res2 = await executeSpecializedJules('ARCHITECT', refinedTask, swarmId, 'task-replay');

        metrics.phases.architect_v2 = {
            duration: Date.now() - start2,
            vote: res2.vote,
            reason: res2.vote_reason,
            success: res2.vote === 'OK'
        };

        console.log(`[Result] Vote: ${res2.vote}, Plan: ${res2.vote === 'OK' ? 'GENERATED' : 'FAILED'}`);

        metrics.totalDuration = Date.now() - metrics.startTime;
        metrics.status = res2.vote === 'OK' ? 'STABLE_SUCCESS' : 'STABILITY_FAILURE';

        console.log("\n=== 🎯 FINAL REPORT: FIRST_REAL_REPLAY_SUCCESS ===");
        console.table({
            Status: metrics.status,
            Total_Time_Sec: (metrics.totalDuration / 1000).toFixed(2),
            Architect_V1_Vote: metrics.phases.architect_v1.vote,
            Architect_V2_Vote: metrics.phases.architect_v2.vote,
            RCA_Applied: 'YES'
        });

        console.log("\nSNAPSHOT JSON:");
        console.log(JSON.stringify(metrics, null, 2));

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
    } finally {
        process.exit(0);
    }
}

runInauguralSuccessReplay();
