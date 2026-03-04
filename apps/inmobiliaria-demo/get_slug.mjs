import postgres from 'postgres';

const sql = postgres('postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require');

async function getSlug() {
    try {
        const [p] = await sql`SELECT slug FROM properties WHERE id = 1`;
        console.log('SLUG_RESULT:' + p.slug);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}

getSlug();
