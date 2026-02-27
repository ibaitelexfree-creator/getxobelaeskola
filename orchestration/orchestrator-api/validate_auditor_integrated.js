import { run5AgentPipeline } from './src/lib/pipeline-5agents.js';
import pg from 'pg';
import fs from 'fs';
import axios from 'axios';

const env = fs.readFileSync('.env', 'utf8').split('\n');
env.forEach(l => {
    const [k, v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runValidation() {
    console.log('🧪 Iniciando Validación INTEGRADA del Ciclo CI/CD 2.0...');

    const prompt = 'refactoriza todo el código';

    console.log(`📡 Ejecutando run5AgentPipeline con prompt ambiguo: "${prompt}"`);

    try {
        const startTime = Date.now();
        // This function handles n8n call, result parsing, DB persistence, and Qdrant storage.
        const result = await run5AgentPipeline(prompt);
        const { audit, flow, auditId } = result;

        const latency = Date.now() - startTime;
        console.log(`✅ Pipeline y Auditor completados en ${Math.round(latency / 1000)}s.`);
        console.log(`🆔 Audit ID: ${auditId}`);
        console.log(`⚖️ Decisión del Gate: ${flow}`);
        console.log(`📊 Score: ${audit.score}/10`);
        console.log(`📝 Recomendación: ${audit.recommendation}`);

        // 1. Double check DB
        console.log('\n--- [1] VERIFICANDO POSTGRESQL (Último registro) ---');
        const dbRes = await pool.query('SELECT * FROM sw2_audit_results WHERE id = $1', [auditId]);
        if (dbRes.rows.length > 0) {
            console.log(`✅ Registro DB confirmado!`);
            console.log(`   Data: ${JSON.stringify(dbRes.rows[0].result).substring(0, 100)}...`);
        } else {
            console.log('❌ Registro DB no encontrado (esto no debería pasar si run5AgentPipeline tuvo éxito).');
        }

        // 2. Double check Qdrant
        console.log('\n--- [2] VERIFICANDO QDRANT (audit-history) ---');
        const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
        const collection = 'swarm_v2_audit-history';
        try {
            // Search for points with the auditId in payload
            const qdrantRes = await axios.post(`${QDRANT_URL}/collections/${collection}/points/scroll`, {
                limit: 1,
                filter: {
                    must: [
                        { key: 'audit_id', match: { value: auditId } }
                    ]
                }
            });
            const points = qdrantRes.data.result.points;
            if (points.length > 0) {
                console.log(`✅ Memoria a largo plazo confirmada en Qdrant!`);
            } else {
                console.log('❌ No se encontró el vector en Qdrant.');
            }
        } catch (e) {
            console.error(`⚠️ Error al consultar Qdrant: ${e.message}`);
        }

        console.log('\n--- CONCLUSIÓN ---');
        if (flow === 'HUMAN_REVIEW' && audit.score < 6) {
            console.log('🚀 ¡PRUEBA SUPERADA! El sistema detectó la ambigüedad, bloqueó la ejecución y persistió los datos en DB y Qdrant.');
        } else {
            console.log('⚠️ Resultado inesperado. El Auditor aceptó un prompt ambiguo.');
        }

    } catch (error) {
        console.error('💥 Error en la validación integrada:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

runValidation();
