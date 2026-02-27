
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
        const res = await pool.query("UPDATE sw2_cost_governance SET kill_switch_active = false;");
        console.log('Update result:', res.rowCount, 'rows updated.');

        // Also verify the change
        const check = await pool.query("SELECT * FROM sw2_cost_governance;");
        console.table(check.rows);
    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
