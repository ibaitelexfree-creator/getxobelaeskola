import pg from 'pg';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync(path.resolve('.env'), 'utf8').split('\n');
env.forEach(l => {
    const [k, v] = l.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query(`
            -- 1. Extend sw2_audit_results for Traceability, Cost, and Versioning
            ALTER TABLE sw2_audit_results 
                ADD COLUMN IF NOT EXISTS correlation_id UUID DEFAULT gen_random_uuid(),
                ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10,5) DEFAULT 0.0,
                ADD COLUMN IF NOT EXISTS pipeline_version VARCHAR(50) DEFAULT 'v2.0',
                ADD COLUMN IF NOT EXISTS embedding_model_version VARCHAR(50) DEFAULT 'gemini-2.0-flash-001',
                ADD COLUMN IF NOT EXISTS auditor_version VARCHAR(50) DEFAULT 'v1.0',
                ADD COLUMN IF NOT EXISTS threshold_policy_version VARCHAR(50) DEFAULT 'v1.0';

            -- 2. Extend sw2_audit_metrics for Drift Detection & Global Cost limits
            ALTER TABLE sw2_audit_metrics
                ADD COLUMN IF NOT EXISTS std_dev_score NUMERIC(5,2) DEFAULT 0.0,
                ADD COLUMN IF NOT EXISTS total_daily_cost_usd NUMERIC(10,5) DEFAULT 0.0;
                
            -- 3. Create sw2_cost_governance table for limits and kill switches
            CREATE TABLE IF NOT EXISTS sw2_cost_governance (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE DEFAULT CURRENT_DATE,
                daily_limit_usd NUMERIC(10,5) DEFAULT 5.0,
                kill_switch_active BOOLEAN DEFAULT FALSE,
                total_cost_usd NUMERIC(10,5) DEFAULT 0.0,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Insert today's row if not exists
            INSERT INTO sw2_cost_governance (date, daily_limit_usd)
            VALUES (CURRENT_DATE, 5.0)
            ON CONFLICT (date) DO NOTHING;
            
        `);
        console.log('✅ Observability & Governance migration completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrate();
