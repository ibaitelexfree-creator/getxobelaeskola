import axios from 'axios';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Manual env load
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const API_URL = 'http://localhost:3000';
const POOL = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function validateLoop() {
    console.log('🧪 Iniciando Validación de Loop CI/CD 2.0...');
    const prompt = 'refactoriza todo el código';

    try {
        console.log(`📡 Enviando prompt ambiguo: "${prompt}"`);
        const triggerRes = await axios.post(`${API_URL}/api/v2/swarm`, {
            prompt,
            name: 'PRUEBA_LOOP_VALIDACION'
        });

        console.log('✅ Swarm aceptado (Swarm ID: ' + (triggerRes.data.swarmId || 'N/A') + ').');
        console.log('⏳ Esperando a que el sistema procese Jules y escale al Auditor (Fallback)...');

        let swarmId = null;
        let auditData = null;
        const startTime = Date.now();
        const timeout = 600000; // 10 min

        while (Date.now() - startTime < timeout) {
            const swarmsRes = await POOL.query(
                "SELECT id, status FROM sw2_swarms WHERE name = 'PRUEBA_LOOP_VALIDACION' ORDER BY created_at DESC LIMIT 1"
            );

            if (swarmsRes.rows.length > 0) {
                const swarm = swarmsRes.rows[0];
                swarmId = swarm.id;

                if (['MANUAL_FIX_REQUIRED', 'CRITICAL_FAILURE', 'NEEDS_REVISION'].includes(swarm.status)) {
                    console.log(`\n🏁 Swarm alcanzado estado terminal: ${swarm.status}`);
                    break;
                }
            }

            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 10000));
        }

        if (!swarmId) throw new Error('Swarm never appeared in DB.');

        // 3. PostgreSQL Verify
        console.log('\n--- [1] POSTGRESQL: sw2_audit_results ---');
        const auditRes = await POOL.query(
            "SELECT * FROM sw2_audit_results WHERE swarm_id = $1 OR original_prompt = $2 ORDER BY created_at DESC LIMIT 1",
            [swarmId, prompt]
        );

        if (auditRes.rows.length > 0) {
            auditData = auditRes.rows[0];
            console.log('Audit ID:', auditData.id);
            console.log('Score:', auditData.audit_score);
            console.log('Recommendation:', auditData.recommendation);
            console.log('Security:', auditData.security_check);
            console.log('Missing Requirements:', auditData.missed_requirements);
        } else {
            console.log('❌ No audit record found in DB.');
        }

        // 4. Qdrant Verify
        console.log('\n--- [2] QDRANT: audit-history ---');
        try {
            // Adjust Qdrant URL if running inside bridge/container vs local
            const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
            const qdrantRes = await axios.post(`${qdrantUrl}/collections/swarm_v2_audit-history/points/search`, {
                vector: [0.0],
                limit: 1,
                with_payload: true,
                filter: {
                    must: [{ key: "recommendation", match: { value: "RETRY" } }]
                }
            });
            console.log('Puntos encontrados:', qdrantRes.data.result.length);
            if (qdrantRes.data.result.length > 0) {
                console.log('Última memoria guardada:', JSON.stringify(qdrantRes.data.result[0].payload, null, 2));
            }
        } catch (e) {
            console.log('⚠️ Qdrant fetch failed (verify collection exists):', e.message);
        }

        console.log('\n--- CONCLUSIÓN ---');
        if (auditData && (auditData.recommendation === 'RETRY' || auditData.recommendation === 'HUMAN_REVIEW')) {
            console.log('🏆 RESULTADO: ÉXITO. El Gate bloqueó la tarea ambigua.');
            console.log('El sistema detectó "refactoriza todo el código" como un riesgo y persiste la memoria.');
        } else {
            console.log('💀 RESULTADO: FALLO o INCONCLUSO.');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await POOL.end();
    }
}

validateLoop();
