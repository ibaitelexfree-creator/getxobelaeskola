
import postgres from 'postgres';
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function fix() {
    try {
        await sql.unsafe(`
            ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
            ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS error_message TEXT DEFAULT '';
        `);
        console.log("Schema successfully updated.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
