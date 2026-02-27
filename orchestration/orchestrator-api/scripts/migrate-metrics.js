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

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sw2_audit_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                moving_avg_score NUMERIC(5,2),
                block_rate_pct NUMERIC(5,2),
                human_review_rate_pct NUMERIC(5,2)
            );
        `);
        console.log('✅ Migration: sw2_audit_metrics table created successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrate();
