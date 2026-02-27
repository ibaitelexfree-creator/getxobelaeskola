import pg from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n');
env.forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length > 0) process.env[k.trim()] = v.join('=').trim();
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'sw2_history'");
        console.log('Columns in sw2_history:', res.rows.map(r => r.column_name).join(', '));

        const res2 = await pool.query("SELECT * FROM sw2_history LIMIT 1");
        console.log('Sample record:', res2.rows[0]);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

check();
