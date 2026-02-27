
import db from './src/lib/db-client.js';

async function migrate() {
    try {
        console.log("Migrating DB...");
        await db.query(`
            ALTER TABLE sw2_performance_metrics 
            ADD COLUMN IF NOT EXISTS tpms NUMERIC(15,4),
            ADD COLUMN IF NOT EXISTS throughput_efficiency NUMERIC(15,4),
            ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 2,
            ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
        `);
        console.log("Migration complete!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
migrate();
