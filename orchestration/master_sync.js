import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const DB_PATH = resolve(__dirname, 'mission-control.db');
const db = new Database(DB_PATH);

const JULES_API_KEYS = [
    process.env.JULES_API_KEY,
    process.env.JULES_API_KEY_2,
    process.env.JULES_API_KEY_3,
].filter(Boolean);

// Mock writeProjectMemory for standalone use
function writeProjectMemory(file, content) {
    const MEMORY_DIR = resolve(__dirname, '../project_memory');
    const filePath = resolve(MEMORY_DIR, file);
    if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
}

function julesRequest(apiKey, method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'jules.googleapis.com',
            port: 443,
            path: '/v1alpha' + path,
            method: method,
            headers: {
                'X-Goog-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch { resolve(data); }
                } else {
                    reject(new Error(`Status ${response.statusCode}: ${data}`));
                }
            });
        });
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout after 15 seconds'));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function updateDbStatus(id, status, result = null) {
    const stmt = db.prepare('UPDATE tasks SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE external_id = ?');
    stmt.run(status, result, id);
}

async function syncAll() {
    console.log('--- starting master sync ---');

    // 1. Get all tasks from DB
    const dbTasks = db.prepare('SELECT * FROM tasks').all();

    // 2. Fetch all sessions from all accounts
    const allSessions = [];
    for (const key of JULES_API_KEYS) {
        try {
            const resp = await julesRequest(key, 'GET', '/sessions');
            if (resp.sessions) allSessions.push(...resp.sessions);
        } catch (e) {
            console.error('Error fetching sessions:', e.message);
        }
    }

    console.log(`Fetched ${allSessions.length} sessions from Jules API.`);

    // 3. Match sessions to DB tasks and update
    let updates = 0;
    for (const session of allSessions) {
        const sessionId = session.name?.split('/')?.pop() || 'unknown';
        const state = session.state; // COMPLETED, FAILED, RUNNING, etc.
        let targetStatus = 'running';
        if (state === 'COMPLETED') targetStatus = 'completed';
        if (state === 'FAILED') targetStatus = 'failed';
        if (state === 'WAITING_FOR_APPROVAL' || state === 'AWAITING_PLAN_APPROVAL') targetStatus = 'pending'; // or 'running' depending on preference

        // Find if we have a task for this session ID
        const sessionTask = dbTasks.find(t => t.external_id === sessionId);
        if (sessionTask && sessionTask.status !== targetStatus) {
            updateDbStatus(sessionId, targetStatus, sessionTask.result || `Synced from API: ${state}`);
            updates++;
        }

        // Try to find if we have an ACA- task that matches this session's title
        const sessionTitle = (session.title || '').trim();
        if (sessionTitle) {
            const acaTask = dbTasks.find(t =>
                t.external_id.startsWith('ACA-') &&
                (t.title.includes(sessionTitle) || sessionTitle.includes(t.title.substring(0, 50)))
            );

            if (acaTask && acaTask.status !== targetStatus) {
                console.log(`Matching session ${sessionId} to ${acaTask.external_id}`);
                updateDbStatus(acaTask.external_id, targetStatus, `Matched to session: ${sessionId} (${state})`);
                updates++;
            }
        }
    }

    console.log(`Sync complete. Applied ${updates} status updates.`);

    // Summary
    const stats = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
    console.log('\n--- Current Statistics ---');
    stats.forEach(s => console.log(`${s.status}: ${s.count}`));

    // 4. Sync to Markdown
    console.log('\n--- Syncing to AGENT_TASKS.md ---');
    try {
        const pendingRows = db.prepare("SELECT * FROM tasks WHERE status IN ('pending', 'en_curso', 'queued', 'running', 'pending_approval') ORDER BY priority ASC, created_at DESC").all();
        const completedRows = db.prepare("SELECT * FROM tasks WHERE status IN ('completed', 'failed', 'completado') ORDER BY updated_at DESC LIMIT 100").all();

        let content = '# Tareas de Agentes\n\n## Cola de Tareas Pendientes\n';
        content += '| ID | Prioridad | Agente | Tarea | Estado | Fecha |\n|----|-----------|--------|-------|--------|-------|\n';
        pendingRows.forEach(t => {
            const date = t.created_at ? t.created_at.split(' ')[0] : new Date().toISOString().split('T')[0];
            content += `| ${t.external_id} | ${t.priority} | ${t.executor} | ${t.title} | ${t.status} | ${date} |\n`;
        });

        content += '\n## Tareas Completadas\n';
        content += '| ID | Agente | Tarea | Resultado | Fecha |\n|----|--------|-------|-----------|-------|\n';
        completedRows.forEach(t => {
            const date = t.updated_at ? t.updated_at.split(' ')[0] : new Date().toISOString().split('T')[0];
            content += `| ${t.external_id} | ${t.executor} | ${t.title} | ${t.result || 'completado'} | ${date} |\n`;
        });

        content += '\n## Reglas\n- **Prioridad:** 1 (crítico) → 5 (nice-to-have)\n- **Estado:** `pendiente` → `en_curso` → `review` → `completada`\n- Solo Ibai o Antigravity pueden asignar tareas\n- El agente asignado actualiza su estado aquí';

        writeProjectMemory('AGENT_TASKS.md', content);
    } catch (err) {
        console.error('[DB Sync] Failed to sync to Markdown:', err.message);
    }
}

syncAll().catch(console.error);
