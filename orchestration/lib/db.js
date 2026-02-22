/**
 * MySQL Database Helper for Jules Orchestration
 */

import mysql from 'mysql2/promise';

let pool = null;

/**
 * Get database connection pool
 */
export function getPool() {
    if (pool) return pool;

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'jules',
        password: process.env.DB_PASSWORD || 'jules_pass',
        database: process.env.DB_NAME || 'jules_mission_control',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    console.log(`[DB] Connecting to MySQL at ${config.host}:${config.database}`);
    pool = mysql.createPool(config);
    return pool;
}

/**
 * Execute query
 */
export async function query(sql, params) {
    try {
        const [results] = await getPool().execute(sql, params);
        return results;
    } catch (error) {
        console.error('[DB] Query Error:', error.message);
        throw error;
    }
}

/**
 * Initialize database schema
 */
export async function initDb() {
    console.log('[DB] Initializing schema...');
    try {
        // Pool state table
        await query(`
            CREATE TABLE IF NOT EXISTS pool_state (
                id INT PRIMARY KEY DEFAULT 1,
                state_json JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CHECK (id = 1)
            )
        `);

        // Session history table
        await query(`
            CREATE TABLE IF NOT EXISTS session_history (
                id VARCHAR(255) PRIMARY KEY,
                title TEXT NOT NULL,
                executor VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                latency_ms INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('[DB] Database initialized successfully');
        return true;
    } catch (error) {
        console.error('[DB] Initialization failed:', error.message);
        // Do not throw, allow fallback to local files if DB not ready
        return false;
    }
}
