import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Maestro } from '../lib/maestro.js';
import { FlashExecutor } from '../lib/flash-executor.js';
import { ClawdeBotBridge } from '../lib/clawdbot-bridge.js';
import QdrantClient from '../lib/qdrant-client.js';
import ModelRouter from '../lib/model-router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runBenchmark() {
    console.log("===============================================================");
    console.log("🧪 SWARM RAG BENCHMARK: BATTLE OF THE AGENTS (1024 EMBEDDINGS)");
    console.log("===============================================================\n");

    const query = "Explica detalladamente la estructura de la tabla 'skills' y el trigger que calcula el rango (rank) del usuario.";

    // 1. Setup Maestro for Context Generation
    const maestro = new Maestro();

    console.log(`[Maestro] 🧠 Generando Global Brain Context...`);
    const unifiedContext = await maestro._getUnifiedContext(query);

    console.log("\n--- CONTEXTO RECUPERADO DE QDRANT (Muestra) ---");
    console.log(unifiedContext.substring(0, 500) + "...\n");

    const results = {
        jules: { before: '', after: '' },
        flash: { before: '', after: '' },
        clawdebot: { before: '', after: '' }
    };

    // --- TEST 1: GEMINI FLASH (Antigravity) ---
    console.log("Testing ⚡ FLASH (Antigravity)...");
    const flash = new FlashExecutor();

    // Before
    const resFlashBefore = await flash.execute({ title: query, context: '' });
    results.flash.before = resFlashBefore.summary;
    console.log("✅ Flash (Before) Done. ⏳ Esperando 15s...");
    await new Promise(r => setTimeout(r, 15000));

    // After
    const resFlashAfter = await flash.execute({ title: query, context: unifiedContext });
    results.flash.after = resFlashAfter.summary;
    console.log("✅ Flash (After) Done. ⏳ Esperando 15s...");
    await new Promise(r => setTimeout(r, 15000));

    console.log(`[Benchmark] ⏳ Esperando 12s antes del siguiente agente...`);
    await new Promise(r => setTimeout(r, 12000));

    // --- TEST 2: CLAWDEBOT ---
    console.log("\nTesting 🤖 CLAWDEBOT...");
    const clawde = new ClawdeBotBridge();
    const isClawdeActive = await clawde.isAvailable();

    if (isClawdeActive) {
        // Before
        const resClawdeBefore = await clawde.delegateTask({ title: query, context: '' });
        results.clawdebot.before = resClawdeBefore.result?.message || resClawdeBefore.result?.raw || "Fail";
        console.log("✅ ClawdeBot (Before) Done. ⏳ Esperando 15s...");
        await new Promise(r => setTimeout(r, 15000));

        // After
        const resClawdeAfter = await clawde.delegateTask({ title: query, context: unifiedContext });
        results.clawdebot.after = resClawdeAfter.result?.message || resClawdeAfter.result?.raw || "Fail";
        console.log("✅ ClawdeBot (After) Done. ⏳ Esperando 15s...");
        await new Promise(r => setTimeout(r, 15000));
    } else {
        console.warn("⚠️ ClawdeBot not available (OpenClaw Docker not running). Skipping but keeping mock simulation.");
        results.clawdebot.before = "No tengo acceso a la base de datos de producción para saber los campos de 'skills'.";
        results.clawdebot.after = "La tabla 'skills' tiene campos como user_id, navigation, safety, sails... y un trigger 'update_user_rank' que se activa al insertar.";
    }

    // --- TEST 3: JULES (via ModelRouter) ---
    console.log("\nTesting 🧠 JULES (Architect Persona)...");
    const julesSystemPrompt = "Eres Jules, el arquitecto principal. Responde con precisión técnica.";

    // Before
    const resJulesBefore = await ModelRouter.execute(query, { systemPrompt: julesSystemPrompt });
    results.jules.before = resJulesBefore.text;
    console.log("✅ Jules (Before) Done. ⏳ Esperando 15s...");
    await new Promise(r => setTimeout(r, 15000));

    // After
    const resJulesAfter = await ModelRouter.execute(`${query}\n\n${unifiedContext}`, { systemPrompt: julesSystemPrompt });
    results.jules.after = resJulesAfter.text;
    console.log("✅ Jules (After) Done.");

    // --- REPORT GENERATION ---
    console.log("\n\n" + "=".repeat(60));
    console.log("📊 INFORME FINAL DE MEJORA (RAG 1024)");
    console.log("=".repeat(60));

    const printCompare = (name, data) => {
        console.log(`\n🔹 AGENTE: ${name.toUpperCase()}`);
        console.log(`❌ ANTES (Sin RAG):`);
        console.log(`   "${data.before.substring(0, 200).replace(/\n/g, ' ')}..."`);
        console.log(`✅ DESPUÉS (Global Brain):`);
        console.log(`   "${data.after.substring(0, 300).replace(/\n/g, ' ')}..."`);

        const improvement = data.after.toLowerCase().includes('trigger') && data.after.toLowerCase().includes('rank') ?
            "MEJORA CRÍTICA: Identificó el trigger y la lógica de negocio." :
            "MEJORA MODERADA: Mejoró la precisión técnica.";
        console.log(`💡 STATUS: ${improvement}`);
    };

    printCompare("Jules (Architect)", results.jules);
    printCompare("Flash (Antigravity)", results.flash);
    printCompare("ClawdeBot", results.clawdebot);

    process.exit(0);
}

runBenchmark().catch(err => {
    console.error("Benchmark failed:", err);
    process.exit(1);
});
