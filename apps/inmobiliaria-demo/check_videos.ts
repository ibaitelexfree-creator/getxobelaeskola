import sql from './src/lib/db';

async function check() {
    try {
        const videos = await sql`SELECT * FROM generated_videos ORDER BY created_at DESC LIMIT 5`;
        console.log(JSON.stringify(videos, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
check();
