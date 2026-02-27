import db from './db-client.js';
import { recordJobEvent } from './canary-controller.js';
import { executeSpecializedJules } from './jules-executor.js';
import { sendMessage } from '../telegram-bot.js';
import { performFinalReview } from './review-final.js';
import { analyzeWithRcaEngine } from './rca-engine.js';
import { scanCodeSecurity } from './security-scan.js';
import { buildSwarmInlineKeyboard } from './telegram-inline.js';
import { run5AgentPipeline } from './pipeline-5agents.js';

/**
 * Swarm Orchestrator v2 - Core Sequential Logic
 */
export async function startSwarmV2(prompt, name = 'New Swarm 2.0') {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    let failureCount = 0;
    const MAX_SWARM_RETRIES = 2;

    // 1. Create Swarm Entry
    const swarmRes = await db.query(
        'INSERT INTO sw2_swarms (name, status, metadata) VALUES ($1, $2, $3) RETURNING id',
        [name, 'RUNNING', { original_prompt: prompt }]
    );
    const swarmId = swarmRes.rows[0].id;

    await sendMessage(chatId, `🧬 *Iniciando Swarm 2.0* \`#${swarmId}\`\nMotivo: ${name}`);

    async function executeSequence() {
        if (failureCount === 0) recordJobEvent(false); // Initial job event
        try {
            // 2. Define Sequential Tasks
            const roles = ['ARCHITECT', 'DATA', 'UI'];
            let accumulatedContext = '';

            for (const role of roles) {
                await sendMessage(chatId, `⏳ *Fase: ${role}* | Preparando agente especializado...`);

                const taskRes = await db.query(
                    'INSERT INTO sw2_tasks (swarm_id, agent_role, status, request_payload) VALUES ($1, $2, $3, $4) RETURNING id',
                    [swarmId, role, 'PENDING', { prompt, previousContext: accumulatedContext }]
                );
                const taskId = taskRes.rows[0].id;

                let julesRetries = 0;
                let success = false;

                while (julesRetries < 3 && !success) {
                    try {
                        const execution = await executeSpecializedJules(role, prompt, swarmId, taskId, accumulatedContext);

                        if (execution.success) {
                            await db.query(
                                'UPDATE sw2_tasks SET status = \'COMPLETED\', response_payload = $1 WHERE id = $2',
                                [execution.result, taskId]
                            );

                            await db.query(
                                'INSERT INTO sw2_history (swarm_id, task_id, event_type, message, details) VALUES ($1, $2, $3, $4, $5)',
                                [swarmId, taskId, 'TASK_COMPLETED', `Agente ${role} finalizado`, { vote: execution.vote }]
                            );

                            await sendMessage(chatId, `✅ Agent ${role} finalizado con Voto OK!`);

                            // Accumulate context for the next agent
                            accumulatedContext += `\n--- [Output Agent: ${role}] ---\n${JSON.stringify(execution.result, null, 2)}\n`;
                            success = true;
                        } else {
                            const rcaProvider = execution.rca ? (process.env.RCA_PROVIDER || 'openrouter') : 'NONE';

                            await db.query(
                                'UPDATE sw2_tasks SET status = \'FAILED\', response_payload = $1, error_log = $2 WHERE id = $3',
                                [{
                                    error: execution.vote_reason,
                                    vote: execution.vote,
                                    category: execution.category,
                                    rca_provider: rcaProvider
                                }, execution.rca || execution.error, taskId]
                            );

                            await db.query(
                                'INSERT INTO sw2_history (swarm_id, task_id, event_type, message, details) VALUES ($1, $2, $3, $4, $5)',
                                [swarmId, taskId, 'TASK_FAILED', `Agente ${role} falló`, {
                                    reason: execution.vote_reason,
                                    category: execution.category,
                                    rca_provider: rcaProvider
                                }]
                            );

                            throw new Error(`Agent ${role} vote FAIL: ${execution.vote_reason}`);
                        }
                    } catch (err) {
                        julesRetries++;
                        console.warn(`[Retry] Agent ${role} failed attempt ${julesRetries}: ${err.message}`);

                        await db.query(
                            'INSERT INTO sw2_history (swarm_id, task_id, event_type, message, details) VALUES ($1, $2, $3, $4, $5)',
                            [swarmId, taskId, 'RETRY_ATTEMPT', `Reintento agente ${role}`, { attempt: julesRetries, error: err.message }]
                        );

                        if (julesRetries >= 3) throw err;
                        await new Promise(r => setTimeout(r, 5000)); // Wait before retry
                    }
                }
            }

            // 3. Final Review
            await sendMessage(chatId, `🔍 *Iniciando Revisión Final Senior...*`);
            const review = await performFinalReview("Code changes committed in previous steps", prompt);
            const reviewScore = review.score || (review.approved ? 85 : 40);
            await sendMessage(chatId, `🏆 *Audit Score:* ${reviewScore}/100\nFeedback: ${review.feedback || 'Good work.'}`);

            // 4. Security Scan
            await sendMessage(chatId, `🛡️ *Escaneo de Vulnerabilidades OWASP...*`);
            const security = await scanCodeSecurity("Final Release", "Reviewing simulated release code");
            const securityIcons = security.risk_score > 3 ? '⚠️' : '🛡️';
            await sendMessage(chatId, `${securityIcons} *Security Risk:* ${security.risk_score}/10\nIssues: ${security.vulnerabilities?.length || 0}`);

            // 5. Final Decision
            if (reviewScore >= 75 && security.risk_score <= 5) {
                await db.query('UPDATE sw2_swarms SET status = $1 WHERE id = $2', ['NEEDS_APPROVAL', swarmId]);
                await sendMessage(chatId, `🏁 *Swarm 2.0 en Meta.* Pendiente de Despliegue.`, {
                    replyMarkup: buildSwarmInlineKeyboard(swarmId)
                });
            } else {
                await db.query('UPDATE sw2_swarms SET status = $1 WHERE id = $2', ['NEEDS_REVISION', swarmId]);
                await sendMessage(chatId, `⚠️ *Revisión requerida.* Riesgo alto o score bajo.`, {
                    replyMarkup: buildSwarmInlineKeyboard(swarmId)
                });
            }

        } catch (error) {
            failureCount++;
            console.error(`Swarm ${swarmId} Attempt ${failureCount} Error:`, error.message);

            if (failureCount < MAX_SWARM_RETRIES) {
                await sendMessage(chatId, `🔄 *Fallo en secuencia.* Reintentando swarm completo (${failureCount}/${MAX_SWARM_RETRIES})...`);
                recordJobEvent(true); // Mark replay
                return executeSequence();
            } else {
                await sendMessage(chatId, `🚨 *Fallas persistentes.* Activando Pipeline del 5 Agentes (Último Recurso)...`);
                try {
                    const { audit, flow, auditId } = await run5AgentPipeline(prompt);
                    const pipelineResult = audit.instruction || JSON.stringify(audit);
                    await sendMessage(chatId, `🛠️ *Pipeline Result:* ${pipelineResult.substring(0, 500)}... (Score: ${audit.score})`);
                    await db.query('UPDATE sw2_swarms SET status = $1, metadata = $2 WHERE id = $3',
                        ['MANUAL_FIX_REQUIRED', { pipeline_recovery: pipelineResult, audit_id: auditId, audit_flow: flow }, swarmId]);
                } catch (pipeErr) {
                    await sendMessage(chatId, `❌ *Pipeline de Rescate fallido.* Requiere intervención humana inmediata.`);
                    await db.query('UPDATE sw2_swarms SET status = $1 WHERE id = $2', ['CRITICAL_FAILURE', swarmId]);
                }
            }
        }
    }

    await executeSequence();
}
