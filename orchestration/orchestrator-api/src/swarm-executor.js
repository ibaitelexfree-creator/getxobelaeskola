import axios from 'axios';
import { getReadyTasks, updateTaskStatus, getSwarmProgress, getSwarmTasks } from './task-queue.js';
import { sendMessage } from './telegram-bot.js';
import {
    ACCOUNTS_MAP, ACCOUNT_ROLES,
    buildAuthHeaders, validateAllKeys,
    recordSuccess, recordFailure, isHealthy,
    findHealthyAlternate, getHealthReport
} from './account-health.js';

/**
 * Swarm Executor v2 — Hardened with:
 *   ✅ Preflight key validation
 *   ✅ Smart retry with account failover on 401
 *   ✅ Per-account circuit breaker
 *   ✅ Structured Telegram error reporting
 */

const JULES_API_URL = 'https://jules.googleapis.com/v1alpha/sessions';
const DEFAULT_REPO = 'sources/github/ibaitelexfree-creator/getxobelaeskola';
const MAX_RETRIES = 2;
const POLL_INTERVAL = 15000;
const SESSION_TIMEOUT = 1200000; // 20 minutes

const activeSwarms = new Map();

/**
 * Resume any tasks that were left in 'running' state (e.g., after crash/restart)
 */
export async function resumeActiveTasks(db, chatId = process.env.TELEGRAM_CHAT_ID) {
    if (!db) return;

    try {
        const res = await db.query("SELECT * FROM swarm_tasks WHERE status = 'running'");
        if (res.rows.length === 0) return;

        console.log(`[Swarm] Resuming ${res.rows.length} stalled tasks...`);

        for (const task of res.rows) {
            const swarmId = task.swarm_id;
            const taskId = task.task_id;

            if (task.jules_session_id) {
                console.log(`[Swarm] Resuming monitor for ${taskId} (Session: ${task.jules_session_id})`);
                executeSingleTask(db, swarmId, task, '', chatId).catch(e => {
                    console.error(`[Swarm] Failed to resume ${taskId} in swarm ${swarmId}:`, e.message);
                });
            } else {
                await updateTaskStatus(db, swarmId, taskId, 'pending');
            }
        }
    } catch (e) {
        console.error('[Swarm] Error during task resumption:', e.message);
    }
}

// ─── Jules Session Management ───

async function createJulesSession(task, relayContext = '') {
    const email = task.account_email || task.accountEmail;
    const apiKey = ACCOUNTS_MAP[email];
    if (!apiKey) throw new Error(`No API key for ${email}`);

    const fullPrompt = relayContext
        ? `${relayContext}\n\n---\n\nTAREA: ${task.prompt}`
        : task.prompt;

    const headers = buildAuthHeaders(apiKey);
    console.log(`[Swarm] [createJulesSession] Sending POST to ${JULES_API_URL}`);
    console.log(`[Swarm] [createJulesSession] Prompt length: ${fullPrompt.length}`);

    const response = await axios.post(JULES_API_URL, {
        prompt: fullPrompt,
        sourceContext: {
            source: DEFAULT_REPO,
            githubRepoContext: { startingBranch: 'main' }
        },
        automationMode: 'AUTO_CREATE_PR'
    }, { headers, timeout: 30000 });

    console.log(`[Swarm] [createJulesSession] Response received: ${response.data.name}`);
    recordSuccess(email);
    return response.data;
}

async function pollSession(sessionId, apiKey) {
    const headers = buildAuthHeaders(apiKey);
    const res = await axios.get(`https://jules.googleapis.com/v1alpha/${sessionId}`, { headers });
    return res.data;
}

// ─── Relay Context Builder ───

function buildRelayContext(completedTasks) {
    if (!completedTasks || completedTasks.length === 0) return '';

    const lines = [
        'CONTEXTO DE FASES ANTERIORES (trabajo ya completado por otros agentes):',
        ''
    ];

    for (const t of completedTasks) {
        lines.push(`✅ ${t.role} - ${t.title} (${t.task_id || t.taskId})`);
        if (t.pr_url || t.prUrl) lines.push(`   PR: ${t.pr_url || t.prUrl}`);
        if (t.result) {
            const resultStr = typeof t.result === 'string' ? t.result : JSON.stringify(t.result);
            if (resultStr.length < 500) lines.push(`   Output: ${resultStr}`);
        }
        lines.push('');
    }

    lines.push('Tu trabajo debe ser COMPATIBLE con las tareas anteriores.');
    lines.push('Si hacen referencia a schemas, endpoints o componentes creados antes, respétalos.');

    return lines.join('\n');
}

// ─── Structured Error Notification ───

