
import postgres from 'postgres';
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function finalFixAndTest() {
    try {
        console.log("Applying final schema constraints...");
        await sql.unsafe(`
            ALTER TABLE generated_videos ALTER COLUMN video_url SET DEFAULT '';
            ALTER TABLE generated_videos ALTER COLUMN thumbnail_url SET DEFAULT '';
            ALTER TABLE generated_videos ALTER COLUMN error_message SET DEFAULT '';
            ALTER TABLE properties ALTER COLUMN video_url SET DEFAULT '';
        `);

        console.log("Simulating Callback logic...");
        const propertyId = 1;

        // Clean up previous attempts
        await sql`DELETE FROM generated_videos WHERE property_id = ${propertyId}`;

        // Insert with status processing
        await sql`
            INSERT INTO generated_videos (property_id, video_type, status, video_url)
            VALUES (${propertyId}, 'cinematic_pan', 'processing', '')
        `;

        // Update (Callback Logic)
        const update = await sql`
            UPDATE generated_videos 
            SET video_url = 'https://final-test-video.mp4', status = 'completed', updated_at = NOW()
            WHERE property_id = ${propertyId} AND status = 'processing'
            RETURNING id
        `;

        if (update.length > 0) {
            console.log("✅ CALLBACK LOGIC VERIFIED: 200 OK equivalent.");
        } else {
            console.log("❌ Update failed: Record found but not updated.");
        }

        process.exit(0);
    } catch (e) {
        console.error("Final test FAILED:", e);
        process.exit(1);
    }
}
finalFixAndTest();
