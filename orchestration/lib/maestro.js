/**
 * Maestro v3 — Autonomous Orchestrator Bot (Fast Lane 2026)
 * 
 * The ONLY point of contact for Ibai. Controls:
 * - 3 Jules accounts (invisible rotation)
 * - Gemini Flash Fast (Level 2 executor)
 * - ThermalGuard (auto-throttle)
 * - ClawdBot (last resort, requires confirmation)
 * - Browserless (remote visualization)
 * 
 * Execution Hierarchy:
 *   1. Jules Pool (primary) — 15 concurrent × 3 = 45 max
 *   2. Gemini Flash (fast, low-cost) — when Jules saturated
 *   3. ClawdBot (last resort) — requires /approve via Telegram
 * 
 * Commands:
 *   /task <desc>       → Asigna al mejor ejecutor disponible (cascada)
 *   /clawdebot <desc>  → Sesión aislada directa al PC ClawdBot
 *   /status            → Estado general compacto
 *   /usage             → Dashboard de consumo unificado
 *   /doctor            → Health check de todos los servicios
 *   /screenshot <url>  → Captura remota via Browserless → Telegram
 *   /approve           → Aprobar tarea pendiente para ClawdBot
 *   /reject            → Rechazar tarea ClawdBot y reencolar
 *   /temp              → Temperaturas + throttle level
 *   /pool              → Uso diario del pool de Jules
 *   /pause             → Pausar todas las tareas
 *   /resume            → Reanudar
 *   /queue             → Cola de tareas pendientes
 *   /force-clawdbot    → Forzar próxima tarea a ClawdBot
 *   /help              → Lista de comandos
 */

import TelegramBot from 'node-telegram-bot-api';
import { ThermalGuard } from './thermal-guard.js';
import { JulesPool } from './jules-pool.js';
import { ClawdBotBridge } from './clawdbot-bridge.js';
import { FlashExecutor } from './flash-executor.js';
import { VisualRelay } from './visual-relay.js';
import { CreditMonitor } from './credit-monitor.js';
import { VercelMonitor } from './vercel-monitor.js';
import { AgentWatchdog } from './watchdog.js';
import { appendToProjectMemory, readProjectMemory } from './project-memory.js';
import { config } from 'dotenv';
import { tasks as dbTasks } from './db.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

export class Maestro {
    constructor(options = {}) {
        this.token = options.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID;
        this.bot = null;

        // Initialize subsystems
        this.thermal = new ThermalGuard(options.thermal || {});
        this.pool = new JulesPool(this.thermal, options.pool || {});
        this.clawdbot = new ClawdBotBridge(options.clawdbot || {});
        this.flash = new FlashExecutor(options.flash || {});
        this.visual = new VisualRelay(options.visual || {});
        this.vercel = new VercelMonitor();
        this.credits = new CreditMonitor(this.pool, this.flash, this.clawdbot, this.visual, this.vercel);
        this.watchdog = new AgentWatchdog(options.watchdog || {});

        // Task queue for when pool is exhausted and ClawdBot not available
        this.taskQueue = [];
        this.forceClawdBot = false;

        // Pending approval for ClawdBot delegation
        this.pendingApproval = null;

        // Daily stats
        this.stats = {
            tasksAssigned: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            flashUsed: 0,
            clawdbotUsed: 0,
            alertsSent: 0
        };

        this._setupEventListeners();
    }

    /**
     * Start Maestro — connects to Telegram and begins monitoring
     */
    start() {
        if (!this.token || !this.chatId) {
            console.error('[Maestro] CRITICAL: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing in .env');
            if (!this.token) console.error('  - TELEGRAM_BOT_TOKEN is undefined');
            if (!this.chatId) console.error('  - TELEGRAM_CHAT_ID is undefined');
            return;
        }

        // Start thermal monitoring
        this.thermal.start();

        // Start watchdog
        this.watchdog.start();
        console.log('[Maestro] 🐕 Watchdog activo.');

        // Check ClawdBot availability (non-blocking)
        this.clawdbot.isAvailable().then(ok => {
            console.log(`[Maestro] ClawdBot: ${ok ? 'disponible' : 'no disponible'}`);
        });

        // Start Telegram bot
        this.bot = new TelegramBot(this.token, { polling: true });
        console.log('[Maestro] 🤖 Bot de Telegram activo. Escuchando comandos...');

        this.bot.on('message', (msg) => this._handleMessage(msg));
        this.bot.on('polling_error', (err) => {
            console.error('[Maestro] Telegram polling error:', err.message);
        });

        // Send startup message
        const flashStatus = this.flash.hasCredits() ? '⚡ Flash listo' : '💤 Flash sin créditos';
        this._send(`🤖 **Maestro v3 activo** (Fast Lane 2026)\n\n🎯 Cascada: Jules → Flash → ClawdBot\n${flashStatus}\nEscribe /help para ver comandos.`);
    }

