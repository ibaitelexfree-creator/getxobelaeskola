/**
 * FlashExecutor — Gemini Flash Fast Execution Layer
 * 
 * Level 2 in the execution hierarchy:
 *   1. Jules Pool (primary)
 *   2. Gemini Flash (fast, low-cost) ← THIS
 *   3. ClawdBot (last resort, requires confirmation)
 * 
 * Uses Gemini Flash for sub-second task processing when Jules is saturated.
 * Monitors credit consumption and pauses automatically when low.
 */

import https from 'https';
import { EventEmitter } from 'events';

const GEMINI_API_BASE = 'generativelanguage.googleapis.com';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const CREDIT_CHECK_INTERVAL = 5 * 60 * 1000; // 5 min

export class FlashExecutor extends EventEmitter {
    constructor(options = {}) {
        super();
        this.apiKey = options.apiKey || process.env.GEMINI_API_KEY;
        this.model = options.model || DEFAULT_MODEL;
        this.enabled = !!this.apiKey;

        // Usage tracking
        this.stats = {
            tasksExecuted: 0,
            tokensUsed: 0,
            errorsCount: 0,
            lastExecution: null,
            dailyDate: new Date().toISOString().split('T')[0]
        };

        // Credit state
        this.credits = {
            available: this.enabled,
            lastCheck: null,
            consecutiveErrors: 0,
            maxConsecutiveErrors: 5
        };

        if (this.enabled) {
            this._startCreditMonitor();
        }
    }

    hasCredits() {
        if (!this.enabled) return false;
        if (this.credits.consecutiveErrors >= this.credits.maxConsecutiveErrors) return false;
        return this.credits.available;
    }

    async execute(task) {
        if (!this.hasCredits()) {
            return { success: false, error: 'No credits or Flash disabled' };
        }

        this._checkDailyReset();

        const prompt = this._buildPrompt(task);

        try {
            const result = await this._callGemini(prompt);
            this.stats.tasksExecuted++;
            this.stats.tokensUsed += result.tokensUsed || 0;
            this.stats.lastExecution = new Date().toISOString();
            this.credits.consecutiveErrors = 0;

            this.emit('taskCompleted', {
                task: task.title,
                tokensUsed: result.tokensUsed,
                latencyMs: result.latencyMs
            });

            return {
                success: true,
                summary: result.text?.substring(0, 500) || 'Completed',
                tokensUsed: result.tokensUsed,
                latencyMs: result.latencyMs
            };
        } catch (err) {
            this.stats.errorsCount++;
            this.credits.consecutiveErrors++;

            if (this.credits.consecutiveErrors >= this.credits.maxConsecutiveErrors) {
                this.credits.available = false;
                this.emit('creditsExhausted', { error: err.message });
            }

            return { success: false, error: err.message };
        }
    }

    getStatus() {
        return {
            enabled: this.enabled,
            hasCredits: this.hasCredits(),
            model: this.model,
            stats: { ...this.stats },
            credits: { ...this.credits }
        };
    }

    getStatusMessage() {
        const status = this.getStatus();
        const emoji = status.hasCredits ? '🟢' : (status.enabled ? '🟡' : '🔴');

        return [
            `⚡ **Flash Executor** ${emoji}`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `Modelo: ${status.model}`,
            `Estado: ${status.hasCredits ? 'Disponible' : (status.enabled ? 'Sin créditos' : 'Desactivado')}`,
            `Tareas hoy: ${status.stats.tasksExecuted}`,
            `Tokens usados: ${status.stats.tokensUsed.toLocaleString()}`,
            `Errores: ${status.stats.errorsCount}`,
            status.stats.lastExecution ? `Última: ${status.stats.lastExecution}` : ''
        ].filter(Boolean).join('\n');
    }

    stop() {
        if (this._creditInterval) {
            clearInterval(this._creditInterval);
            this._creditInterval = null;
        }
    }

    // ───────── INTERNAL ─────────

    _buildPrompt(task) {
        return [
            'You are a fast code execution agent. Complete this task efficiently.',
            `Task: ${task.title || task.description}`,
            task.context ? `Context: ${task.context}` : '',
            'Respond with a concise summary of what was done.'
        ].filter(Boolean).join('\n');
    }

    async _callGemini(prompt) {
        const startMs = Date.now();

        return new Promise((resolve, reject) => {
            const body = JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.2
                }
            });

            const options = {
                hostname: GEMINI_API_BASE,
                port: 443,
                path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const latencyMs = Date.now() - startMs;

                    if (res.statusCode === 429) {
                        reject(new Error('Rate limited (RPM exceeded)'));
                        return;
                    }

                    if (res.statusCode >= 400) {
                        reject(new Error(`API error ${res.statusCode}: ${data.substring(0, 200)}`));
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        const tokensUsed = parsed.usageMetadata?.totalTokenCount || 0;

                        resolve({ text, tokensUsed, latencyMs });
                    } catch (parseErr) {
                        reject(new Error(`Parse error: ${parseErr.message}`));
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Timeout (30s)'));
            });

            req.write(body);
            req.end();
        });
    }

    async _checkCredits() {
        try {
            const result = await this._callGemini('ping');
            this.credits.available = true;
            this.credits.lastCheck = new Date().toISOString();
            this.credits.consecutiveErrors = 0;
        } catch (err) {
            if (err.message.includes('429') || err.message.includes('quota')) {
                this.credits.available = false;
                this.emit('creditsLow', { error: err.message });
            }
            this.credits.lastCheck = new Date().toISOString();
        }
    }

    _startCreditMonitor() {
        // Initial check after 10s
        setTimeout(() => this._checkCredits(), 10000);
        this._creditInterval = setInterval(() => this._checkCredits(), CREDIT_CHECK_INTERVAL);
    }

    _checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        if (today !== this.stats.dailyDate) {
            this.stats = {
                tasksExecuted: 0,
                tokensUsed: 0,
                errorsCount: 0,
                lastExecution: null,
                dailyDate: today
            };
            this.credits.consecutiveErrors = 0;
            this.credits.available = this.enabled;
        }
    }
}

export default FlashExecutor;
