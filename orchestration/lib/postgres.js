/**
 * PostgreSQL Helper for Token Metering
 */

import pg from 'pg';

let pool = null;

/**
 * Get database connection pool
 */
export function getPool() {
  if (pool) return pool;

  // Only initialize if connection string is provided
  if (!process.env.POSTGRES_URL) {
    console.warn('[Postgres] POSTGRES_URL not configured, metering will be disabled');
    return null;
  }

  const config = {
    connectionString: process.env.POSTGRES_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  console.log(`[Postgres] Connecting to Postgres...`);
  pool = new pg.Pool(config);

  pool.on('error', (err, client) => {
    console.error('[Postgres] Unexpected error on idle client', err);
    // Don't exit process, let pool handle reconnection
  });

  return pool;
}

/**
 * Execute query
 */
export async function query(text, params) {
  const p = getPool();
  if (!p) return null; // Fail gracefully if no DB

  try {
    const start = Date.now();
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    // console.log('[Postgres] executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('[Postgres] Query Error:', error.message);
    throw error;
  }
}

/**
 * Initialize metering table
 */
export async function initMeteringTable() {
  if (!getPool()) return false;

  console.log('[Postgres] Initializing metering schema...');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS token_metering (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        tenant_id TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        endpoint TEXT,
        method TEXT,
        status_code INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add index for querying by user/tenant/date
    await query(`
        CREATE INDEX IF NOT EXISTS idx_token_metering_user_tenant ON token_metering(user_id, tenant_id);
    `);
    await query(`
        CREATE INDEX IF NOT EXISTS idx_token_metering_created_at ON token_metering(created_at);
    `);

    console.log('[Postgres] Metering schema initialized successfully');
    return true;
  } catch (error) {
    console.error('[Postgres] Initialization failed:', error.message);
    return false;
  }
}