    /**
     * Stop all subsystems
     */
    stop() {
        this.thermal.stop();
        this.flash.stop();
        this.watchdog.stop();
        if (this.bot) {
            this.bot.stopPolling();
            this.bot = null;
        }
        console.log('[Maestro] Stopped');
    }

    /**
     * Handle incoming Telegram messages
     */
    async _handleMessage(msg) {
        const text = msg.text;
        const msgChatId = msg.chat.id;
        const msgUser = msg.from?.username || msg.from?.first_name || 'Desconocido';

        console.log(`[Maestro] Inbound: "${text}" from ${msgUser} (${msgChatId})`);

        // Only respond to authorized user
        if (msgChatId.toString() !== this.chatId.toString()) {
            console.warn(`[Maestro] ❌ Unauthorized! Expected ${this.chatId}, got ${msgChatId}`);
            // Optional: send a message back if it's not a complete stranger (security risk though)
            return;
        }

        if (!text) return;

        try {
            if (text.startsWith('/task ')) {
                await this._cmdTask(text.replace('/task ', '').trim());
            } else if (text.startsWith('/clawdebot ')) {
                await this._cmdClawdebot(text.replace('/clawdebot ', '').trim());
            } else if (text === '/status') {
                await this._cmdStatus();
            } else if (text === '/usage') {
                await this._cmdUsage();
            } else if (text === '/doctor') {
                await this._cmdDoctor();
            } else if (text.startsWith('/screenshot ')) {
                await this._cmdScreenshot(text.replace('/screenshot ', '').trim());
            } else if (text === '/approve') {
                await this._cmdApprove();
            } else if (text === '/reject') {
                await this._cmdReject();
            } else if (text === '/temp') {
                await this._cmdTemp();
            } else if (text === '/pool') {
                await this._cmdPool();
            } else if (text === '/pause') {
                await this._cmdPause();
            } else if (text === '/resume') {
                await this._cmdResume();
            } else if (text === '/queue') {
                await this._cmdQueue();
            } else if (text === '/force-clawdbot') {
                await this._cmdForceClawdBot();
            } else if (text === '/watchdog' || text === '/wd') {
                await this._cmdWatchdog();
            } else if (text === '/watchdog pause' || text === '/wd pause') {
                await this._cmdWatchdogPause();
            } else if (text === '/watchdog resume' || text === '/wd resume') {
                await this._cmdWatchdogResume();
            } else if (text === '/help') {
                await this._cmdHelp();
            } else if (text.startsWith('/todo ')) {
                await this._cmdTask(text.replace('/todo ', '').trim());
            } else if (text.startsWith('/')) {
                await this._send(`❓ Comando no reconocido. Escribe /help.`);
            }
        } catch (err) {
            console.error('[Maestro] Error handling command:', err);
            await this._send(`❌ Error procesando comando: ${err.message}`);
        }
    }

    // ───────────────────────── COMMANDS ─────────────────────────

