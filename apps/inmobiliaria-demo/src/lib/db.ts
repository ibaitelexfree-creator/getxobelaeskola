import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2OiK6qVbxGmv@ep-noisy-night-abtosfj1-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(DATABASE_URL);

/**
 * Database connection instance.
 * Used for tagged template queries.
 */
export const getDb = () => sql;
export default sql;
