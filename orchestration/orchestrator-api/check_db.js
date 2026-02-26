
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query("SELECT id, status, original_prompt, created_at FROM swarm_proposals ORDER BY created_at DESC LIMIT 10;");
        console.log('--- LATEST PROPOSALS ---');
        res.rows.forEach(r => {
            console.log(`[${r.id}] Status: ${r.status} | Prompt: ${r.original_prompt.substring(0, 50)}... | At: ${r.created_at}`);
        });
    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
