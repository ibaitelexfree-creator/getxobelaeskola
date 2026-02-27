import pool from '../src/lib/db-client.js';

async function runMigration() {
    try {
        await pool.query('BEGIN');

        console.log('1️⃣ Creando tabla sw2_chaos_history...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sw2_chaos_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                test_type VARCHAR(100) NOT NULL,
                latency_ms INTEGER NOT NULL,
                final_status VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                pipeline_version VARCHAR(50) DEFAULT 'v2.0'
            );
        `);

        console.log('2️⃣ Creando tabla sw2_rate_by_origin para Rate Limiting Inteligente...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sw2_rate_by_origin (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                origin_id VARCHAR(255) NOT NULL,
                date DATE DEFAULT CURRENT_DATE,
                request_count INTEGER DEFAULT 0,
                block_count INTEGER DEFAULT 0,
                UNIQUE(origin_id, date)
            );
        `);

        console.log('3️⃣ Creando tabla sw2_integrity_snapshots para validación forense diaria...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sw2_integrity_snapshots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                manifest_hash VARCHAR(255) NOT NULL,
                signature_valid BOOLEAN NOT NULL,
                checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query('COMMIT');
        console.log('✅ Migración de Producción completada correctamente.');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error en migración:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
