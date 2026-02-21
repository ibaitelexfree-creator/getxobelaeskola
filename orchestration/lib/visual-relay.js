/**
 * VisualRelay — Browserless Screenshots & PDFs → Telegram
 * 
 * Eliminates local browser dependency by routing all web
 * visualization through Browserless.io, sending results
 * directly to Telegram as photos or documents.
 */

import https from 'https';
import http from 'http';

const BROWSERLESS_DEFAULT = 'https://chrome.browserless.io';

export class VisualRelay {
    constructor(options = {}) {
        this.browserlessUrl = options.browserlessUrl || process.env.BROWSERLESS_URL || BROWSERLESS_DEFAULT;
        this.browserlessToken = options.browserlessToken || process.env.BROWSERLESS_TOKEN;
        this.telegramToken = options.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID;
        this.enabled = !!(this.browserlessToken && this.telegramToken && this.chatId);
    }

    async screenshot(url, options = {}) {
        if (!this.enabled) return { success: false, error: 'VisualRelay not configured' };

        try {
            const buffer = await this._browserlessRequest('/screenshot', {
                url,
                options: {
                    fullPage: options.fullPage || false,
                    type: 'png'
                }
            });

            return { success: true, buffer, size: buffer.length };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async screenshotToTelegram(url, caption = '') {
        const result = await this.screenshot(url);
        if (!result.success) return result;

        try {
            await this._sendPhotoToTelegram(result.buffer, caption || `📸 ${url}`);
            return { success: true, message: 'Screenshot sent to Telegram' };
        } catch (err) {
            return { success: false, error: `Screenshot OK, Telegram failed: ${err.message}` };
        }
    }

    async generatePDF(url) {
        if (!this.enabled) return { success: false, error: 'VisualRelay not configured' };

        try {
            const buffer = await this._browserlessRequest('/pdf', {
                url,
                options: { printBackground: true, format: 'A4' }
            });

            return { success: true, buffer, size: buffer.length };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async pdfToTelegram(url, caption = '') {
        const result = await this.generatePDF(url);
        if (!result.success) return result;

        try {
            await this._sendDocumentToTelegram(result.buffer, caption || `📄 ${url}`, 'report.pdf');
            return { success: true, message: 'PDF sent to Telegram' };
        } catch (err) {
            return { success: false, error: `PDF OK, Telegram failed: ${err.message}` };
        }
    }

    getStatus() {
        return {
            enabled: this.enabled,
            browserless: !!this.browserlessToken,
            telegram: !!(this.telegramToken && this.chatId)
        };
    }

    getStatusMessage() {
        const s = this.getStatus();
        return [
            `🌐 **Visual Relay** ${s.enabled ? '🟢' : '🔴'}`,
            `Browserless: ${s.browserless ? '✅' : '❌'}`,
            `Telegram: ${s.telegram ? '✅' : '❌'}`
        ].join('\n');
    }

    // ───────── INTERNAL ─────────

    async _browserlessRequest(endpoint, body) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.browserlessUrl}${endpoint}?token=${this.browserlessToken}`);
            const isHttps = url.protocol === 'https:';
            const transport = isHttps ? https : http;
            const data = JSON.stringify(body);

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = transport.request(options, (res) => {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    if (res.statusCode >= 400) {
                        reject(new Error(`Browserless ${res.statusCode}: ${buffer.toString().substring(0, 200)}`));
                        return;
                    }
                    resolve(buffer);
                });
            });

            req.on('error', reject);
            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Browserless timeout (30s)'));
            });

            req.write(data);
            req.end();
        });
    }

    async _sendPhotoToTelegram(buffer, caption) {
        return this._telegramMultipart('/sendPhoto', 'photo', buffer, 'screenshot.png', caption);
    }

    async _sendDocumentToTelegram(buffer, caption, filename) {
        return this._telegramMultipart('/sendDocument', 'document', buffer, filename, caption);
    }

    async _telegramMultipart(endpoint, fieldName, buffer, filename, caption) {
        return new Promise((resolve, reject) => {
            const boundary = `----FormBoundary${Date.now()}`;
            const parts = [];

            // chat_id
            parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${this.chatId}`);

            // caption
            if (caption) {
                parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`);
            }

            // file
            const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
            const fileFooter = `\r\n--${boundary}--\r\n`;

            const body = Buffer.concat([
                Buffer.from(parts.join('\r\n') + '\r\n'),
                Buffer.from(fileHeader),
                buffer,
                Buffer.from(fileFooter)
            ]);

            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.telegramToken}${endpoint}`,
                method: 'POST',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': body.length
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 400) {
                        reject(new Error(`Telegram ${res.statusCode}: ${data.substring(0, 200)}`));
                        return;
                    }
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }
}

export default VisualRelay;
