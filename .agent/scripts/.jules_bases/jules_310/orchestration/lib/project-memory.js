import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const MEMORY_DIR = join(PROJECT_ROOT, 'project_memory');

function getFilePath(file) {
    const allowed = ['GLOBAL_STATE.md', 'DECISIONS_LOG.md', 'TECHNICAL_CONTEXT.md', 'AGENT_TASKS.md'];
    if (!allowed.includes(file)) {
        throw new Error(`File "${file}" not allowed. Use: ${allowed.join(', ')}`);
    }
    return join(MEMORY_DIR, file);
}

export function readProjectMemory(file) {
    const filePath = getFilePath(file);
    if (!existsSync(filePath)) {
        return { success: false, error: `File ${file} not found` };
    }
    return { success: true, content: readFileSync(filePath, 'utf-8') };
}

export function writeProjectMemory(file, content) {
    const filePath = getFilePath(file);
    if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
    return { success: true, message: `Updated ${file}` };
}

export function appendToProjectMemory(file, entry) {
    const filePath = getFilePath(file);
    if (!existsSync(filePath)) {
        return { success: false, error: `File ${file} not found` };
    }
    appendFileSync(filePath, '\n' + entry, 'utf-8');
    return { success: true, message: `Appended to ${file}` };
}

export function readAllContext() {
    const files = ['GLOBAL_STATE.md', 'TECHNICAL_CONTEXT.md'];
    const context = {};
    for (const f of files) {
        const result = readProjectMemory(f);
        if (result.success) context[f] = result.content;
    }
    return { success: true, context };
}

export function getParsedTasks() {
    const result = readProjectMemory('AGENT_TASKS.md');
    if (!result.success) return { queue: [], history: [] };

    const content = result.content;
    const sections = content.split('##');

    let queue = [];
    let history = [];

    const parseTable = (text) => {
        const lines = text.split('\n').filter(l => l.trim().startsWith('|'));
        if (lines.length < 3) return []; // Header + separator + at least one row

        const headers = lines[0].split('|').map(h => h.trim().toLowerCase()).filter(Boolean);
        return lines.slice(2).map(line => {
            const cells = line.split('|').map(c => c.trim()).filter(Boolean);
            const row = {};
            headers.forEach((h, i) => {
                row[h] = cells[i];
            });
            return row;
        });
    };

    // Normalize status string → internal status
    const normalizeStatus = (s = '') => {
        const v = s.toLowerCase();
        if (v === 'running' || v === 'en_curso') return 'running';
        if (v === 'completed' || v === 'completada') return 'completed';
        if (v === 'failed' || v === 'fallida') return 'failed';
        return 'queued'; // pendiente, queued, anything else
    };

    sections.forEach(section => {
        const heading = section.toLowerCase();

        if (heading.includes('tareas completadas')) {
            const raw = parseTable(section);
            history = history.concat(raw.map(t => ({
                id: t.id,
                title: t.tarea,
                executor: t.agente ? t.agente.toLowerCase() : 'jules',
                status: t.resultado?.toLowerCase().includes('completado') || t.resultado?.toLowerCase().includes('mezclado') ? 'completed' : 'failed',
                result: t.resultado,
                timestamp: new Date(t.fecha || Date.now()).getTime()
            })));
            return;
        }

        // Match ANY pending/queue section — "cola de tareas pendientes" OR "misiones" OR "operación"
        if (
            heading.includes('cola de tareas pendientes') ||
            heading.includes('misiones') ||
            heading.includes('operaci') // "operación academia"
        ) {
            const raw = parseTable(section);
            const tasks = raw
                .filter(t => t.id && t.agente) // must have id and agent
                .map((t, idx) => ({
                    id: t.id,
                    // "misión" column in ACA tasks, "tarea" in original tasks
                    title: (t['misión'] || t['mision'] || t.tarea || '').replace(/\*\*/g, '').trim(),
                    priority: parseInt(t.prioridad) || 3,
                    executor: t.agente ? t.agente.toLowerCase() : 'jules',
                    status: normalizeStatus(t.estado),
                    createdAt: new Date(t.fecha || Date.now()).getTime(),
                    position: idx + 1
                }))
                // Only dispatch jules tasks that are not already running/done
                .filter(t => t.executor === 'jules' && (t.status === 'queued'));
            queue = queue.concat(tasks);
        }
    });

    return { queue, history };
}
