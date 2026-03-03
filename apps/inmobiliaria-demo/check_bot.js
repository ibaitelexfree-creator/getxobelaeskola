const axios = require('axios');
const token = '8287082204:AAEfPganohul_Ic_8SiWn973zTGvG93UohU';
// Removing slash as Next.js seems to redirect to the non-slash version
const webhookUrl = 'https://controlmanager.cloud/realstate/api/telegram/webhook';

async function setup() {
    try {
        console.log(`Setting webhook to: ${webhookUrl}`);
        const response = await axios.get(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
        console.log(JSON.stringify(response.data, null, 2));

        const info = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
        console.log('Current Webhook Info:');
        console.log(JSON.stringify(info.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

setup();
