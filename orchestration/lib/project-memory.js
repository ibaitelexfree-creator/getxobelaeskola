import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const PROJECT_ROOT = resolve(process.cwd(), '..');
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
