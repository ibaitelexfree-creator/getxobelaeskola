/**
 * VisualRelay — Browserless Screenshots & PDFs → Telegram
 * 
<<<<<<< HEAD
 * Master Fix: Uses 'curl' bridge for Telegram communications. 
 * Since Node.js native network calls were consistently hanging due to system-level 
 * IPv6/MTU issues, this bridge leverages the system's 'curl' binary (IPV4 forced)
 * to send messages and photos.
=======
 * Eliminates local browser dependency by routing all web
 * visualization through Browserless.io, sending results
 * directly to Telegram as photos or documents.
>>>>>>> pr-286
 */

import https from 'https';
import http from 'http';
<<<<<<< HEAD
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { spawnSync } from 'child_process';

// Fix connection hangs to Telegram/Browserless by prioritizing IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const BROWSERLESS_DEFAULT = 'https://chrome.browserless.io';
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'screenshots');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
=======

const BROWSERLESS_DEFAULT = 'https://chrome.browserless.io';
>>>>>>> pr-286

export class VisualRelay {
    constructor(options = {}) {
        this.browserlessUrl = options.browserlessUrl || process.env.BROWSERLESS_URL || BROWSERLESS_DEFAULT;
        this.browserlessToken = options.browserlessToken || process.env.BROWSERLESS_TOKEN;
        this.telegramToken = options.telegramToken || process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = options.chatId || process.env.TELEGRAM_CHAT_ID;
<<<<<<< HEAD
        // enabled = Telegram configured (Browserless is optional - will use text fallback)
        this.telegramEnabled = !!(this.telegramToken && this.chatId);
        this.browserlessEnabled = !!(this.browserlessToken && this.telegramEnabled);
        this.enabled = this.telegramEnabled; // No longer requires Browserless
    }

    async screenshot(url, options = {}) {
        if (!this.browserlessEnabled) return { success: false, error: 'Browserless not configured' };
=======
        this.enabled = !!(this.browserlessToken && this.telegramToken && this.chatId);
    }

