import postgres from 'postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function check() {
    try {
        const properties = await sql`SELECT title, slug FROM properties`;
        console.log('Properties in DB:', JSON.stringify(properties, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}
check();
