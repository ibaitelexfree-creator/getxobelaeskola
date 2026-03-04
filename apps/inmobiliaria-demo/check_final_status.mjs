
import postgres from 'postgres';
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function checkStatus() {
    try {
        const rows = await sql`
            SELECT status, video_url, error_message, updated_at 
            FROM generated_videos 
            WHERE property_id = 1 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        console.log("Current Status in Database:");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkStatus();
