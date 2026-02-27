import 'dotenv/config';
import db from './src/lib/db-client.js';

async function test() {
    try {
        console.log("Checking DB connection with URL:", process.env.DATABASE_URL);
        const res = await db.query('SELECT current_database(), current_user');
        console.log("Connected to:", res.rows[0]);

        const swarms = await db.query('SELECT count(*) FROM sw2_swarms');
        console.log("Swarms count:", swarms.rows[0].count);

        const lastSwarm = await db.query('SELECT id, name, status FROM sw2_swarms ORDER BY id DESC LIMIT 1');
        if (lastSwarm.rows.length > 0) {
            console.log("Last Swarm:", lastSwarm.rows[0]);

            const tasks = await db.query('SELECT id, agent_role, status, error_log FROM sw2_tasks WHERE swarm_id = $1', [lastSwarm.rows[0].id]);
            console.log("Tasks for last swarm:", tasks.rows);
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await db.end();
    }
}

test();