    async _cmdTask(description) {
        if (!description) {
            return this._send('❌ Usa: `/task descripción de la tarea`');
        }

        await this._send(`🔄 Procesando tarea...`);

        const task = { title: description, description, createdAt: Date.now() };

        // Check if forced to ClawdBot
        if (this.forceClawdBot) {
            this.forceClawdBot = false;
            return this._delegateToClawdBot(task, 'Forzado por usuario');
        }

        // ───── CASCADA: Jules → Flash → ClawdBot (con confirmación) ─────

        // Level 1: Try Jules Pool
        const slot = this.pool.acquire(task);

        if (slot) {
            this.stats.tasksAssigned++;
            this._logTask(task, slot.accountId);

            await this._send([
                `🚀 **Tarea asignada** (Jules)`,
                `📝 ${description}`,
                `⚡ Procesando... Te aviso cuando termine.`,
                '',
                `📊 Pool: ${this.pool.getStatus().totalUsed}/300 hoy`
            ].join('\n'));
            return;
        }

        // Level 2: Try Gemini Flash
        if (this.flash.hasCredits()) {
            await this._send(`⚡ Jules saturado. Ejecutando con **Gemini Flash**...`);

            const result = await this.flash.execute(task);
            if (result.success) {
                this.stats.flashUsed++;
                this.stats.tasksCompleted++;
                await this._send([
                    `✅ **Flash completó** (${result.latencyMs}ms)`,
                    `📝 ${description}`,
                    `📊 ${result.tokensUsed} tokens usados`,
                    '',
                    result.summary ? `💬 ${result.summary.substring(0, 300)}` : ''
                ].filter(Boolean).join('\n'));
                return;
            }
            // Flash failed, fall through to ClawdBot
            await this._send(`⚠️ Flash falló: ${result.error}`);
        }

        // Level 3: Enqueue for Approval / Processing
        const externalId = `T-${Date.now().toString(36).toUpperCase()}`;
        dbTasks.add({
            id: externalId,
            title: description,
            executor: 'jules',
            status: 'pending_approval',
            priority: 3,
            requires_approval: 1,
            source: 'telegram'
        });

        await this._send([
            `⏳ **Tarea encolada para aprobación**`,
            `📝 ${description}`,
            `ID: ${externalId}`,
            `Aprobar en el APK de Mission Control para ejecutar.`
        ].join('\n'));
    }

    async _cmdStatus() {
        const poolStatus = this.pool.getStatus();
        const flashStatus = this.flash.hasCredits() ? '🟢' : '🔴';
        const clawdbot = this.clawdbot.healthy ? '🟢' : '🔴';
        const visualStatus = this.visual.enabled ? '🟢' : '🔴';
        const queueLen = this.taskQueue.length;
        const pending = this.pendingApproval ? '⚠️ 1 esperando /approve' : 'Ninguna';

        const msg = [
            `🤖 **Maestro v3** (Fast Lane)`,
            `━━━━━━━━━━━━━━━━━━━━`,
            '',
            `📊 **Jules:** ${poolStatus.totalUsed}/300 hoy (${poolStatus.totalActive} activas)`,
            `⚡ **Flash:** ${flashStatus} ${this.stats.flashUsed} tareas hoy`,
            `🤖 **ClawdBot:** ${clawdbot} ${this.stats.clawdbotUsed} delegaciones`,
            `🌐 **Visual:** ${visualStatus}`,
            `🌡️ **Thermal:** ${this.thermal.getThrottleLevel().label}`,
            `📋 **Cola:** ${queueLen} | **Pendiente:** ${pending}`,
            '',
            `📈 **Hoy:** ${this.stats.tasksAssigned} asignadas, ${this.stats.tasksCompleted} completadas`
        ].join('\n');

        await this._send(msg);
    }

    async _cmdTemp() {
        await this.thermal.pollTemps(); // Fresh reading
        await this._send(this.thermal.getStatusMessage());
    }

    async _cmdPool() {
        await this._send(this.pool.getStatusMessage());
    }

    async _cmdPause() {
        this.pool.pauseAll();
        await this._send('⏸️ **Pool pausado.** Todas las cuentas Jules detenidas.\nUsa /resume para reanudar.');
    }

    async _cmdResume() {
        this.pool.resumeAll();
        await this._send('▶️ **Pool reanudado.** Jules vuelven a aceptar tareas.');

        // Process queued tasks
        await this._processQueue();
    }

    async _cmdQueue() {
        const pending = dbTasks.getPending();
        if (pending.length === 0) {
            return this._send('📋 Cola vacía. No hay tareas pendientes.');
        }

        const lines = pending.slice(0, 20).map((t, i) =>
            `${i + 1}. [${t.status}] ${t.title} (${t.external_id})`
        );

        await this._send([
            `📋 **Cola de tareas** (${pending.length})`,
            '',
            ...lines,
            pending.length > 20 ? `... y ${pending.length - 20} más.` : ''
        ].filter(Boolean).join('\n'));
    }

