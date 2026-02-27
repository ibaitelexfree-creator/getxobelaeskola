import axios from 'axios';
import fs from 'fs';
import pg from 'pg';

const env = fs.readFileSync('.env', 'utf8').split('\n');
env.forEach(l => {
    const [k, v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runValidation() {
    console.log('🧪 Iniciando Validación Directa del Auditor (Agent 6)...');

    const prompt = 'refactoriza todo el código';
    const webhookUrl = process.env.N8N_PIPELINE_5AGENTS_URL;

    console.log(`📡 Disparando Pipeline 5 Agentes (Rescue) con prompt ambiguo: "${prompt}"`);

    try {
        const startTime = Date.now();
        const response = await axios.post(webhookUrl, {
            prompt,
            timestamp: new Date().toISOString(),
            context: 'Simulación de fallo del Swarm regular para probar el Auditor.'
        }, { timeout: 180000 }); // 3 mins for full 5-agent logic

        const latency = Date.now() - startTime;
        console.log(`✅ Pipeline respondió en ${Math.round(latency / 1000)}s.`);

        const rawResult = response.data;
        console.log('--- [RESULTADO DEL PIPELINE] ---');
        console.log(JSON.stringify(rawResult, null, 2));

        let audit = rawResult;
        if (Array.isArray(rawResult)) audit = rawResult[0];

        console.log(`\n⚖️ DECISIÓN DEL AUDITOR:`);
        console.log(`   - Score: ${audit.score || 'N/A'}`);
        console.log(`   - Recomendación: ${audit.recommendation || 'N/A'}`);
        console.log(`   - Conflictos: ${audit.qdrant_conflict || 'N/A'}`);

        // 1. Verify PostgreSQL
        console.log('\n--- [1] VERIFICANDO POSTGRESQL (sw2_audit_results) ---');
        const dbRes = await pool.query('SELECT * FROM sw2_audit_results ORDER BY created_at DESC LIMIT 1');
        if (dbRes.rows.length > 0) {
            const row = dbRes.rows[0];
            console.log(`✅ Registro encontrado! ID: ${row.id}`);
            console.log(`   Score en DB: ${row.score}`);
        } else {
            console.log('❌ No se encontró el registro en la base de datos.');
        }

        // 2. Verify Qdrant
        console.log('\n--- [2] VERIFICANDO QDRANT (audit-history) ---');
        const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
        const collection = 'swarm_v2_audit-history';
        try {
            const qdrantRes = await axios.get(`${QDRANT_URL}/collections/${collection}/points/scroll?limit=1`);
            const points = qdrantRes.data.result.points;
            if (points.length > 0) {
                console.log(`✅ Vector de memoria encontrado en Qdrant! ID: ${points[0].id}`);
            } else {
                console.log('❌ No se encontraron puntos en la memoria de Qdrant.');
            }
        } catch (e) {
            console.error(`⚠️ Error al consultar Qdrant: ${e.message}`);
        }

        console.log('\n--- CONCLUSIÓN ---');
        console.log('🚀 Validación completada.');

    } catch (error) {
        console.error('💥 Error en la validación:', error.message);
        if (error.response) console.error('Response Status:', error.response.status);
    } finally {
        await pool.end();
    }
}

runValidation();
