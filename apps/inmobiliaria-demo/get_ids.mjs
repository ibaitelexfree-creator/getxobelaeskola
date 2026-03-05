
import postgres from 'postgres';

const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function check() {
    try {
        const rows = await sql`SELECT id, title FROM properties LIMIT 5`;
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
