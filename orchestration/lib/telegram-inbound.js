import TelegramBot from 'node-telegram-bot-api';
import { recordActivity } from './resource-manager.js';
import { tasks as dbTasks } from './db.js';

export function setupTelegramInbound(token, chatId) {
    if (!token) return null;

    const bot = new TelegramBot(token, { polling: true });

    console.log('[Telegram] Inbound polling started (Database Integrated)');

    bot.on('message', async (msg) => {
        // Record activity to wake up/keep alive the system
        recordActivity();

        const text = msg.text;
        const msgChatId = msg.chat.id;

        // Solo responder al usuario autorizado
        if (msgChatId.toString() !== chatId.toString()) {
            console.warn(`[Telegram] Unauthorized message from ${msgChatId}`);
            return;
        }

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
        }
    });

    return bot;
}
