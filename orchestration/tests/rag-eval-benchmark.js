import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Configurar entorno correctamente antes de cargar las librerías
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { FlashExecutor } from '../lib/flash-executor.js';
import { ClawdeBotBridge } from '../lib/clawdbot-bridge.js';
import ModelRouter from '../lib/model-router.js';

async function runBenchmark() {
    console.log('\n===============================================================');
    console.log('🏆 EJECUCIÓN DEL DESAFÍO CONTRA LOS 3 AGENTES (SIMULANDO OLLAMA 1024)');
    console.log('===============================================================\n');

    const query = 'Refactoriza el componente StudySessionsHistory.tsx para integrar filtros avanzados, eliminar colores prohibidos y asegurar compatibilidad DB.';

    // Aquí inyectamos el contexto directamente (Simulación de lo que recuperaría el GlobalBrain si no se bloquea)
    const context = `[RECUPERACIÓN RAG EXITOSA: 92% similitud]
    ---
    Archivo: ARCHITECTURE.md
    Sección: UI StudySessionsHistory
    Contenido: El componente UI muestra el historial de sesiones. La DB (tabla study_sessions) contiene los campos correctos: id, user_id, date, duration_minutes, modules_count, questions_count, xp_earned.
    ---
    Archivo: frontend-specialist.md
    Sección: Purple Ban
    Contenido: REQUISITO DE DISEÑO ESTRICTO: Por orden de diseño (Fase 11), todos los colores púrpuras y rosas deben ser erradicados y reemplazados por una paleta Premium de Indigo (border-indigo-500, bg-indigo-500) y Cyan (text-cyan-400).`;

    const systemPrompt = 'Eres un experto en frontend react. Usa el contexto RAG para aplicar cambios precisos al código.';

    console.log('--- GLOBAL BRAIN CONTEXT (Inyectado exitosamente) ---');
    console.log(context + '\n');

    let flashScore = 0, julesScore = 0, clawdeScore = 0;

    const evaluate = (name, text) => {
        if (!text) return 0;
        const lowered = text.toLowerCase();
        let score = 4; // Nota de base por resolver la tarea principal

        // Puntos extra verificando si USARON LOS DATOS DE LA BASE DEL RAG
        if (lowered.includes('xp_earned') || lowered.includes('duration_minutes')) score += 3;
        if (lowered.includes('indigo') || lowered.includes('cyan')) score += 2;
        if (lowered.includes('studysessionshistory')) score += 1;

        return score;
    };

    // 1. FLASH
    console.log('Testing ⚡ FLASH (Antigravity)...');
    try {
        const flash = new FlashExecutor();
        const resFlash = await flash.execute({ title: query, context, systemPrompt });
        console.log('✅ Flash Done.');
        flashScore = evaluate('Flash', resFlash.summary || resFlash.text);
    } catch (e) { console.log('❌ Flash Error:', e.message); }

    await new Promise(r => setTimeout(r, 6000));

    // 2. CLAWDEBOT
    console.log('\nTesting 🤖 CLAWDEBOT...');
    try {
        const clawde = new ClawdeBotBridge();
        const resClawde = await clawde.delegateTask({ title: query, context });
        console.log('✅ ClawdeBot Done.');
        clawdeScore = evaluate('ClawdeBot', resClawde.result?.message || resClawde.result?.raw);
    } catch (e) { console.log('❌ ClawdeBot Error:', e.message); }

    await new Promise(r => setTimeout(r, 6000));

    // 3. JULES
    console.log('\nTesting 🧠 JULES (Architect)...');
    try {
        const resJules = await ModelRouter.execute(query + '\n\n' + context, { systemPrompt });
        console.log('✅ Jules Done.');
        julesScore = evaluate('Jules', resJules.text);
    } catch (e) { console.log('❌ Jules Error:', e.message); }

    console.log('\n===============================================================');
    console.log('📈 NOTA DE EMBEDDINGS Y COMPORENSIÓN DEL RAG (0-10)');
    console.log('===============================================================');
    console.log(`⚡ FLASH (Antigravity) : ${flashScore}/10  ${'⭐'.repeat(Math.floor(flashScore / 2))}`);
    console.log(`🤖 CLAWDEBOT           : ${clawdeScore}/10  ${'⭐'.repeat(Math.floor(clawdeScore / 2))}`);
    console.log(`🧠 JULES (Architect)   : ${julesScore}/10  ${'⭐'.repeat(Math.floor(julesScore / 2))}`);

    process.exit(0);
}

runBenchmark().catch(console.error);
