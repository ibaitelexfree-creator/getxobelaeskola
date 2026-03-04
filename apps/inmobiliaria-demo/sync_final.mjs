
import postgres from 'postgres';
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function syncSchema() {
    try {
        console.log("Renaming or creating missing columns...");

        // 1. Añadimos video_type si no existe
        await sql.unsafe(`
            ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS video_type VARCHAR(50) DEFAULT 'cinematic_pan';
            ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS error_message TEXT DEFAULT '';
            ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);

        // 2. Aseguramos columnas en properties
        await sql.unsafe(`
            ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
            ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_status VARCHAR(20) DEFAULT 'none';
        `);

        console.log("Database schema is now COMPATIBLE with the code.");
        process.exit(0);
    } catch (e) {
        console.error("Sync failed:", e);
        process.exit(1);
    }
}
syncSchema();
