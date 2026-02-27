import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function queryStatus() {
    try {
        const sw2Params = ['25a0a938-0d23-4cf2-897e-f9550ff2fb5d'];
        const hist = await pool.query('SELECT * FROM sw2_history WHERE swarm_id=$1', sw2Params);
        console.log("=== HISTORY ===");
        console.dir(hist.rows, { depth: null });

        const swm = await pool.query('SELECT status, metadata FROM sw2_swarms WHERE id=$1', sw2Params);
        console.log("\n=== SWARM ===");
        console.dir(swm.rows, { depth: null });

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

queryStatus();
