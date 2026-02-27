
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        console.log('Resetting cost governance for testing...');
        // Reset cost, disable kill switch, and set a high limit just in case
        const res = await pool.query(`
            UPDATE sw2_cost_governance 
            SET 
                total_cost_usd = 0, 
                kill_switch_active = false,
                daily_limit_usd = 100.00
            WHERE date = CURRENT_DATE;
        `);

        if (res.rowCount === 0) {
            console.log('No record for today. Inserting default daily record...');
            await pool.query(`
                INSERT INTO sw2_cost_governance (date, daily_limit_usd, total_cost_usd, kill_switch_active)
                VALUES (CURRENT_DATE, 100.00, 0, false);
            `);
        }

        console.log('Governance reset successful.');
        const check = await pool.query("SELECT * FROM sw2_cost_governance WHERE date = CURRENT_DATE;");
        console.table(check.rows);
    } catch (err) {
        console.error('DB Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
