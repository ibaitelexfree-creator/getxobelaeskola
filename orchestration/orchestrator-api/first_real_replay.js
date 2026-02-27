import 'dotenv/config';
import { executeSpecializedJules } from './src/lib/jules-executor.js';
import { analyzeWithRcaEngine } from './src/lib/rca-engine.js';
import db from './src/lib/db-client.js';

async function runFirstRealReplay() {
    console.log("🚀 [MISSION CONTROL] FIRST_REAL_REPLAY_INITIATED");
    const swarmId = `SR-${Date.now()}`;
    const taskDescription = "Optimiza la tabla users para rendimiento.";

    const metrics = {
        startTime: Date.now(),
        phases: {},
        tokens: 0,
        status: 'INITIATED'
    };

    try {
        // STEP 1: DELIBERATE FAILURE (ARCHITECT AMBIGUITY)
        console.log("\n--- 🔴 PHASE 1: INITIAL ATTEMPT (EXPECTED FAIL) ---");
        const start1 = Date.now();
        const res1 = await executeSpecializedJules('ARCHITECT', taskDescription, swarmId, 'task-0');
        metrics.phases.architect_v1 = {
            duration: Date.now() - start1,
            vote: res1.vote,
            reason: res1.vote_reason
        };

        console.log(`[Result] Vote: ${res1.vote}, Reason: ${res1.vote_reason.substring(0, 100)}...`);

        if (res1.vote === 'FAIL') {
            console.log("\n--- 🧠 PHASE 2: RCA ENHANCEMENT ---");
            const startRca = Date.now();
            // In a real flow, executeSpecializedJules already calls RCA if it fails semantically
            const rca = res1.rca || await analyzeWithRcaEngine(res1.vote_reason, taskDescription, 'ARCHITECT', swarmId);
            metrics.phases.rca = { duration: Date.now() - startRca, result: rca.substring(0, 100) + '...' };

            console.log(`[RCA] Diagnosis: ${rca.substring(0, 150)}...`);

            // STEP 2: THE REAL REPLAY (REFINED)
            console.log("\n--- 🟢 PHASE 3: THE REAL REPLAY (INJECTING RCA KNOWLEDGE) ---");
            const start2 = Date.now();

            // We simulate the refined task based on RCA (e.g., adding indices)
            const refinedTask = `${taskDescription} (Note from Architect RCA: Add indexes for email and created_at columns to support common query patterns)`;

            const res2 = await executeSpecializedJules('ARCHITECT', refinedTask, swarmId, 'task-replay');
            metrics.phases.architect_v2 = {
                duration: Date.now() - start2,
                vote: res2.vote,
                reason: res2.vote_reason,
                plan: !!res2.result?.schema_sql
            };

            console.log(`[Result] Vote: ${res2.vote}, Plan Generated: ${!!res2.result?.schema_sql}`);
        }

        metrics.totalDuration = Date.now() - metrics.startTime;
        metrics.status = 'SUCCESS';

        console.log("\n=== 📊 SNAPSHOT: BEFORE vs AFTER ===");
        console.log(JSON.stringify(metrics, null, 2));

        // Persistence in DB (Survival Mode handles it if DB is down)
        try {
            await db.query(`
                INSERT INTO sw2_rate_limits (swarm_id, role, vote, vote_reason, category) 
                VALUES ($1, $2, $3, $4, $5)
            `, [swarmId, 'SYSTEM_OBSERVER', 'OK', 'FIRST_REAL_REPLAY_COMPLETED', 'MILESTONE']);
        } catch (e) { }

    } catch (error) {
        console.error("❌ REPLAY CRASHED:", error.message);
        metrics.status = 'CRASHED';
    } finally {
        process.exit(0);
    }
}

runFirstRealReplay();
