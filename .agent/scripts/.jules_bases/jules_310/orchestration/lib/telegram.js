import https from 'https';

/**
 * Telegram Library for sending notifications
 */

/**
 * Send a message to Telegram
 * @param {string} text - The message text
 * @param {Object} options - Optional parameters
 * @returns {Promise}
 */
export async function sendTelegramMessage(text, options = {}) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('[Telegram] Skip sending: Bot token or Chat ID not configured');
        return { success: false, error: 'Not configured' };
    }

    const { parseMode = 'Markdown', disableWebPagePreview = false } = options;

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: parseMode,
            disable_web_page_preview: disableWebPagePreview
        });

        const requestOptions = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(requestOptions, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, result: JSON.parse(responseBody) });
                } else {
                    console.error('[Telegram] Error:', res.statusCode, responseBody);
                    reject(new Error(`Telegram API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error('[Telegram] Request error:', err.message);
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

export default { sendTelegramMessage };
