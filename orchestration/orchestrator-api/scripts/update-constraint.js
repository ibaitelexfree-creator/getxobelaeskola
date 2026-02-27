import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Load env
const env = fs.readFileSync(path.resolve('.env'), 'utf8').split('\n');
env.forEach(l => {
    const [k, v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
    try {
        await pool.query(`
            ALTER TABLE sw2_audit_results DROP CONSTRAINT IF EXISTS sw2_audit_results_recommendation_check;
        `);
        console.log('✅ Constraint removed');

        await pool.query(`
            ALTER TABLE sw2_audit_results ADD CONSTRAINT sw2_audit_results_recommendation_check CHECK (recommendation IN ('MERGE', 'RETRY', 'HUMAN_REVIEW', 'BLOCK', 'PROCEED_TRIBUNAL'));
        `);
        console.log('✅ Constraint updated');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    } finally {
        await pool.end();
    }
}

fix();
