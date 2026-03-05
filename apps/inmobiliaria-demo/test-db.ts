import sql from './src/lib/db';

async function test() {
    try {
        console.log('Testing connection...');
        const res = await sql`SELECT * FROM users LIMIT 1`;
        console.log('Result:', JSON.stringify(res, null, 2));
    } catch (e) {
        console.error('Database connection error:', e);
    } finally {
        process.exit(0);
    }
}

test();
