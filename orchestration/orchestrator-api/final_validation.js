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
    console.log('--- CI/CD 2.0 LOOP VALIDATION REPORT ---');
    console.log('Target: End-to-End Auditor & Gate Sync\n');

    const prompt = 'refactoriza todo el código';
    console.log(`📡 TEST INPUT: "${prompt}"`);

    try {
        const startTime = Date.now();
        const result = await run5AgentPipeline(prompt);
        const { audit, flow, auditId } = result;
        const latency = Date.now() - startTime;

        console.log(`⏱️ PIPELINE LATENCY: ${Math.round(latency / 1000)}s`);
        console.log(`🆔 AUDIT ROW ID: ${auditId}`);
        console.log(`⚖️ GATE DECISION: ${flow}`);
        console.log(`📊 AUDITOR SCORE: ${audit.score}/10`);
        console.log(`📝 AUDITOR RECOMMENDATION: ${audit.recommendation}`);

        // 1. Verify PostgreSQL
        console.log('\n[1] POSTGRESQL (sw2_audit_results)');
        const dbRes = await pool.query('SELECT * FROM sw2_audit_results WHERE id = $1', [auditId]);
        if (dbRes.rows.length > 0) {
            console.log('✅ TABLE: sw2_audit_results -> RECORD FOUND');
            console.log(`   Data persisted: Score=${dbRes.rows[0].audit_score}, Recommendation=${dbRes.rows[0].recommendation}`);
        } else {
            console.log('❌ TABLE: sw2_audit_results -> RECORD NOT FOUND');
        }

        // 2. Verify Qdrant
        console.log('\n[2] QDRANT (audit-history)');
        const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
        const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
        const collection = 'swarm_v2_audit-history';
        try {
            const headers = {};
            if (QDRANT_API_KEY) {
                headers['api-key'] = QDRANT_API_KEY;
            }
            const qdrantRes = await axios.post(`${QDRANT_URL}/collections/${collection}/points/scroll`, {
                limit: 1,
                filter: { must: [{ key: 'audit_id', match: { value: auditId } }] }
            }, { headers });
            const points = qdrantRes.data.result.points;
            if (points.length > 0) {
                console.log('✅ COLLECTION: swarm_v2_audit-history -> VECTOR FOUND');
                console.log(`   Memory Payload: ${JSON.stringify(points[0].payload)}`);
            } else {
                console.log('❌ COLLECTION: swarm_v2_audit-history -> VECTOR NOT FOUND');
            }
        } catch (e) {
            console.error(`⚠️ Qdrant check error: ${e.message}`);
        }

        console.log('\n--- FINAL VERDICT ---');
        if (flow === 'RETRY' || flow === 'HUMAN_REVIEW') {
            console.log('🚀 SYSTEM STATUS: GREEN (Correctly blocked ambiguous prompt)');
            console.log('The "Agent 6 Auditor" successfully prevented a high-risk swarm execution.');
        } else {
            console.log('⚠️ SYSTEM STATUS: RED (Failed to block)');
        }

    } catch (error) {
        console.error('💥 CRITICAL ERROR DURING VALIDATION:', error.message);
    } finally {
        await pool.end();
    }
}

runValidation();
