import 'dotenv/config';
console.log('GROQ:', !!process.env.GROQ_API_KEY);
console.log('TELEGRAM_BOT_TOKEN:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
