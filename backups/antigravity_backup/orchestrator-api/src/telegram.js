import https from 'https';
import dns from 'dns';

// Force IPV4 for Telegram API to avoid Docker networking issues
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

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
            timeout: 10000, // 10 seconds timeout for outgoing messages
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(requestOptions, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('[Telegram] Message sent successfully');
                    resolve({ success: true, result: JSON.parse(responseBody) });
                } else {
                    console.error('[Telegram] API Error:', res.statusCode, responseBody);
                    resolve({ success: false, statusCode: res.statusCode, error: responseBody });
                }
            });
        });

        req.on('timeout', () => {
            console.error('[Telegram] Request Timeout after 10s');
            req.destroy();
        });

        req.on('error', (err) => {
            console.error('[Telegram] Request Error:', err.message);
            resolve({ success: false, error: err.message });
        });

        req.write(data);
        req.end();
    });
}