function buildErrorNotification(taskId, task, error, attempt, maxAttempts, failoverResult) {
    const email = task.account_email || task.accountEmail;
    const role = ACCOUNT_ROLES[email] || 'Unknown';
    const statusCode = error.response?.status || 'Unknown';
    const is401 = statusCode === 401;

    const lines = [
        `  ❌ \`${taskId}\`: Fallida → ${email}`,
        `━━━━━━━━━━━━━`,
        `🔑 Error: HTTP ${statusCode}${is401 ? ' (Key may be expired)' : ''}`,
        `🎭 Rol: ${role}`,
        `🔁 Intentos: ${attempt + 1}/${maxAttempts}`,
    ];

    if (is401 && failoverResult) {
        lines.push(`🔀 Failover: ${failoverResult}`);
    }

    if (is401) {
        lines.push(`💡 Acción: Regenera la API key en console.cloud.google.com`);
    }

    return lines.join('\n');
}

// ─── Core Executor ───

export async function executeSwarm(db, swarmId, chatId, options = {}) {
    const { dryRun = false, simulationMode = false } = options;

    if (activeSwarms.has(swarmId)) {
        throw new Error(`Swarm ${swarmId} is already executing`);
    }

    // Phase 1: Preflight key validation
    console.log(`[Swarm] Preflight: validating API keys...`);
    const keyStatus = await validateAllKeys();
    const unhealthyAccounts = Object.entries(keyStatus)
        .filter(([, v]) => !v.valid)
        .map(([email, v]) => `${email}: ${v.reason}`);

    if (unhealthyAccounts.length > 0) {
        console.warn(`[Swarm] ⚠️ Unhealthy accounts: ${unhealthyAccounts.join(', ')}`);
        if (chatId) {
            await sendMessage(chatId, [
                `⚠️ *Swarm \`#${swarmId}\` - Advertencia de claves:*`,
                ...unhealthyAccounts.map(a => `  🔑 ${a}`),
                `_Se intentará failover a cuentas sanas._`
            ].join('\n'));
        }
    }

    activeSwarms.set(swarmId, { status: 'running', startedAt: new Date() });

    try {
        let iteration = 0;
        const maxIterations = 50;

        while (iteration < maxIterations) {
            iteration++;

            const readyTasks = await getReadyTasks(db, swarmId);
            const progress = await getSwarmProgress(db, swarmId);

            if (readyTasks.length === 0 && progress.running === 0) {
                if (progress.pending === 0) {
                    if (chatId) {
                        const emoji = progress.failed === 0 ? '🎉' : '⚠️';
                        const blockedInfo = progress.failed > 0
                            ? `\n⚠️ ${progress.failed} fallidas. Usa /retry ${swarmId} para reintentar.`
                            : '';
                        await sendMessage(chatId, [
                            `${emoji} *Swarm \`#${swarmId}\` finalizado!*`,
                            `✅ ${progress.completed}/${progress.total} completadas`,
                            progress.failed > 0 ? `❌ ${progress.failed} fallidas` : '',
                            `⏱️ Tiempo: ${Math.round((Date.now() - activeSwarms.get(swarmId).startedAt) / 60000)} min`,
                            blockedInfo
                        ].filter(Boolean).join('\n'));
                    }
                    break;
                }
                if (chatId) {
                    await sendMessage(chatId, `⚠️ *Swarm \`#${swarmId}\`*: ${progress.pending} tareas bloqueadas (dependencias sin completar).`);
                }
                break;
            }

            if (readyTasks.length > 0) {
                const currentPhase = readyTasks[0].phase_order || readyTasks[0].phaseOrder;
                const currentRole = readyTasks[0].role;

                if (chatId) {
                    await sendMessage(chatId, `📊 *Fase ${currentPhase}/3 - ${currentRole}*\nEjecutando ${readyTasks.length} tarea(s)...`);
                }

                const allTasks = await getSwarmTasks(db, swarmId);
                const completedTasks = allTasks.filter(t => (t.status === 'completed') && (t.phase_order || t.phaseOrder) < currentPhase);
                const relayContext = buildRelayContext(completedTasks);

                if (dryRun || simulationMode) {
                    for (const task of readyTasks) {
                        const tid = task.task_id || task.taskId;
                        console.log(`[Swarm] [DRY RUN] Would execute: ${tid} - ${task.title}`);
                        await updateTaskStatus(db, swarmId, tid, 'completed', {
                            result: { dry_run: true, simulated: true }
                        });
                    }
                    if (chatId) {
                        await sendMessage(chatId, `🧪 _Dry run: ${readyTasks.length} tareas simuladas._`);
                    }
                } else {
                    const sessionPromises = readyTasks.map(task => executeSingleTask(db, swarmId, task, relayContext, chatId));
                    await Promise.allSettled(sessionPromises);
                }
            }

            if (!dryRun) {
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    } finally {
        activeSwarms.delete(swarmId);
    }
}

/**
 * Execute a single task with smart retry and account failover
 */
async function executeSingleTask(db, swarmId, task, relayContext, chatId) {
    const taskId = task.task_id || task.taskId;
    let accountEmail = task.account_email || task.accountEmail;

    // Pre-check: if assigned account is unhealthy, try failover before even starting
    if (!isHealthy(accountEmail)) {
        const alt = findHealthyAlternate(accountEmail);
        if (alt) {
            console.log(`[Swarm] Pre-failover for ${taskId}: ${accountEmail} → ${alt}`);
            accountEmail = alt;
            task.account_email = alt;
            task.accountEmail = alt;
        }
    }

    await updateTaskStatus(db, swarmId, taskId, 'running');

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            let sessionId = task.jules_session_id || task.julesSessionId;
            let session = null;

            if (!sessionId) {
                console.log(`[Swarm] Creating session for ${taskId} (attempt ${attempt + 1}, account: ${accountEmail})`);
                session = await createJulesSession(task, relayContext);
                sessionId = session.name;
                await updateTaskStatus(db, swarmId, taskId, 'running', { julesSessionId: sessionId });

                if (chatId) {
                    await sendMessage(chatId, `  🔧 \`${taskId}\`: ${task.title} → Sesión creada`);
                }
            } else {
                console.log(`[Swarm] Reusing existing session for ${taskId}: ${sessionId}`);
            }

            const apiKey = ACCOUNTS_MAP[accountEmail];
            const startTime = Date.now();
            let state = 'STATE_UNSPECIFIED';
            let finalSession = null;

            while (Date.now() - startTime < SESSION_TIMEOUT) {
                try {
                    finalSession = await pollSession(sessionId, apiKey);
                    state = finalSession.state;
                    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(state)) break;
                } catch (pollErr) {
                    console.warn(`[Swarm] Poll error for ${taskId}:`, pollErr.message);
                }
                await new Promise(r => setTimeout(r, POLL_INTERVAL));
            }

            if (state === 'COMPLETED') {
                await updateTaskStatus(db, swarmId, taskId, 'completed', {
                    result: finalSession?.result || { state: 'COMPLETED' },
                    prUrl: finalSession?.result?.pullRequestUrl || null
                });
                if (chatId) {
                    const prInfo = finalSession?.result?.pullRequestUrl ? ` | PR: ${finalSession.result.pullRequestUrl}` : '';
                    await sendMessage(chatId, `  ✅ \`${taskId}\`: Completada${prInfo}`);
                }
                return;
            } else {
                throw new Error(`Session ended with state: ${state}`);
            }

        } catch (err) {
            const statusCode = err.response?.status;
            console.error(`[Swarm] Task ${taskId} attempt ${attempt + 1} failed (HTTP ${statusCode || 'N/A'}):`, err.message);

            // Record failure for circuit breaker
            if (statusCode) {
                recordFailure(accountEmail, statusCode);
            }

            // Phase 2: Smart failover on 401
            if (statusCode === 401 && attempt < MAX_RETRIES) {
                const alt = findHealthyAlternate(accountEmail);
                if (alt) {
                    console.log(`[Swarm] 🔀 Failover for ${taskId}: ${accountEmail} → ${alt}`);
                    accountEmail = alt;
                    task.account_email = alt;
                    task.accountEmail = alt;

                    if (chatId) {
                        await sendMessage(chatId, `  🔀 \`${taskId}\`: Failover → ${ACCOUNT_ROLES[alt]} (${alt})`);
                    }
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
            }

            if (attempt >= MAX_RETRIES) {
                // Phase 4: Structured error reporting
                const failoverInfo = statusCode === 401
                    ? (findHealthyAlternate(accountEmail) ? 'Available but exhausted retries' : 'No alternate accounts available (all unhealthy)')
                    : null;

                await updateTaskStatus(db, swarmId, taskId, 'failed', { errorMessage: err.message });

                if (chatId) {
                    const errorMsg = buildErrorNotification(taskId, task, err, attempt, MAX_RETRIES + 1, failoverInfo);
                    await sendMessage(chatId, errorMsg);

                    // Count blocked tasks
                    const allTasks = await getSwarmTasks(db, swarmId);
                    const blockedCount = allTasks.filter(t =>
                        (t.depends_on || t.dependsOn || []).includes(taskId) &&
                        (t.status === 'pending')
                    ).length;
                    if (blockedCount > 0) {
                        await sendMessage(chatId, `  ⚠️ ${blockedCount} tarea(s) bloqueadas por dependencias de \`${taskId}\``);
                    }
                }
            } else {
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
}

export function getActiveSwarms() {
    return [...activeSwarms.entries()].map(([id, info]) => ({
        id, ...info,
        runningFor: Math.round((Date.now() - info.startedAt) / 1000) + 's'
    }));
}

export function isSimulationMode() {
    return process.env.JULES_SIMULATION_MODE === 'true';
}

export { getHealthReport };
