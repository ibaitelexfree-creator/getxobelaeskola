
import postgres from 'postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function testCallbackLogic() {
    const testPropertyId = 1; // ID 1 existe según mi previa consulta
    const testVideoUrl = 'https://supabase-test-url.mp4';

    try {
        console.log("--- SIMULATING CALLBACK LOGIC ---");

        // 1. Aseguramos que haya un registro en 'processing'
        await sql`
            INSERT INTO generated_videos (property_id, video_type, status)
            VALUES (${testPropertyId}, 'cinematic_pan', 'processing')
            ON CONFLICT DO NOTHING
        `;

        console.log("Step 1: 'processing' record ensured.");

        // 2. Ejecutamos la lógica que haría el endpoint del callback
        const updateVideo = await sql`
            UPDATE generated_videos 
            SET video_url = ${testVideoUrl}, status = 'completed', updated_at = NOW()
            WHERE property_id = ${testPropertyId} AND status = 'processing'
            RETURNING id
        `;

        const updateProperty = await sql`
            UPDATE properties 
            SET video_url = ${testVideoUrl}, video_status = 'ready'
            WHERE id = ${testPropertyId}
            RETURNING id
        `;

        if (updateVideo.length > 0 && updateProperty.length > 0) {
            console.log("Step 2: Database updates SUCCESSFUL (Logic equivalent to 200 OK)");
        } else {
            console.log("Step 2: Database updates FAILED (Check if property exists or is in processing)");
        }

        process.exit(0);
    } catch (e) {
        console.error("Logic test FAILED:", e);
        process.exit(1);
    }
}

testCallbackLogic();
