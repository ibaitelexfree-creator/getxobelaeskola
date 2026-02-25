import dotenv from 'dotenv';
import { sendTelegramMessage } from './lib/telegram.js';
dotenv.config();

// Removed logging of secrets for security
// console.log('Token:', process.env.TELEGRAM_BOT_TOKEN);
// console.log('Chat ID:', process.env.TELEGRAM_CHAT_ID);

sendTelegramMessage('Prueba directa desde script')
    .then(res => console.log('Resultado:', res))
    .catch(err => console.error('Error:', err));
