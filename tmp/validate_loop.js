import axios from 'axios';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './orchestration/orchestrator-api/.env' });

const API_URL = 'http://localhost:3002'; // Consistent with project setup
const POOL = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function validateLoop() {
    console.log('🧪 Iniciando Validación de Loop CI/CD 2.0...');
    const prompt = 'refactoriza todo el código';

    try {
        // 1. Trigger Swarm
        console.log(`📡 Enviando prompt ambiguo: "${prompt}"`);
        const triggerRes = await axios.post(`${API_URL}/api/v2/swarm`, {
            prompt,
            name: 'PRUEBA_LOOP_VALIDACION'
        });

        console.log('✅ Swarm aceptado. Esperando a que falle Jules y entre el Auditor (Fallback)...');
        console.log('(Esto puede tardar unos minutos debido a los reintentos de Jules)');

        // 2. Poll for Status
        let swarmId = null;
        let auditData = null;
        const startTime = Date.now();
        const timeout = 600000; // 10 min

        while (Date.now() - startTime < timeout) {
            // Find our specific swarm
            const swarmsRes = await POOL.query(
                "SELECT id, status FROM sw2_swarms WHERE name = 'PRUEBA_LOOP_VALIDACION' ORDER BY created_at DESC LIMIT 1"
            );

            if (swarmsRes.rows.length > 0) {
                const swarm = swarmsRes.rows[0];
                swarmId = swarm.id;

                if (['MANUAL_FIX_REQUIRED', 'CRITICAL_FAILURE', 'NEEDS_REVISION'].includes(swarm.status)) {
                    console.log(`🏁 Swarm reached terminal state: ${swarm.status}`);
                    break;
                }
            }

            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 10000));
        }

        if (!swarmId) throw new Error('Swarm never appeared in DB.');

        // 3. Verify PostgreSQL Entry
        console.log('\n\n--- [1] POSTGRESQL: sw2_audit_results ---');
        const auditRes = await POOL.query(
            "SELECT * FROM sw2_audit_results WHERE swarm_id = $1 OR original_prompt = $2 ORDER BY created_at DESC LIMIT 1",
            [swarmId, prompt]
        );

        if (auditRes.rows.length > 0) {
            auditData = auditRes.rows[0];
            console.log(JSON.stringify(auditData, null, 2));
        } else {
            console.log('❌ No audit record found in DB.');
        }

        // 4. Verify Qdrant Memory (Fetch from Qdrant API)
        console.log('\n--- [2] QDRANT: audit-history memory ---');
        try {
            const qdrantRes = await axios.post('http://qdrant:6333/collections/swarm_v2_audit-history/points/search', {
                vector: [0.0],
                limit: 1,
                with_payload: true
            });
            console.log(JSON.stringify(qdrantRes.data.result, null, 2));
        } catch (e) {
            console.log('⚠️ Could not fetch from Qdrant (check if docker is running):', e.message);
        }

        console.log('\n--- CONCLUSIÓN ---');
        if (auditData && auditData.recommendation === 'RETRY' || auditData.recommendation === 'HUMAN_REVIEW') {
            console.log('🔥 TEST EXITOSO: El Auditor bloqueó el prompt ambiguo correctamente.');
        } else if (auditData && auditData.recommendation === 'MERGE') {
            console.log('❌ TEST FALLIDO: El Auditor dejó pasar el prompt ambiguo.');
        } else {
            console.log('❓ TEST INCONCLUSO: No se obtuvo veredicto claro.');
        }

    } catch (e) {
        console.error('❌ Error en validación:', e.message);
    } finally {
        await POOL.end();
    }
}

validateLoop();
