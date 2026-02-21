import TelegramBot from 'node-telegram-bot-api';
import { appendToProjectMemory, readProjectMemory } from './project-memory.js';
import { recordActivity } from './resource-manager.js';


export function setupTelegramInbound(token, chatId) {
    if (!token) return null;

    const bot = new TelegramBot(token, { polling: true });

    console.log('[Telegram] Inbound polling started');

    bot.on('message', async (msg) => {
        // Record activity to wake up/keep alive the system
        recordActivity();

        const text = msg.text;

        const msgChatId = msg.chat.id;

        // Solo responder al usuario autorizado (tú)
        if (msgChatId.toString() !== chatId.toString()) {
            console.warn(`[Telegram] Unauthorized message from ${msgChatId}`);
            return;
        }

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
        }
    });

    return bot;
}