    async screenshot(url, options = {}) {
        if (!this.enabled) return { success: false, error: 'VisualRelay not configured' };
>>>>>>> pr-286

        try {
            const buffer = await this._browserlessRequest('/screenshot', {
                url,
<<<<<<< HEAD
                gotoOptions: {
                    waitUntil: 'networkidle0'
                },
=======
>>>>>>> pr-286
                options: {
                    fullPage: options.fullPage || false,
                    type: 'png'
                }
            });

<<<<<<< HEAD
            // Save locally
            const filename = `shot_${Date.now()}.png`;
            const filepath = path.join(STORAGE_DIR, filename);
            fs.writeFileSync(filepath, buffer);

            return { success: true, buffer, size: buffer.length, filename };
=======
            return { success: true, buffer, size: buffer.length };
>>>>>>> pr-286
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async screenshotToTelegram(url, caption = '') {
<<<<<<< HEAD
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
                `⚠️ Modo texto (Fallback por error de red o falta de Token)`,
                `🕐 ${new Date().toISOString()}`
            ].join('\n');
            await this._sendTelegramMessage(text);
            return { success: true, message: 'Text notification sent to Telegram' };
        } catch (err) {
            return { success: false, error: `Telegram failed: ${err.message}` };
=======
        const result = await this.screenshot(url);
        if (!result.success) return result;

        try {
            await this._sendPhotoToTelegram(result.buffer, caption || `📸 ${url}`);
            return { success: true, message: 'Screenshot sent to Telegram' };
        } catch (err) {
            return { success: false, error: `Screenshot OK, Telegram failed: ${err.message}` };
>>>>>>> pr-286
        }
    }

    async generatePDF(url) {
<<<<<<< HEAD
        if (!this.browserlessEnabled) return { success: false, error: 'Browserless not configured' };
=======
        if (!this.enabled) return { success: false, error: 'VisualRelay not configured' };
>>>>>>> pr-286

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

<<<<<<< HEAD
    async getUsage() {
        return null; // Simplified for now
    }

    getStatus() {
        return {
            enabled: this.telegramEnabled,
            browserless: this.browserlessEnabled,
            telegram: this.telegramEnabled
=======
    getStatus() {
        return {
            enabled: this.enabled,
            browserless: !!this.browserlessToken,
            telegram: !!(this.telegramToken && this.chatId)
>>>>>>> pr-286
        };
    }

    getStatusMessage() {
        const s = this.getStatus();
<<<<<<< HEAD
        const mode = s.browserless ? 'Screenshot + Telegram' : (s.telegram ? 'Texto (sin Browserless)' : 'DESCONECTADO');
        return [
            `🌐 **Visual Relay** ${s.enabled ? '🟢' : '🔴'}`,
            `Modo: ${mode}`,
            `Browserless: ${s.browserless ? '✅' : '❌ (texto fallback)'}`,
=======
        return [
            `🌐 **Visual Relay** ${s.enabled ? '🟢' : '🔴'}`,
            `Browserless: ${s.browserless ? '✅' : '❌'}`,
>>>>>>> pr-286
            `Telegram: ${s.telegram ? '✅' : '❌'}`
        ].join('\n');
    }

<<<<<<< HEAD
    // ───────── INTERNAL (CURL BRIDGE) ─────────

    async _browserlessRequest(endpoint, body) {
        const url = `${this.browserlessUrl}${endpoint}?token=${this.browserlessToken}`;
        const payload = JSON.stringify(body);
        const tmpBody = path.join(STORAGE_DIR, `req_${Date.now()}.json`);

        try {
            fs.writeFileSync(tmpBody, payload);
            const result = spawnSync('curl', [
                '-4', '-s', '-X', 'POST', url,
                '-H', 'Content-Type: application/json',
                '--data-binary', `@${tmpBody}`
            ]);

            if (fs.existsSync(tmpBody)) fs.unlinkSync(tmpBody);
            if (result.error) throw result.error;

            const buffer = result.stdout;
            if (!buffer || buffer.length === 0) throw new Error('Empty response from Browserless');

            // Log size for debugging
            console.log(`[VisualRelay] Captured ${endpoint}: ${buffer.length} bytes`);

            // Verification that we got an image (PNG starts with 89 50 4E 47)
            if (endpoint === '/screenshot' || endpoint === '/pdf') {
                const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
                const isPdf = buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

                if (!isPng && !isPdf) {
                    const text = buffer.toString('utf8').substring(0, 100);
                    if (text.includes('502 Bad Gateway') || text.includes('validation failed') || text.includes('Bad Request')) {
                        throw new Error(`Browserless Error (Source Down): ${text.trim()}`);
                    }
                    if (endpoint === '/screenshot') {
                        throw new Error(`Invalid Screenshot Buffer (Not PNG): ${text.trim()}...`);
                    }
                }
            }

            return buffer;
        } catch (err) {
            console.error('[VisualRelay] Browserless request failed:', err.message);
            throw err;
        }
    }

    async _sendTelegramMessage(text) {
        const url = `https://api.telegram.org/bot${this.telegramToken}/sendMessage`;
        const payload = JSON.stringify({
            chat_id: this.chatId,
            text,
            parse_mode: 'Markdown'
        });
        const tmpBody = path.join(STORAGE_DIR, `tel_${Date.now()}.json`);

        try {
            fs.writeFileSync(tmpBody, payload);
            const result = spawnSync('curl', [
                '-4', '-s', '-X', 'POST', url,
                '-H', 'Content-Type: application/json',
                '--data-binary', `@${tmpBody}`
            ], { encoding: 'utf-8' });

            if (fs.existsSync(tmpBody)) fs.unlinkSync(tmpBody);
            if (result.error) throw result.error;

            const data = JSON.parse(result.stdout);
            if (!data.ok) throw new Error(data.description);
            return data;
        } catch (err) {
            console.error('[VisualRelay] Telegram curl failed:', err.message);
            throw err;
        }
=======
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
>>>>>>> pr-286
    }

    async _sendPhotoToTelegram(buffer, caption) {
        return this._telegramMultipart('/sendPhoto', 'photo', buffer, 'screenshot.png', caption);
    }

    async _sendDocumentToTelegram(buffer, caption, filename) {
        return this._telegramMultipart('/sendDocument', 'document', buffer, filename, caption);
    }

    async _telegramMultipart(endpoint, fieldName, buffer, filename, caption) {
<<<<<<< HEAD
        const url = `https://api.telegram.org/bot${this.telegramToken}${endpoint}`;
        const tmpFile = path.join(STORAGE_DIR, `tmp_${Date.now()}_${filename}`);

        try {
            fs.writeFileSync(tmpFile, buffer);

            const args = [
                '-4', '-s', '-X', 'POST', url,
                '-F', `chat_id=${this.chatId}`,
                '-F', `${fieldName}=@${tmpFile}`
            ];

            if (caption) {
                args.push('-F', `caption=${caption}`);
                args.push('-F', 'parse_mode=Markdown');
            }

            const result = spawnSync('curl', args, { encoding: 'utf-8' });
            if (result.error) throw result.error;

            if (result.stdout.trim() === '') {
                throw new Error('Telegram returned empty stdout. Check if curl is blocked.');
            }

            const data = JSON.parse(result.stdout);
            if (!data.ok) {
                console.error('[VisualRelay] Telegram Error Response:', data);
                throw new Error(data.description);
            }
            return data;
        } catch (err) {
            console.error('[VisualRelay] Telegram multipart curl failed:', err.message);
            throw err;
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
=======
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
>>>>>>> pr-286
    }
}

export default VisualRelay;
