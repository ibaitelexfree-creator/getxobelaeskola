import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function queryStatus() {
    try {
        const sw2Params = ['25a0a938-0d23-4cf2-897e-f9550ff2fb5d'];
        const r = await pool.query('SELECT * FROM sw2_tasks WHERE swarm_id=$1', sw2Params);
        console.dir(r.rows, { depth: null });
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

queryStatus();
