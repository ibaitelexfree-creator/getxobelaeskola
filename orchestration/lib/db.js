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
        retry_count INTEGER DEFAULT 0,
        requires_approval INTEGER DEFAULT 0,
        source TEXT,
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

    CREATE TABLE IF NOT EXISTS sync_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL,
        metric_value REAL,
        metric_label TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Migration: Check if columns exist, add if not
try {
    const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
    const columnNames = tableInfo.map(c => c.name);

    if (!columnNames.includes('requires_approval')) {
        db.exec("ALTER TABLE tasks ADD COLUMN requires_approval INTEGER DEFAULT 0");
    }
    if (!columnNames.includes('source')) {
        db.exec("ALTER TABLE tasks ADD COLUMN source TEXT");
    }
} catch (e) {
    console.error('[DB Migration] Error:', e.message);
}

/**
 * Tasks API
 */
export const tasks = {
    add: (task) => {
        const stmt = db.prepare(`
            INSERT INTO tasks (external_id, title, executor, status, priority, retry_count, requires_approval, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const info = stmt.run(
            task.id || `T-${Date.now().toString(36).toUpperCase()}`,
            task.title,
            task.executor || 'jules',
            task.status || (task.requires_approval ? 'pending_approval' : 'pending'),
            task.priority || 3,
            task.retry_count || 0,
            task.requires_approval ? 1 : 0,
            task.source || 'orchestrator'
        );
        return info.lastInsertRowid;
    },

    getAll: () => {
        return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    },

    getPending: () => {
        return db.prepare("SELECT * FROM tasks WHERE status IN ('pending', 'en_curso', 'queued', 'running', 'pending_approval') ORDER BY priority ASC, created_at DESC").all();
    },

    getUnapproved: () => {
        return db.prepare("SELECT * FROM tasks WHERE status = 'pending_approval' OR requires_approval = 1 AND status = 'pending' ORDER BY created_at DESC").all();
    },

    getCompleted: () => {
        return db.prepare("SELECT * FROM tasks WHERE status IN ('completed', 'failed', 'completado') ORDER BY updated_at DESC LIMIT 50").all();
    },

    updateStatus: (externalId, status, result = null, incRetry = false) => {
        const stmt = db.prepare(`
            UPDATE tasks
            SET status = ?, result = ?, retry_count = retry_count + ?, updated_at = CURRENT_TIMESTAMP
            WHERE external_id = ?
        `);
        return stmt.run(status, result, incRetry ? 1 : 0, externalId);
    },

    updateTask: (externalId, updates) => {
        const fields = [];
        const values = [];

        if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
        if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
        if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
        if (updates.executor !== undefined) { fields.push('executor = ?'); values.push(updates.executor); }

        if (fields.length === 0) return null;

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(externalId);

        const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE external_id = ?`);
        return stmt.run(...values);
    },

    deleteTask: (externalId) => {
        return db.prepare('DELETE FROM tasks WHERE external_id = ?').run(externalId);
    },

    approveTask: (externalId) => {
        return db.prepare("UPDATE tasks SET status = 'pending', requires_approval = 0, updated_at = CURRENT_TIMESTAMP WHERE external_id = ?").run(externalId);
    },

    clear: () => {
        return db.prepare('DELETE FROM tasks WHERE status = "pending" OR status = "pending_approval"').run();
    },

    clearDeprecated: () => {
        // Clear tasks that are not AGA or ACA (Legacy ones)
        return db.prepare("DELETE FROM tasks WHERE external_id NOT LIKE 'ACA-%' AND external_id NOT LIKE 'AGA-%' AND status != 'running'").run();
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

/**
 * Sync History API
 */
export const syncHistory = {
    add: (data) => {
        const stmt = db.prepare(`
            INSERT INTO sync_history (service_id, status, metric_value, metric_label)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(data.service_id, data.status, data.metric_value, data.metric_label);
    },
    getHistory: (serviceId = null, limit = 100) => {
        if (serviceId) {
            return db.prepare('SELECT * FROM sync_history WHERE service_id = ? ORDER BY timestamp DESC LIMIT ?').all(serviceId, limit);
        }
        return db.prepare('SELECT * FROM sync_history ORDER BY timestamp DESC LIMIT ?').all(limit);
    },
    getAggregated: (days = 7) => {
        return db.prepare(`
            SELECT service_id, status, metric_value, metric_label, timestamp
            FROM sync_history
            WHERE timestamp >= date('now', ?)
            ORDER BY timestamp ASC
        `).all(`-${days} days`);
    }
};

/**
 * Settings API
 */
export const settings = {
    get: (key) => {
        const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
        return result ? result.value : null;
    },
    set: (key, value) => {
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        return stmt.run(key, value.toString());
    },
    all: () => {
        return db.prepare('SELECT * FROM settings').all();
    }
};

export default db;
