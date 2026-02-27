import pg from 'pg';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const POOL = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    const res = await POOL.query("SELECT id, swarm_id, agent_role, status FROM sw2_tasks ORDER BY id DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
    await POOL.end();
}
check();
