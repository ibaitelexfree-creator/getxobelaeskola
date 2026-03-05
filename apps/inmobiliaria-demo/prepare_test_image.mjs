
import postgres from 'postgres';
const DATABASE_URL = 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const sql = postgres(DATABASE_URL);

async function checkPropertyImages() {
    try {
        const [property] = await sql`SELECT id, title, images FROM properties WHERE id = 1`;
        console.log("Property Info:", JSON.stringify(property, null, 2));

        if (!property.images || property.images.length === 0) {
            console.log("Updating property 1 with a sample image for the test...");
            await sql`UPDATE properties SET images = ARRAY['https://images.unsplash.com/photo-1600585154340-be6199f7d009'] WHERE id = 1`;
            console.log("Updated.");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkPropertyImages();
