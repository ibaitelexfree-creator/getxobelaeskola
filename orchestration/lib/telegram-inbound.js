import TelegramBot from 'node-telegram-bot-api';
<<<<<<< HEAD
import { recordActivity } from './resource-manager.js';
import { tasks as dbTasks } from './db.js';
=======
import { appendToProjectMemory, readProjectMemory } from './project-memory.js';
>>>>>>> pr-286

export function setupTelegramInbound(token, chatId) {
    if (!token) return null;

    const bot = new TelegramBot(token, { polling: true });

<<<<<<< HEAD
    console.log('[Telegram] Inbound polling started (Database Integrated)');

    bot.on('message', async (msg) => {
        // Record activity to wake up/keep alive the system
        recordActivity();

        const text = msg.text;
        const msgChatId = msg.chat.id;

        // Solo responder al usuario autorizado
=======
    console.log('[Telegram] Inbound polling started');

    bot.on('message', async (msg) => {
        const text = msg.text;
        const msgChatId = msg.chat.id;

        // Solo responder al usuario autorizado (tú)
>>>>>>> pr-286
        if (msgChatId.toString() !== chatId.toString()) {
            console.warn(`[Telegram] Unauthorized message from ${msgChatId}`);
            return;
        }

<<<<<<< HEAD
        if (text && (text.startsWith('/todo ') || text.startsWith('/task '))) {
            const isTodo = text.startsWith('/todo ');
            const taskDescription = text.replace(isTodo ? '/todo ' : '/task ', '').trim();

            try {
                const externalId = `T-${Date.now().toString(36).toUpperCase()}`;

                dbTasks.add({
                    id: externalId,
                    title: taskDescription,
                    executor: 'jules',
                    status: 'pending_approval',
                    priority: 3,
                    requires_approval: 1,
                    source: 'telegram'
                });

                bot.sendMessage(msgChatId, `⏳ **Tarea encolada para aprobación**\n\n**ID:** \`${externalId}\`\n**Tarea:** ${taskDescription}\n\nAproxímate al APK de Mission Control para autorizar su ejecución.`);
            } catch (err) {
                console.error('[Telegram] Error adding task:', err);
                bot.sendMessage(msgChatId, `❌ Error al añadir la tarea: ${err.message}`);
            }
        } else if (text === '/status') {
            const pending = dbTasks.getPending();
            const stats = dbTasks.getStats ? dbTasks.getStats() : { total: pending.length };

            bot.sendMessage(msgChatId, `📊 **Estado de Misiones:**\n\n- Pendientes: ${pending.length}\n- Bloqueadas (esperando aprobación): ${pending.filter(t => t.status === 'pending_approval').length}\n\nUsa /queue para ver detalles.`);
        } else if (text === '/queue') {
            const pending = dbTasks.getPending().slice(0, 10);
            const list = pending.map(t => `- [${t.status}] ${t.title} (\`${t.external_id}\`)`).join('\n');
            bot.sendMessage(msgChatId, `📋 **Top 10 Cola:**\n\n${list || 'Vacía'}`);
=======
        if (text && text.startsWith('/todo ')) {
            const taskDescription = text.replace('/todo ', '').trim();

            try {
                // 1. Obtener el siguiente ID leyendo el archivo
                const currentTasks = readProjectMemory('AGENT_TASKS.md');
                let nextId = 'T-001';

                if (currentTasks.success) {
                    const matches = currentTasks.content.match(/T-(\d+)/g);
                    if (matches) {
                        const ids = matches.map(m => parseInt(m.split('-')[1]));
                        const maxId = Math.max(...ids);
                        nextId = `T-${(maxId + 1).toString().padStart(3, '0')}`;
                    }
                }

                const date = new Date().toISOString().split('T')[0];
                const newRow = `| ${nextId} | 3 | pendiente | ${taskDescription} | pendiente | ${date} |`;

                appendToProjectMemory('AGENT_TASKS.md', newRow);

                bot.sendMessage(msgChatId, `✅ **Tarea añadida a AGENT_TASKS.md**\n\n**ID:** \`${nextId}\`\n**Tarea:** ${taskDescription}\n\nAntigravity la procesará en breve.`);
            } catch (err) {
                console.error('[Telegram] Error adding todo:', err);
                bot.sendMessage(msgChatId, `❌ Error al añadir la tarea: ${err.message}`);
            }
        } else if (text === '/status') {
            const state = readProjectMemory('GLOBAL_STATE.md');
            bot.sendMessage(msgChatId, `📊 **Estado Global:**\n\n${state.success ? state.content : 'No se pudo leer el estado'}`);
>>>>>>> pr-286
        }
    });

    return bot;
}
