import pg from 'pg';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const POOL = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    const res = await POOL.query("SELECT * FROM sw2_audit_results ORDER BY created_at DESC LIMIT 1");
    console.log(JSON.stringify(res.rows, null, 2));
    await POOL.end();
}
check();
