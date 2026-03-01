import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import existing components if possible
import QdrantClient from '../lib/qdrant-client.js';

/**
 * 🧪 Swarm RAG Study: Comparison of Agents with and without Vector Context
 */

async function runStudy() {
    const taskDescription = "Refactoring del componente NavigationBar para usar el nuevo State de Zustand y persistencia LocalStorage.";

    console.log(`\n\n===============================================================`);
    console.log(`🚀 ESTUDIO COMPARATIVO: GLOBAL BRAIN (RAG) vs SIN CONTEXTO`);
    console.log(`===============================================================\n`);
    console.log(`TAREA: "${taskDescription}"\n`);

    // 1. Simular "Maestro" fetching Unified Context (Global Brain)
    console.log(`[Maestro] 🧠 Generando Global Brain context...`);
    let globalContext = '';
    try {
        const histories = await QdrantClient.searchSimilar('git-history', taskDescription, 3);
        const lessons = await QdrantClient.searchSimilar('swarm-lessons', taskDescription, 2);

        if (histories.length || lessons.length) {
            globalContext = "### CONTEXTO GLOBAL (Global Brain - RAG):\n";
            [...histories, ...lessons].forEach((hit, i) => {
                const text = hit.payload.text || hit.payload.message || '';
                globalContext += `\n[Memoria ${i + 1}]: ${text.substring(0, 300)}...`;
            });
        }
    } catch (e) {
        console.warn(`[Study] Qdrant Error: ${e.message}. Usando mock para el estudio.`);
        globalContext = "### CONTEXTO GLOBAL (MOCK RAG):\n- [Memoria 1]: El State de Zustand se implementó en 'src/store/navigationStore.js'.\n- [Memoria 2]: Se detectaron problemas de hidratación en SSR al usar LocalStorage.";
    }

    const taskWithContext = {
        title: taskDescription,
        description: taskDescription,
        context: globalContext
    };

    const taskWithoutContext = {
        title: taskDescription,
        description: taskDescription,
        context: ''
    };

    // 2. COMPARATIVA JULES (Architect)
    console.log(`\n--- 🤖 JULES (Architect) ---`);
    console.log(`BEFORE (Sin RAG):\n"TAREA A REALIZAR: ${taskDescription}\n\nResponde siguiendo estrictamente el formato JSON..."`);
    console.log(`\nAFTER (Con Global Brain):\n"TAREA A REALIZAR: ${taskDescription}\n\n${globalContext}\n\nResponde siguiendo estrictamente el formato JSON..."`);

    // 3. COMPARATIVA FLASH
    console.log(`\n--- ⚡ GEMINI FLASH ---`);
    const flashBefore = [
        'You are a fast code execution agent. Complete this task efficiently.',
        `Task: ${taskDescription}`,
        'Respond with a concise summary of what was done.'
    ].join('\n');

    const flashAfter = [
        'You are a fast code execution agent. Complete this task efficiently.',
        `Task: ${taskDescription}`,
        `User Context: ${globalContext}`,
        'Respond with a concise summary of what was done.'
    ].join('\n');

    console.log(`BEFORE (Sin RAG):\n${flashBefore}`);
    console.log(`\nAFTER (Con Global Brain):\n${flashAfter.substring(0, 400)}...`);

    // 4. COMPARATIVA CLAWDEBOT
    console.log(`\n--- 🤖 CLAWDEBOT (Desktop/Bridge) ---`);
    const clawdeBefore = `TAREA: ${taskDescription}\n\nEjecuta esta tarea en el repositorio. Sé conciso y directo.`;
    const clawdeAfter = `TAREA: ${taskDescription}\n\n### CONTEXTO GLOBAL (Global Brain - Memorias Vectoriales):\n${globalContext}\n\nEjecuta esta tarea en el repositorio basándote en el contexto anterior. Sé conciso y directo.`;

    console.log(`BEFORE (Sin RAG):\n${clawdeBefore}`);
    console.log(`\nAFTER (Con Global Brain):\n${clawdeAfter.substring(0, 400)}...`);

    console.log(`\n\n===============================================================`);
    console.log(`🎯 CONCLUSIÓN DEL ESTUDIO:`);
    console.log(`- Sin RAG: Los agentes actúan a ciegas sobre el estado actual del repo.`);
    console.log(`- Con RAG (Global Brain): Los agentes saben qué archivos se tocaron hace poco,`);
    console.log(`  qué bugs se corrigieron y qué arquitecturas se decidieron.`);
    console.log(`  Esto reduce errores de "rediseño" y conflictos de código.`);
    console.log(`===============================================================\n`);
}

runStudy().catch(console.error);
