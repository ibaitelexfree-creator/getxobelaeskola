import 'dotenv/config';
import { spawn } from 'child_process';
import { sendTelegramMessage } from './telegram.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RESTARTS = 10;
const RESTART_DELAY = 3000; // 3 seconds
let restartCount = 0;
let lastRestartTime = Date.now();

async function startOrchestrator() {
    console.log(`[Supervisor] Starting Orchestrator API (Attempt ${restartCount + 1})...`);

    // Check for crash loop
    if (Date.now() - lastRestartTime < 10000) {
        restartCount++;
    } else {
        restartCount = 0;
    }
    lastRestartTime = Date.now();

    if (restartCount >= MAX_RESTARTS) {
        const msg = "🚨 *CRASH LOOP DETECTADO*\nEl Orquestador ha fallado demasiadas veces seguidas. Deteniendo reinicios automáticos para evitar spam.";
        await sendTelegramMessage(msg);
        console.error("[Supervisor] Max restarts reached. Stopping.");
        process.exit(1);
    }

    const child = spawn('node', ['src/index.js'], {
        stdio: 'inherit', // Keep logs in the same shell/file
        env: process.env
    });

    child.on('exit', async (code, signal) => {
        const reason = signal ? `Señal: ${signal}` : `Código de salida: ${code}`;
        console.error(`[Supervisor] Child process exited. Reason: ${reason}`);

        if (code !== 0) {
            const alertMsg = `⚠️ *ALERTA: Orquestador Caído*\n\n*Razón:* ${reason}\n\nintentando reiniciar en ${RESTART_DELAY / 1000}s...`;
            await sendTelegramMessage(alertMsg);
        }

        setTimeout(startOrchestrator, RESTART_DELAY);
    });

    child.on('error', async (err) => {
        console.error('[Supervisor] Failed to start child process:', err.message);
        await sendTelegramMessage(`❌ *ERROR CRÍTICO: Supervisor*\nNo se pudo iniciar el proceso del Orquestador: ${err.message}`);
    });
}

// Initial start
sendTelegramMessage("🛡️ *Supervisor Activado*\nEl sistema de auto-curación está monitorizando el Orquestador.").then(() => {
    startOrchestrator();
});

// Handle supervisor termination
process.on('SIGINT', () => {
    console.log("[Supervisor] Shutting down...");
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log("[Supervisor] Shutting down...");
    process.exit(0);
});
