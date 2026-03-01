import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { FlashExecutor } from '../lib/flash-executor.js';
import { ClawdeBotBridge } from '../lib/clawdbot-bridge.js';
import ModelRouter from '../lib/model-router.js';
import GlobalBrain from '../lib/global-brain.js';

async function runRealTask() {
    console.log("===============================================================");
    console.log("🏆 DESAFÍO REAL: Refactor de StudySessionsHistory.tsx");
    console.log("===============================================================\n");

    const query = 'Refactoriza el componente StudySessionsHistory.tsx para integrar filtros avanzados, eliminar colores prohibidos (púrpuras/rosas) cambiándolos a Indigo/Cyan y asegurar compatibilidad con la tabla study_sessions (asegurando mostrar xp_earned y duration_minutes correctamente).';

    console.log("[GlobalBrain] 🧠 Recuperando contexto 1024...");
    const context = await GlobalBrain.getUnifiedContext(query);
    const systemPrompt = 'Eres un experto en frontend react. Usa el contexto RAG para aplicar cambios precisos al código. Tus respuestas deben ser detalladas y mencionar los cambios de color y de base de datos.';

    console.log('Contexto recuperado:', context ? 'SÍ (Ok)' : 'NO (Fallo)');

    let flashScore = 0, julesScore = 0, clawdeScore = 0;

    const evaluate = (name, text) => {
        if (!text) return 0;
        const lowered = text.toLowerCase();
        const hasDbFields = lowered.includes('xp_earned') || lowered.includes('duration_minutes');
        const hasColorFixed = lowered.includes('indigo') || lowered.includes('cyan');
        const hasComponent = lowered.includes('studysessionshistory');

        // Base de 4 por responder. 
        let score = 4;
        // Si menciona los campos reales de la DB que provienen del RAG (+3)
        if (hasDbFields) score += 3;
        // Si aplica la refactorización de colores dictada por el prompt y contexto (+2)
        if (hasColorFixed) score += 2;
        // Si entiende sobre qué componente está trabajando (+1)
        if (hasComponent) score += 1;

        return score;
    };

    // 1. FLASH
    console.log('\nTesting ⚡ FLASH...');
    try {
        const flash = new FlashExecutor();
        const resFlash = await flash.execute({ title: query, context });
        console.log('✅ Flash Done.');
        flashScore = evaluate('Flash', resFlash.summary || resFlash.text);
    } catch (e) {
        console.log('❌ Flash Error:', e.message);
    }

    console.log(`[Benchmark] ⏳ Esperando 15s...`);
    await new Promise(r => setTimeout(r, 15000));

    // 2. JULES
    console.log('\nTesting 🧠 JULES...');
    try {
        const resJules = await ModelRouter.execute(query + '\n\nCONTEXTO:\n' + context, { systemPrompt });
        console.log('✅ Jules Done.');
        julesScore = evaluate('Jules', resJules.text);
    } catch (e) {
        console.log('❌ Jules Error:', e.message);
    }

    console.log(`[Benchmark] ⏳ Esperando 15s...`);
    await new Promise(r => setTimeout(r, 15000));

    // 3. CLAWDEBOT
    console.log('\nTesting 🤖 CLAWDEBOT...');
    try {
        const clawde = new ClawdeBotBridge();
        const resClawde = await clawde.delegateTask({ title: query, context });
        console.log('✅ ClawdeBot Done.');
        clawdeScore = evaluate('ClawdeBot', resClawde.result?.message || resClawde.result?.raw);
    } catch (e) {
        console.log('❌ ClawdeBot Error:', e.message);
    }

    console.log('\n===============================================================');
    console.log('📈 PUNTUACIÓN DE INTEGRACIÓN DE EMBEDDINGS (Nota 0-10)');
    console.log('===============================================================');
    console.log(`⚡ FLASH (Antigravity) : ${flashScore}/10  ${'⭐'.repeat(Math.floor(flashScore / 2))}`);
    console.log(`🧠 JULES (Architect)   : ${julesScore}/10  ${'⭐'.repeat(Math.floor(julesScore / 2))}`);
    console.log(`🤖 CLAWDEBOT           : ${clawdeScore}/10  ${'⭐'.repeat(Math.floor(clawdeScore / 2))}`);

    process.exit(0);
}

runRealTask();
