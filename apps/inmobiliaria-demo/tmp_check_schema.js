
const postgres = require('postgres');
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function checkSchema() {
    try {
        console.log('--- Users Table ---');
        const usersColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;
        console.table(usersColumns);

        console.log('--- Properties Table ---');
        const propertiesColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties';
        `;
        console.table(propertiesColumns);

        console.log('--- Sample User Roles ---');
        const userRoles = await sql`
            SELECT email, role FROM users LIMIT 10;
        `;
        console.table(userRoles);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
