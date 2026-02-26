
import 'dotenv/config';
import axios from 'axios';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function test() {
    console.log(`Sending message to ${chatId}...`);
    try {
        const res = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: "🔍 *Antigravity Debug*: Verificando conexión del bot...",
            parse_mode: 'Markdown'
        });
        console.log('Success!', res.data.ok);
    } catch (err) {
        console.error('Failed!', err.response?.data || err.message);
    }
}

test();