    async _cmdForceClawdBot() {
        this.forceClawdBot = true;
        await this._send('🤖 **Modo ClawdBot activado** para la próxima tarea.\nUsa `/task <descripción>` para enviarla directamente a ClawdBot.');
    }

    async _cmdWatchdog() {
        const s = this.watchdog.getStatus();
        const stateEmoji = { ACTIVE: '🟢', STALLED: '🟡', LOOPING: '🔴', CRASHED: '💀', RECOVERING: '🔄', PAUSED: '⏸️' };
        await this._send([
            `🐕 **Watchdog Status**`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `Estado: ${stateEmoji[s.state] || '❓'} ${s.state}`,
            `Uptime: ${s.uptime}`,
            `Último output: ${s.lastOutput}`,
            `Buffer: ${s.bufferSize} mensajes`,
            `Reintentos: ${s.retryCount}`,
            '',
            `📊 Loops: ${s.stats.loopsDetected} | Stalls: ${s.stats.stallsDetected}`,
            `💀 Crashes: ${s.stats.crashesRecovered} | AutoCont: ${s.stats.autoContinues}`,
            `Total intervenciones: ${s.stats.totalInterventions}`,
        ].join('\n'));
    }

    async _cmdWatchdogPause() {
        this.watchdog.pause();
        await this._send('⏸️ **Watchdog pausado.** No intervendrá hasta /watchdog resume.');
    }

    async _cmdWatchdogResume() {
        this.watchdog.resume();
        await this._send('▶️ **Watchdog reanudado.** Vigilando al agente.');
    }

    async _cmdClawdebot(prompt) {
        if (!prompt) return this._send('❌ Usa: `/clawdebot <prompt>`');

        await this._send('🤖 **Modo ClawdBot directo** — Bypass de la cascada...');

        const task = { title: prompt, description: prompt, createdAt: Date.now(), direct: true };
        const available = await this.clawdbot.isAvailable();

        if (!available) {
            return this._send('❌ ClawdBot no está disponible. Inicia Docker primero.');
        }

        const result = await this.clawdbot.delegateTask(task);
        if (result.success) {
            this.stats.clawdbotUsed++;
            await this._send(`✅ **ClawdBot completó:**\n${result.response?.substring(0, 500) || 'OK'}`);
        } else {
            await this._send(`❌ ClawdBot falló: ${result.error}`);
        }
    }

    async _cmdUsage() {
        await this._send(await this.credits.getSummaryMessage());
    }

    async _cmdDoctor() {
        await this._send('🏥 **Diagnóstico en curso...**');

        const checks = [
            { name: 'Jules Pool', fn: () => ({ ok: this.pool.getStatus().totalActive >= 0 }) },
            { name: 'Flash API', fn: () => ({ ok: this.flash.enabled }) },
            { name: 'ClawdBot', fn: async () => ({ ok: await this.clawdbot.isAvailable() }) },
            { name: 'Browserless', fn: () => ({ ok: this.visual.enabled }) },
            { name: 'ThermalGuard', fn: () => ({ ok: !this.thermal.shouldDelegateToClawdBot() }) },
            { name: 'Watchdog', fn: () => ({ ok: this.watchdog.getStatus().state !== 'CRASHED' }) }
        ];

        const results = [];
        for (const check of checks) {
            try {
                const r = await check.fn();
                results.push(`${r.ok ? '✅' : '❌'} ${check.name}`);
            } catch (err) {
                results.push(`❌ ${check.name}: ${err.message}`);
            }
        }

        await this._send([
            '🏥 **Doctor — Health Check**',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            ...results
        ].join('\n'));
    }

    async _cmdScreenshot(url) {
        if (!url) return this._send('❌ Usa: `/screenshot <url>`');
        if (!this.visual.enabled) return this._send('❌ Browserless no configurado.');

        await this._send(`📸 Capturando ${url}...`);
        const result = await this.visual.screenshotToTelegram(url, `📸 ${url}`);

        if (!result.success) {
            await this._send(`❌ Error: ${result.error}`);
        }
    }

    async _cmdApprove() {
        if (!this.pendingApproval) {
            return this._send('📋 No hay tareas pendientes de aprobación.');
        }

        const { task, reason } = this.pendingApproval;
        this.pendingApproval = null;

        await this._delegateToClawdBot(task, `Aprobado por usuario. ${reason}`);
    }

