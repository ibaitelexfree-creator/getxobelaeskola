import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuración del Pool de PostgreSQL
// Priorizamos DATABASE_URL que ya está configurada en el .env local y Docker
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/jules';

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Ejecuta una consulta simple
 * @param {string} text 
 * @param {any[]} params 
 * @returns {Promise<any>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente del pool para transacciones
 * @returns {Promise<any>}
 */
export const getClient = () => pool.connect();

export default {
    query,
    getClient,
};
