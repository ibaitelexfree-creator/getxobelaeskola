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

    sections.forEach(section => {
        if (section.toLowerCase().includes('cola de tareas pendientes')) {
            const raw = parseTable(section);
            queue = raw.map((t, idx) => ({
                id: t.id,
                title: t.tarea,
                priority: parseInt(t.prioridad) || 3,
                executor: t.agente ? t.agente.toLowerCase() : 'jules',
                status: t.estado === 'en_curso' ? 'running' : 'queued',
                createdAt: new Date(t.fecha || Date.now()).getTime(),
                position: idx + 1
            }));
        } else if (section.toLowerCase().includes('tareas completadas')) {
            const raw = parseTable(section);
            history = raw.map(t => ({
                id: t.id,
                title: t.tarea,
                executor: t.agente ? t.agente.toLowerCase() : 'jules',
                status: t.resultado?.toLowerCase().includes('completado') || t.resultado?.toLowerCase().includes('mezclado') ? 'completed' : 'failed',
                result: t.resultado,
                timestamp: new Date(t.fecha || Date.now()).getTime()
            }));
        }
    });

    return { queue, history };
}