    async _cmdReject() {
        if (!this.pendingApproval) {
            return this._send('📋 No hay tareas pendientes de aprobación.');
        }

        const { task } = this.pendingApproval;
        this.pendingApproval = null;

        this.taskQueue.push(task);
        await this._send(`🔄 Tarea recolocada en cola (posición ${this.taskQueue.length}). Se ejecutará cuando Jules o Flash estén libres.`);
    }

    async _cmdHelp() {
        await this._send([
            '🤖 **Maestro v3 — Comandos**',
            '',
            '**Ejecución:**',
            '`/task <desc>` — Tarea (cascada: Jules→Flash→ClawdBot)',
            '`/clawdebot <desc>` — Directo a ClawdBot (bypass)',
            '`/approve` — Aprobar tarea pendiente de ClawdBot',
            '`/reject` — Rechazar y reencolar',
            '',
            '**Monitoring:**',
            '`/status` — Estado general',
            '`/usage` — Dashboard de consumo',
            '`/doctor` — Health check de servicios',
            '`/screenshot <url>` — Captura remota',
            '',
            '**Control:**',
            '`/temp` — Temperaturas CPU/GPU',
            '`/pool` — Uso del pool de Jules',
            '`/queue` — Cola de tareas pendientes',
            '`/pause` / `/resume` — Control de Jules',
            '`/force-clawdbot` — Forzar próxima a ClawdBot',
            '`/watchdog` — Estado del watchdog',
            '',
            '_Cascada automática: Jules → Flash → ClawdBot (con confirmación)_'
        ].join('\n'));
    }

    // ───────────────────── INTERNAL METHODS ─────────────────────

    async _delegateToClawdBot(task, reason) {
        this.stats.clawdbotUsed++;
        this.pool.recordClawdBotDelegation();

        await this._send([
            `🤖 **Delegando a ClawdBot** (último recurso)`,
            `📝 ${task.title}`,
            `Motivo: ${reason}`,
            `Procesando...`
        ].join('\n'));

        const result = await this.clawdbot.delegateTask(task);

        if (result.success) {
            this.stats.tasksCompleted++;
            await this._send(`✅ ClawdBot completó: ${task.title}`);
        } else {
            this.stats.tasksFailed++;
            await this._send(`❌ ClawdBot falló: ${result.error}\nTarea añadida a la cola.`);
            this.taskQueue.push(task);
        }
    }

    _getExhaustionMessage() {
        const status = this.pool.getStatus();
        const allAtLimit = status.accounts.every(a => a.dailyUsed >= 100);
        if (allAtLimit) return 'Las 3 cuentas alcanzaron el límite diario (300/300).';

        const allBusy = status.accounts.every(a => a.active >= status.maxConcurrentPerAccount);
        if (allBusy) return `Todas las cuentas saturadas (${status.maxConcurrentPerAccount} concurrentes cada una).`;

        return 'Pool no disponible temporalmente.';
    }

    async _processQueue() {
        const pending = dbTasks.getPending().filter(t => t.status === 'pending' || t.status === 'queued');

        for (const task of pending) {
            const slot = this.pool.acquire(task);
            if (!slot) break; // Pool still full

            // Update status in DB
            dbTasks.updateStatus(task.external_id, 'running');
            this.stats.tasksAssigned++;

            await this._send(`🚀 Tarea procesada: ${task.title}`);
        }
    }

