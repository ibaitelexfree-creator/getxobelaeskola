import Database from 'better-sqlite3';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../mission-control.db');

// Ensure database directory exists
if (!fs.existsSync(dirname(DB_PATH))) {
    fs.mkdirSync(dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id TEXT UNIQUE,
        title TEXT NOT NULL,
        executor TEXT DEFAULT 'jules',
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 3,
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT NOT NULL,
        event TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );
`);

/**
 * Tasks API
 */
export const tasks = {
    add: (task) => {
        const stmt = db.prepare(`
            INSERT INTO tasks (external_id, title, executor, status, priority, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const info = stmt.run(
            task.id || `T-${Date.now().toString(36).toUpperCase()}`,
            task.title,
            task.executor || 'jules',
            task.status || 'pending',
            task.priority || 3
        );
        return info.lastInsertRowid;
    },

    getAll: () => {
        return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    },

    getPending: () => {
        return db.prepare("SELECT * FROM tasks WHERE status IN ('pending', 'en_curso', 'queued', 'running') ORDER BY priority ASC, created_at DESC").all();
    },

    getCompleted: () => {
        return db.prepare("SELECT * FROM tasks WHERE status IN ('completed', 'failed', 'completado') ORDER BY updated_at DESC LIMIT 50").all();
    },

    updateStatus: (externalId, status, result = null) => {
        const stmt = db.prepare(`
            UPDATE tasks 
            SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE external_id = ?
        `);
        return stmt.run(status, result, externalId);
    },

    clear: () => {
        return db.prepare('DELETE FROM tasks WHERE status = "pending"').run();
    }
};

/**
 * Logs API
 */
export const logs = {
    add: (service, event, details = '') => {
        const stmt = db.prepare('INSERT INTO service_logs (service, event, details) VALUES (?, ?, ?)');
        return stmt.run(service, event, typeof details === 'object' ? JSON.stringify(details) : details);
    },
    getRecent: (limit = 100) => {
        return db.prepare('SELECT * FROM service_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
    }
};

export default db;
