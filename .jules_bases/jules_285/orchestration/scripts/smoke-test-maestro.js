import { Maestro } from '../lib/maestro.js';
import { config } from 'dotenv';
import { resolve } from 'path';

config(); // Load root .env

async function test() {
    console.log('--- TEST MAESTRO LOGIC ---');
    const maestro = new Maestro({
        // Use a dummy bot so it doesn't try to connect to Telegram
        telegramToken: 'DUMMY',
        chatId: process.env.TELEGRAM_CHAT_ID || '1567383226'
    });

    // Mock send method
    maestro._send = async (text) => {
        console.log('[MOCK TELEGRAM SEND]:\n', text);
    };

    console.log('\nTesting /status...');
    await maestro._handleMessage({
        text: '/status',
        chat: { id: parseInt(maestro.chatId) },
        from: { first_name: 'Ibai', username: 'ibai' }
    });

    console.log('\nTesting /temp...');
    await maestro._handleMessage({
        text: '/temp',
        chat: { id: parseInt(maestro.chatId) }
    });

    console.log('\nTesting /task "Test task"...');
    await maestro._handleMessage({
        text: '/task Test manual Maestro',
        chat: { id: parseInt(maestro.chatId) }
    });

    console.log('\nTesting /pool...');
    await maestro._handleMessage({
        text: '/pool',
        chat: { id: parseInt(maestro.chatId) }
    });

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
