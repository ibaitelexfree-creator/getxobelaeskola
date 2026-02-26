import https from 'https';
import dns from 'dns';

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// In-memory state for pending proposals
const pendingProposals = new Map();
let lastUpdateId = 0;
let pollingActive = false;

/**
 * Telegram Bot - Bidirectional Communication
 * Handles incoming messages via long polling and routes commands.
 */

// ─── Core API Helpers ───

function telegramAPI(method, body = {}) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return Promise.resolve({ ok: false, error: 'No token' });

    return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const req = https.request({
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${token}/${method}`,
            method: 'POST',
            timeout: 35000, // 35 seconds total timeout (poll is 30s)
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(buf);
                    if (res.statusCode !== 200) {
                        parsed.httpStatus = res.statusCode;
                        console.error(`[TelegramBot] API ${method} failed with status ${res.statusCode}:`, buf);
                    }
                    resolve(parsed);
                }
                catch {
                    console.error(`[TelegramBot] API ${method} JSON parse failed:`, buf);
                    resolve({ ok: false, raw: buf, httpStatus: res.statusCode });
                }
            });
        });

        req.on('timeout', () => {
            console.error(`[TelegramBot] API ${method} Request Timeout`);
            req.destroy();
        });

        req.on('error', (e) => {
            console.error(`[TelegramBot] API ${method} Request Error:`, e.message);
            resolve({ ok: false, error: e.message });
        });
        req.write(data);
        req.end();
    });
}

const messageToProposal = new Map();

/**
 * Escapes text for Telegram Markdown V1
 */
function escapeMarkdown(text) {
    if (typeof text !== 'string') return text;
    // Markdown V1 is very simple, we only need to be careful with mismatched special chars
    // But honestly, it's safer to just double check for common pitfalls
    return text; // For now keep as is, but added the placeholder for future fix
}

export async function sendMessage(chatId, text, options = {}) {
    const { parseMode = 'Markdown', replyMarkup } = options;

    // Safety check: if text is empty or null
    if (!text) return { ok: false, error: 'Empty text' };

    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
    };
    if (replyMarkup) body.reply_markup = replyMarkup;

    const res = await telegramAPI('sendMessage', body);

    if (!res.ok) {
        console.error(`[TelegramBot] SendMessage failed for ChatID ${chatId}. Text snippet: ${text.substring(0, 50)}... Error: ${res.description || 'Unknown'}`);
    }

    // Keep track of messages that contain a proposal ID to handle reactions later
    if (res.ok && res.result && res.result.message_id && typeof text === 'string') {
        const match = text.match(/PROPUESTA DE SWARM.*?#([a-f0-9]{6})/i);
        if (match) {
            messageToProposal.set(res.result.message_id, match[1]);
        }
    }
    return res;
}

// ─── Proposal Management ───

export function storeProposal(id, data) {
    pendingProposals.set(id, { ...data, createdAt: new Date(), status: 'pending' });
}

export function getProposal(id) {
    return pendingProposals.get(id);
}

export function approveProposal(id) {
    const p = pendingProposals.get(id);
    if (p) { p.status = 'approved'; p.approvedAt = new Date(); }
    return p;
}

export function rejectProposal(id) {
    const p = pendingProposals.get(id);
    if (p) { p.status = 'rejected'; }
    return p;
}

export function getAllPendingProposals() {
    return [...pendingProposals.entries()]
        .filter(([, v]) => v.status === 'pending')
        .map(([k, v]) => ({ id: k, ...v }));
}

// ─── Command Router ───

async function handleMessage(msg, { onSwarm, onApprove, onCancel, onStatus, onCicd }) {
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const authorizedChatId = process.env.TELEGRAM_CHAT_ID;

    // Security: only respond to authorized chat
    if (authorizedChatId && String(chatId) !== String(authorizedChatId)) {
        await sendMessage(chatId, '⛔ No autorizado.');
        return;
    }

    // Command parsing
    if (text.startsWith('/swarm ') || text.startsWith('/s ')) {
        const prompt = text.replace(/^\/(swarm|s)\s+/, '');
        // Extract max jules if specified (e.g., "15 jules" or just a number at the end)
        const julesMatch = prompt.match(/(\d+)\s*jules?/i);
        const maxJules = julesMatch ? parseInt(julesMatch[1], 10) : 9;

        await sendMessage(chatId, '🧠 *Analizando tarea con Groq AI...*');

        if (onSwarm) {
            try {
                await onSwarm(chatId, prompt, maxJules);
            } catch (e) {
                await sendMessage(chatId, `❌ Error en análisis: ${e.message}`);
            }
        }
        return;
    }

    // Helper to get ID from text or reply
    function extractProposalId(cmdText) {
        const parts = cmdText.split(/\s+/);
        if (parts.length > 1 && parts[1]) return parts[1].trim();

        if (msg.reply_to_message && msg.reply_to_message.text) {
            const match = msg.reply_to_message.text.match(/#([a-f0-9]{6})/);
            if (match) return match[1];
        }
        return null;
    }

    if (text.startsWith('/cicd ') || text.startsWith('/ci ')) {
        const prompt = text.replace(/^\/(cicd|ci)\s+/, '');
        await sendMessage(chatId, '⚙️ *Iniciando proceso CI/CD (Auto-Repair/Merge) para la tarea...*');

        if (onCicd) {
            try {
                await onCicd(chatId, prompt);
            } catch (e) {
                await sendMessage(chatId, `❌ Error en CI/CD: ${e.message}`);
            }
        }
        return;
    }

    if (text.startsWith('/approve') || text.startsWith('/a') || text.toLowerCase() === 'aprueba' || text === '❤️' || text === '👍') {
        const id = extractProposalId(text);
        console.log(`[TelegramBot] CMD: ${text} | Extracted ID: ${id}`);
        if (id && onApprove) {
            try {
                await onApprove(chatId, id);
            } catch (e) {
                await sendMessage(chatId, `❌ Error: ${e.message}`);
            }
        } else if (!id && text !== '❤️' && text !== '👍') {
            await sendMessage(chatId, '⚠️ Debes especificar el ID o responder a la propuesta con /a');
        }
        return;
    }

    if (text.startsWith('/cancel') || text.startsWith('/c') || text.toLowerCase() === 'cancela') {
        const id = extractProposalId(text);
        if (id && onCancel) {
            try {
                await onCancel(chatId, id);
            } catch (e) {
                await sendMessage(chatId, `❌ Error: ${e.message}`);
            }
        } else if (!id) {
            await sendMessage(chatId, '⚠️ Debes especificar el ID o responder a la propuesta con /c');
        }
        return;
    }

    if (text === '/status' || text === '/st') {
        if (onStatus) {
            await onStatus(chatId);
        } else {
            const pending = getAllPendingProposals();
            if (pending.length === 0) {
                await sendMessage(chatId, '📭 No hay propuestas pendientes.');
            } else {
                const list = pending.map(p => `• \`${p.id}\`: ${p.originalPrompt?.slice(0, 60)}...`).join('\n');
                await sendMessage(chatId, `📋 *Propuestas Pendientes:*\n${list}`);
            }
        }
        return;
    }

    if (text === '/help' || text === '/h') {
        await sendMessage(chatId, [
            '🤖 *Swarm Commander - Comandos*',
            '',
            '`/swarm <tarea> [N jules]` — Analizar tarea con Groq AI',
            '`/approve <id>` — Aprobar propuesta',
            '`/cancel <id>` — Cancelar propuesta',
            '`/status` — Ver propuestas pendientes',
            '`/cicd <tarea>` — Iniciar proceso CI/CD libre',
            '`/help` — Este mensaje',
            '',
            '_Ejemplo:_ `/swarm Implementar pagos Stripe, 12 jules`'
        ].join('\n'));
        return;
    }

    // Free text: treat as swarm task
    if (text && !text.startsWith('/')) {
        const julesMatch = text.match(/(\d+)\s*jules?/i);
        const maxJules = julesMatch ? parseInt(julesMatch[1], 10) : 9;
        await sendMessage(chatId, '🧠 *Analizando tarea con Groq AI...*');
        if (onSwarm) {
            try {
                await onSwarm(chatId, text, maxJules);
            } catch (e) {
                await sendMessage(chatId, `❌ Error: ${e.message}`);
            }
        }
        return;
    }
}

