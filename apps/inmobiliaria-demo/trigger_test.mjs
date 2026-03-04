
import axios from 'axios';
import postgres from 'postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function triggerProductionWebhook() {
    const propertyId = 1;
    const webhookUrl = 'https://n8n.srv1368175.hstgr.cloud/webhook/realstate-video-gen-v2';

    try {
        console.log(`Starting real test for Property ID: ${propertyId}...`);

        // 1. Get real data
        const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;

        // 2. Clear old video records for this test
        await sql`DELETE FROM generated_videos WHERE property_id = ${propertyId}`;

        // 3. Insert processing record
        const [video] = await sql`
            INSERT INTO generated_videos (property_id, video_type, status)
            VALUES (${propertyId}, 'cinematic_pan', 'processing')
            RETURNING id
        `;

        console.log(`Step 1: Tracking record created (ID: ${video.id}).`);

        // 4. Trigger n8n
        console.log(`Step 2: Sending Webhook to n8n...`);
        const response = await axios.post(webhookUrl, {
            propertyId: property.id.toString(),
            videoType: 'cinematic_pan',
            imageUrl: property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6199f7d009',
            propertyTitle: property.title,
            propertyType: property.property_type || 'luxury_villa',
            callbackUrl: 'https://getxobelaeskola.cloud/realstate/api/video/callback'
        });

        console.log("✅ Webhook sent successfully!");
        console.log("n8n Response Status:", response.status);

        console.log("\n--- NEXT STEPS ---");
        console.log("1. Check your n8n dashboard for the execution.");
        console.log("2. The video will be generated and uploaded to Supabase.");
        console.log("3. Once finished, n8n will call the callback and the property will show 'ready'.");

        process.exit(0);
    } catch (e) {
        console.error("❌ Test failed:", e.message);
        if (e.response) console.error("Response Data:", e.response.data);
        process.exit(1);
    }
}

triggerProductionWebhook();
