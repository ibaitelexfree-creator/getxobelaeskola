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
        const tables = ['sw2_swarms', 'sw2_tasks', 'sw2_history', 'sw2_audit_results', 'sw2_agent_feedback', 'sw2_rate_limits'];
        for (const table of tables) {
            const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`--- ${table} ---`);
            console.log(res.rows.map(r => r.column_name).join('\n'));
            console.log('\n');
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

check();
