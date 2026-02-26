import axios from 'axios';
import { getReadyTasks, updateTaskStatus, getSwarmProgress, getSwarmTasks } from './task-queue.js';
import { sendMessage } from './telegram-bot.js';

/**
 * Swarm Executor - Orchestrates Jules sessions with relay pattern
 * Executes tasks phase-by-phase: Architect → Data → UI
 * Within each phase, tasks run in parallel.
 */

const ACCOUNTS_MAP = {
    'getxobelaeskola@gmail.com': process.env.JULES_API_KEY,
    'ibaitnt@gmail.com': process.env.JULES_API_KEY_2,
    'ibaitelexfree@gmail.com': process.env.JULES_API_KEY_3,
};

const JULES_API_URL = 'https://jules.googleapis.com/v1alpha/sessions';
const DEFAULT_REPO = 'sources/github/ibaitelexfree-creator/getxobelaeskola';
const MAX_RETRIES = 2;
const POLL_INTERVAL = 15000; // 15 seconds
const SESSION_TIMEOUT = 600000; // 10 minutes

// Track active swarms
const activeSwarms = new Map();

// ─── Jules Session Management ───

async function createJulesSession(task, relayContext = '') {
    const apiKey = ACCOUNTS_MAP[task.account_email || task.accountEmail];
    if (!apiKey) throw new Error(`No API key for ${task.account_email || task.accountEmail}`);

    const fullPrompt = relayContext
        ? `${relayContext}\n\n---\n\nTAREA: ${task.prompt}`
        : task.prompt;

    const headers = {};
    if (apiKey.startsWith('AQ.')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
        headers['X-Goog-Api-Key'] = apiKey;
    }
    headers['Content-Type'] = 'application/json';

    const response = await axios.post(JULES_API_URL, {
        prompt: fullPrompt,
        sourceContext: {
            source: DEFAULT_REPO,
            githubRepoContext: { startingBranch: 'main' }
        },
        automationMode: 'AUTO_CREATE_PR'
    }, { headers });

    return response.data;
}

async function pollSession(sessionId, apiKey) {
    const headers = {};
    if (apiKey.startsWith('AQ.')) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
        headers['X-Goog-Api-Key'] = apiKey;
    }

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

// ─── Core Executor ───

/**
 * Execute a swarm: process all tasks respecting dependencies and relay pattern
 * @param {import('pg').Pool} db
 * @param {string} swarmId
 * @param {string} chatId - Telegram chat for progress updates
 * @param {object} options
 */
export async function executeSwarm(db, swarmId, chatId, options = {}) {
    const { dryRun = false, simulationMode = false } = options;

    if (activeSwarms.has(swarmId)) {
        throw new Error(`Swarm ${swarmId} is already executing`);
    }

    activeSwarms.set(swarmId, { status: 'running', startedAt: new Date() });

    try {
        let iteration = 0;
        const maxIterations = 50; // Safety limit

        while (iteration < maxIterations) {
            iteration++;

            const readyTasks = await getReadyTasks(db, swarmId);
            const progress = await getSwarmProgress(db, swarmId);

            // Check if we're done
            if (readyTasks.length === 0 && progress.running === 0) {
                if (progress.pending === 0) {
                    // All tasks completed or failed
                    if (chatId) {
                        const emoji = progress.failed === 0 ? '🎉' : '⚠️';
                        await sendMessage(chatId, [
                            `${emoji} *Swarm \`#${swarmId}\` finalizado!*`,
                            `✅ ${progress.completed}/${progress.total} completadas`,
                            progress.failed > 0 ? `❌ ${progress.failed} fallidas` : '',
                            `⏱️ Tiempo: ${Math.round((Date.now() - activeSwarms.get(swarmId).startedAt) / 60000)} min`
                        ].filter(Boolean).join('\n'));
                    }
                    break;
                }
                // Tasks pending but stuck (circular deps or all blocked by failures)
                if (chatId) {
                    await sendMessage(chatId, `⚠️ *Swarm \`#${swarmId}\`*: ${progress.pending} tareas bloqueadas (dependencias sin completar).`);
                }
                break;
            }

            if (readyTasks.length > 0) {
                // Determine current phase for notification
                const currentPhase = readyTasks[0].phase_order || readyTasks[0].phaseOrder;
                const currentRole = readyTasks[0].role;

                if (chatId) {
                    await sendMessage(chatId, `📊 *Fase ${currentPhase}/3 - ${currentRole}*\nEjecutando ${readyTasks.length} tarea(s)...`);
                }

                // Get completed tasks for relay context
                const allTasks = await getSwarmTasks(db, swarmId);
                const completedTasks = allTasks.filter(t => (t.status === 'completed') && (t.phase_order || t.phaseOrder) < currentPhase);
                const relayContext = buildRelayContext(completedTasks);

                if (dryRun || simulationMode) {
                    // Simulate execution
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
                    // Real execution: create Jules sessions in parallel
                    const sessionPromises = readyTasks.map(task => executeSingleTask(db, swarmId, task, relayContext, chatId));
                    await Promise.allSettled(sessionPromises);
                }
            }

            // Wait before checking for new ready tasks
            if (!dryRun) {
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    } finally {
        activeSwarms.delete(swarmId);
    }
}

/**
 * Execute a single task: create Jules session, poll for completion, update status
 */
async function executeSingleTask(db, swarmId, task, relayContext, chatId) {
    const taskId = task.task_id || task.taskId;
    const accountEmail = task.account_email || task.accountEmail;

    await updateTaskStatus(db, swarmId, taskId, 'running');

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[Swarm] Creating session for ${taskId} (attempt ${attempt + 1})`);

            const session = await createJulesSession(task, relayContext);
            const sessionId = session.name;

            await updateTaskStatus(db, swarmId, taskId, 'running', { julesSessionId: sessionId });

            if (chatId) {
                await sendMessage(chatId, `  🔧 \`${taskId}\`: ${task.title} → Sesión creada`);
            }

            // Poll for completion
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
                return; // Success, exit retry loop
            } else {
                throw new Error(`Session ended with state: ${state}`);
            }

        } catch (err) {
            console.error(`[Swarm] Task ${taskId} attempt ${attempt + 1} failed:`, err.message);

            if (attempt >= MAX_RETRIES) {
                await updateTaskStatus(db, swarmId, taskId, 'failed', { errorMessage: err.message });
                if (chatId) {
                    await sendMessage(chatId, `  ❌ \`${taskId}\`: Fallida tras ${MAX_RETRIES + 1} intentos: ${err.message}`);
                }
            } else {
                // Wait before retry
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
}

/**
 * Get active swarm status
 */
export function getActiveSwarms() {
    return [...activeSwarms.entries()].map(([id, info]) => ({
        id, ...info,
        runningFor: Math.round((Date.now() - info.startedAt) / 1000) + 's'
    }));
}

/**
 * Check if simulation mode is enabled
 */
export function isSimulationMode() {
    return process.env.JULES_SIMULATION_MODE === 'true';
}
