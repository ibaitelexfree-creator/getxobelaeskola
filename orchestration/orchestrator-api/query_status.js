import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function queryStatus() {
    try {
        const swarms = await pool.query("SELECT * FROM sw2_swarms ORDER BY created_at DESC LIMIT 1");
        console.log("=== Latest Swarm ===");
        console.log(JSON.stringify(swarms.rows, null, 2));

        if (swarms.rows.length > 0) {
            const tasks = await pool.query("SELECT * FROM sw2_tasks WHERE swarm_id=$1 ORDER BY created_at ASC", [swarms.rows[0].id]);
            console.log("\n=== Tasks ===");
            console.log(JSON.stringify(tasks.rows, null, 2));
        }

        const history = await pool.query("SELECT * FROM sw2_history ORDER BY created_at DESC LIMIT 5");
        console.log("\n=== History ===");
        console.log(JSON.stringify(history.rows, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

queryStatus();
