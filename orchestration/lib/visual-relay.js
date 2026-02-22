/**
 * VisualRelay — Browserless Screenshots & PDFs → Telegram
 * 
 * Eliminates local browser dependency by routing all web
 * visualization through Browserless.io, sending results
 * directly to Telegram as photos or documents.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BROWSERLESS_DEFAULT = 'https://chrome.browserless.io';
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'screenshots');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class VisualRelay {
    constructor(options = {}) {
        this.browserlessUrl = options.browserlessUrl || process.env.BROWSERLESS_URL || BROWSERLESS_DEFAULT;
        this.browserlessToken = options.browserlessToken || process.env.BROWSERLESS_TOKEN;
        this.telegramToken = options.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID;
        // enabled = Telegram configured (Browserless is optional - will use text fallback)
        this.telegramEnabled = !!(this.telegramToken && this.chatId);
        this.browserlessEnabled = !!(this.browserlessToken && this.telegramEnabled);
        this.enabled = this.telegramEnabled; // No longer requires Browserless
    }

    async screenshot(url, options = {}) {
        if (!this.browserlessEnabled) return { success: false, error: 'Browserless not configured (use screenshotToTelegram for text fallback)' };

        try {
            const buffer = await this._browserlessRequest('/screenshot', {
                url,
                options: {
                    fullPage: options.fullPage || false,
                    type: 'png'
                }
            });

            // Save locally for History View
            const filename = `shot_${Date.now()}.png`;
            const filepath = path.join(STORAGE_DIR, filename);
            fs.writeFileSync(filepath, buffer);

            return { success: true, buffer, size: buffer.length, filename };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async screenshotToTelegram(url, caption = '') {
        if (!this.telegramEnabled) return { success: false, error: 'Telegram not configured' };

        // If browserless is available, send a real screenshot
        if (this.browserlessEnabled) {
            const result = await this.screenshot(url);
            if (result.success) {
                try {
                    await this._sendPhotoToTelegram(result.buffer, caption || `📸 ${url}`);
                    return { success: true, message: 'Screenshot sent to Telegram' };
                } catch (err) {
                    console.warn('[VisualRelay] Photo send failed, falling back to text:', err.message);
                }
            }
        }

        // Fallback: send text notification via Telegram
        try {
            const text = [
                caption || `📸 Visual Relay`,
                `🔗 URL: ${url}`,
                `⚠️ Modo texto (BROWSERLESS_TOKEN no configurado)`,
                `🕐 ${new Date().toISOString()}`
            ].join('\n');
            await this._sendTelegramMessage(text);
            return { success: true, message: 'Text notification sent to Telegram (no Browserless)' };
        } catch (err) {
            return { success: false, error: `Telegram failed: ${err.message}` };
        }
    }

    async generatePDF(url) {
        if (!this.browserlessEnabled) return { success: false, error: 'Browserless not configured' };

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

    async getUsage() {
        if (!this.enabled || !this.browserlessToken) return null;

        try {
            const data = await new Promise((resolve, reject) => {
                const url = new URL(`${this.browserlessUrl}/account?token=${this.browserlessToken}`);
                const isHttps = url.protocol === 'https:';
                const transport = isHttps ? https : http;

                transport.get(url, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 400) {
                            reject(new Error(`Status ${res.statusCode}`));
                            return;
                        }
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on('error', reject);
            });

            return {
                used: data.usage || 0,
                limit: data.limit || 0,
                remaining: data.remaining || 0
            };
        } catch (err) {
            console.error('[VisualRelay] Failed to get usage:', err.message);
            return null;
        }
    }

    getStatus() {
        return {
            enabled: this.telegramEnabled,
            browserless: this.browserlessEnabled,
            telegram: this.telegramEnabled
        };
    }

    getStatusMessage() {
        const s = this.getStatus();
        const mode = s.browserless ? 'Screenshot + Telegram' : (s.telegram ? 'Texto (sin Browserless)' : 'DESCONECTADO');
        return [
            `🌐 **Visual Relay** ${s.enabled ? '🟢' : '🔴'}`,
            `Modo: ${mode}`,
            `Browserless: ${s.browserless ? '✅' : '❌ (texto fallback)'}`,
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

    async _sendTelegramMessage(text) {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify({
                chat_id: this.chatId,
                text,
                parse_mode: 'Markdown'
            });
            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.telegramToken}/sendMessage`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    res.statusCode >= 400
                        ? reject(new Error(`Telegram ${res.statusCode}: ${data.substring(0, 200)}`))
                        : resolve(JSON.parse(data));
                });
            });
            req.on('error', reject);
            req.write(body);
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