// ─── Proposal Formatter ───

export function formatProposal(proposalId, analysis) {
    const lines = [
        `📋 *PROPUESTA DE SWARM* \`#${proposalId}\``,
        '━━━━━━━━━━━━━━━━━━━━━━━'
    ];

    const icons = { 'Lead Architect': '🏗️', 'Data Master': '💾', 'UI Engine': '🎨' };

    for (const phase of analysis.phases) {
        const icon = icons[phase.role] || '🔧';
        lines.push(`${icon} *Fase ${phase.order} - ${phase.role}* (${phase.jules_count} Jules):`);
        for (const task of phase.tasks) {
            const deps = task.depends_on?.length > 0 ? ` (← ${task.depends_on.join(', ')})` : '';
            lines.push(`  • \`${task.id}\`: ${task.title}${deps}`);
        }
        lines.push('');
    }

    lines.push(`⏱️ Estimado: ~${analysis.estimated_time_minutes || '?'} min | Total: ${analysis.total_jules} Jules`);
    if (analysis.risk_notes) lines.push(`⚠️ _${analysis.risk_notes}_`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`✅ \`/approve ${proposalId}\`  |  ❌ \`/cancel ${proposalId}\``);

    return lines.join('\n');
}

// ─── Long Polling ───

export async function startPolling(handlers = {}) {
    if (pollingActive) return;
    pollingActive = true;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.warn('[TelegramBot] No TELEGRAM_BOT_TOKEN, polling disabled');
        pollingActive = false;
        return;
    }

    console.log('[TelegramBot] Long polling started');

    while (pollingActive) {
        try {
            const result = await telegramAPI('getUpdates', {
                offset: lastUpdateId + 1,
                timeout: 30, // Long poll: wait up to 30s
                allowed_updates: ['message', 'edited_message', 'message_reaction']
            });

            if (!result.ok) {
                if (result.httpStatus === 409) {
                    console.error('[TelegramBot] Polling Conflict (409). Another instance is likely running.');
                } else {
                    console.error(`[TelegramBot] Poll finished with Error. OK: ${result.ok}, Status: ${result.httpStatus || 200}`);
                    if (result.error) console.error(`[TelegramBot] API Error Details: ${result.error}`);
                }
                // Back off on error
                await new Promise(r => setTimeout(r, 5000));
            }
            else if (result.result && result.result.length > 0) {
                for (const update of result.result) {
                    lastUpdateId = update.update_id;

                    const message = update.message || update.edited_message;

                    if (message) {
                        try {
                            if (update.edited_message) {
                                console.log(`[TelegramBot] Edited: ${message.text || '[not text]'}`);
                            }
                            await handleMessage(message, handlers);
                        } catch (e) {
                            console.error('[TelegramBot] Handler error:', e.message);
                        }
                    } else if (update.message_reaction) {
                        try {
                            const rx = update.message_reaction;
                            // Check for heart emojis or 'approve' emojis
                            const hasHeart = rx.new_reaction.some(r => r.type === 'emoji' && ['❤️', '👍', '🔥', '🚀'].includes(r.emoji));
                            const hasCancel = rx.new_reaction.some(r => r.type === 'emoji' && ['👎', '❌'].includes(r.emoji));

                            if (hasHeart || hasCancel) {
                                const matchedId = messageToProposal.get(rx.message_id);
                                if (matchedId) {
                                    if (hasHeart && handlers.onApprove) {
                                        await handlers.onApprove(rx.chat.id, matchedId);
                                    } else if (hasCancel && handlers.onCancel) {
                                        await handlers.onCancel(rx.chat.id, matchedId);
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('[TelegramBot] Reaction handling error:', e.message);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('[TelegramBot] Polling FATAL error:', e.message);
            // Back off on error
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

export function stopPolling() {
    pollingActive = false;
    console.log('[TelegramBot] Polling stopped');
}
