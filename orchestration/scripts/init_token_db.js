import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/jules';

async function init() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        await client.query(`
            CREATE TABLE IF NOT EXISTS sw2_token_usage (
                id SERIAL PRIMARY KEY,
                job_id TEXT NOT NULL,
                model TEXT NOT NULL,
                phase TEXT NOT NULL, -- 'architect', 'auditor', 'builder' (if builder uses AI)
                input_tokens INTEGER DEFAULT 0,
                output_tokens INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                cost_usd NUMERIC(15,10) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('CREATE INDEX IF NOT EXISTS idx_token_job_id ON sw2_token_usage(job_id);');
        await client.query('CREATE INDEX IF NOT EXISTS idx_token_created_at ON sw2_token_usage(created_at);');

        console.log('Table sw2_token_usage initialized successfully.');
    } catch (err) {
        console.error('Failed to initialize PostgreSQL:', err);
    } finally {
        await client.end();
    }
}

init();
