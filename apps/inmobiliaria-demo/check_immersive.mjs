import postgres from 'postgres';

const sql = postgres('postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require');

async function check() {
    try {
        const props = await sql`
            SELECT id, title, depth_maps, video_url 
            FROM properties 
            WHERE depth_maps IS NOT NULL OR video_url IS NOT NULL
        `;
        console.log('Properties with immersive content:', JSON.stringify(props, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}

check();
