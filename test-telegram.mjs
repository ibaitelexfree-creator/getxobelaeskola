import 'dotenv/config';
import { handleMessage } from './orchestration/orchestrator-api/src/telegram-bot.js';

async function test() {
    const msg = {
        chat: { id: process.env.TELEGRAM_CHAT_ID },
        text: '/approve 7e729c'
    };

    await handleMessage(msg, {
        onApprove: async (cid, id) => console.log('Approved:', id)
    });
}
test();