    /**
     * Setup event listeners for subsystem events
     */
    _setupEventListeners() {
        // ThermalGuard events
        this.thermal.on('critical', async (e) => {
            this.stats.alertsSent++;
            this.pool.pauseAll();
            await this._send([
                `🔴 **ALERTA TÉRMICA CRÍTICA**`,
                `${e.message}`,
                '',
                this.thermal.getStatusMessage(),
                '',
                `⏸️ Jules pausados automáticamente.`,
                `🤖 Delegando tareas pendientes a ClawdBot.`
            ].join('\n'));
        });

        this.thermal.on('warning', async (e) => {
            this.stats.alertsSent++;
            await this._send([
                `⚠️ **Temperatura alta**`,
                `${e.message}`,
                this.thermal.getStatusMessage()
            ].join('\n'));
        });

        this.thermal.on('recovered', async (e) => {
            this.pool.resumeAll();
            await this._send([
                `✅ **Temperatura normalizada**`,
                `${e.message}`,
                `▶️ Jules reanudados automáticamente.`
            ].join('\n'));
            await this._processQueue();
        });

        // JulesPool events
        this.pool.on('poolExhausted', async (e) => {
            console.log('[Maestro] Pool exhausted:', e.reason);
        });

        this.pool.on('dailyReset', async () => {
            this.stats = { tasksAssigned: 0, tasksCompleted: 0, tasksFailed: 0, flashUsed: 0, clawdbotUsed: 0, alertsSent: 0 };
            await this._send('🌅 **Nuevo día.** Contadores reseteados. 300 tareas Jules + Flash disponibles.');
        });

        // FlashExecutor events
        this.flash.on('creditsExhausted', async (e) => {
            await this._send(`⚠️ **Flash sin créditos:** ${e.error}\nTareas irán a ClawdBot (con confirmación).`);
        });

        this.flash.on('creditsLow', async () => {
            await this._send('⚠️ **Flash: créditos bajos.** Considera recargar.');
        });

        // Watchdog events
        this.watchdog.on('loopDetected', async (e) => {
            await this._send(`🔁 **Bucle detectado**\n${e.repeatCount} mensajes similares (${e.dominanceRatio}%)\nMuestra: ${e.sample || 'N/A'}\n\n⏳ Esperando ${Math.round(this.watchdog.config.killTimeoutMs / 60000)}min antes de kill automático.`);
        });

        this.watchdog.on('crashDetected', async () => {
            await this._send('💀 **Antigravity caído.** Intentando reiniciar...');
        });

        this.watchdog.on('processRestarted', async (e) => {
            await this._send(`✅ **Antigravity reiniciado** via ${e.command}`);
        });

        this.watchdog.on('restartFailed', async () => {
            await this._send('❌ **Reinicio fallido.** Intervención manual necesaria.');
        });

        this.watchdog.on('killAndRestart', async (e) => {
            await this._send(`⚡ **Kill & Restart** — Motivo: ${e.reason || 'loop/stall'}`);
        });

        this.watchdog.on('autoContinueSent', async (e) => {
            if (e.attempt === 1) {
                await this._send(`▶️ Auto-continue enviado (intento ${e.attempt})`);
            }
        });
    }

    /**
     * Send message via Telegram
     */
    async _send(text) {
        if (!this.bot || !this.chatId) {
            console.log('[Maestro]', text);
            return;
        }

        try {
            await this.bot.sendMessage(this.chatId, text, { parse_mode: 'Markdown' });
        } catch (err) {
            // Retry without markdown if parse fails
            try {
                await this.bot.sendMessage(this.chatId, text.replace(/[*_`]/g, ''));
            } catch (retryErr) {
                console.error('[Maestro] Failed to send message:', retryErr.message);
            }
        }
    }

    /**
     * Notify task completion (called externally when Jules finishes)
     */
    async notifyCompletion(sessionRef, result = {}) {
        this.stats.tasksCompleted++;

        // Find and release the account
        const status = this.pool.getStatus();
        for (const account of status.accounts) {
            const session = account.activeSessions.find(s => s.ref === sessionRef);
            if (session) {
                this.pool.release(account.id, sessionRef);
                break;
            }
        }

        const prLink = result.prUrl ? `\nPR: ${result.prUrl}` : '';
        await this._send(`✅ **Tarea completada**\n${result.title || 'Tarea'}${prLink}`);

        // Process queue after completion
        await this._processQueue();
    }

    /**
     * Notify task failure (called externally)
     */
    async notifyFailure(sessionRef, error = '') {
        this.stats.tasksFailed++;

        const status = this.pool.getStatus();
        for (const account of status.accounts) {
            const session = account.activeSessions.find(s => s.ref === sessionRef);
            if (session) {
                this.pool.release(account.id, sessionRef);
                break;
            }
        }

        await this._send(`❌ **Tarea fallida**\n${error || 'Error desconocido'}`);
    }
}

// ───────────────────── STANDALONE ENTRY POINT ─────────────────────

if (process.argv.includes('--start') || process.argv[1]?.endsWith('maestro.js')) {
    const maestro = new Maestro();
    maestro.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n[Maestro] Shutting down...');
        maestro.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        maestro.stop();
        process.exit(0);
    });
}

export default Maestro;
