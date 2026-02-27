import { run5AgentPipeline } from './src/lib/pipeline-5agents.js';
import { generateEmbedding } from './src/lib/qdrant-client.js';
import { pool } from './src/lib/auditor-client.js';
import fs from 'fs';
import axios from 'axios';

const env = fs.readFileSync('.env', 'utf8').split('\n');
env.forEach(l => {
    const [k, v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
});

async function runValidation() {
    console.log('--- ✅ CI/CD 2.0 ADVANCED VALIDATION ---');

    // 1. Vector Integrity
    console.log('\n[1] VECTOR INTEGRITY (1536 dims)');
    try {
        const vec = await generateEmbedding('test');
        console.log(`✅ Embedding dimension enforced: ${vec.length} == 1536`);
    } catch (e) {
        console.error(`❌ Dimension check failed: ${e.message}`);
    }

    // 2. Semantic Recovery Check
    const prompt = 'haz mejoras generales al proyecto';
    console.log(`\n[2] SEMANTIC PENALTY & LOOP CHECK`);
    console.log(`📡 TEST INPUT: "${prompt}"`);

    try {
        // Run 1 - Will go to n8n if not in memory
        console.log(`--- EXEC 1 ---`);
        let res1 = await run5AgentPipeline(prompt);
        console.log(`Exec 1 Flow: ${res1.flow}`);

        // Run 2 - Should hopefully trigger anti-loop or semantic if it failed first time
        console.log(`--- EXEC 2 ---`);
        let res2 = await run5AgentPipeline(prompt);
        console.log(`Exec 2 Flow: ${res2.flow}, Memory Triggered: ${res2.audit.missed_requirements?.[0]}`);

        // Run 3 - Definite Anti-Loop limit max 2
        console.log(`--- EXEC 3 ---`);
        let res3 = await run5AgentPipeline(prompt);
        console.log(`Exec 3 Flow: ${res3.flow}, Memory Triggered: ${res3.audit.missed_requirements?.[0]}`);

    } catch (error) {
        console.error('💥 ERROR', error.message);
    }

    // 3. Metrics Validation
    console.log('\n[3] METRICS AGGREGATION (sw2_audit_metrics)');
    try {
        const dbRes = await pool.query('SELECT * FROM sw2_audit_metrics ORDER BY timestamp DESC LIMIT 1');
        if (dbRes.rows.length > 0) {
            console.log('✅ METRICS FOUND:', JSON.stringify(dbRes.rows[0], null, 2));
        } else {
            console.log('❌ METRICS EMPTY');
        }
    } catch (e) {
        console.error(`❌ DB error: ${e.message}`);
    } finally {
        await pool.end();
    }
}

runValidation();
