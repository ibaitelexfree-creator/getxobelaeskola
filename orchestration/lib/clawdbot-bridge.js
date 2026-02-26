/**
 * ClawdBot Bridge — Last Resort Delegation to OpenClaw Gateway
 * 
 * Communicates with ClawdBot (Claude via OpenClaw) when:
 * 1. All 3 Jules accounts hit 100/day limit (300 tasks exhausted)
 * 2. Temperature is in "stop" zone → Jules paused
 * 3. All Jules have 15 concurrent sessions (45 saturated)
 * 
 * Gateway endpoint: http://localhost:18789
 */

import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

const GATEWAY_HOST = 'localhost';
const GATEWAY_PORT = 18789;
const GATEWAY_TOKEN = 'clawdbot-fixed';

export class ClawdBotBridge extends EventEmitter {
    constructor(options = {}) {
        super();
        this.host = options.host || GATEWAY_HOST;
        this.port = options.port || GATEWAY_PORT;
        this.token = options.token || GATEWAY_TOKEN;
        this.dockerComposePath = options.dockerComposePath || null;
        this.lastHealthCheck = null;
        this.healthy = false;
        this.delegatedTasks = [];
    }

    /**
     * Check if ClawdBot gateway is running and reachable
     */
    async isAvailable() {
        try {
            const result = await this._request('GET', '/health', null, 5000);
            this.healthy = true;
            this.lastHealthCheck = Date.now();
            return true;
        } catch {
            // Try a simple TCP connect as fallback
            try {
                await this._tcpCheck();
                this.healthy = true;
                this.lastHealthCheck = Date.now();
                return true;
            } catch {
                this.healthy = false;
                this.lastHealthCheck = Date.now();
                return false;
            }
        }
    }

    /**
     * Delegate a task to ClawdBot
     * Translates Jules-style task to OpenClaw prompt format
     */
    async delegateTask(task) {
        if (!this.healthy) {
            const available = await this.isAvailable();
            if (!available) {
                // Try to start Docker if path is configured
                if (this.dockerComposePath) {
                    const started = await this.ensureRunning();
                    if (!started) {
                        this.emit('unavailable', { task, reason: 'Gateway not reachable and Docker failed to start' });
                        return { success: false, error: 'ClawdBot unavailable' };
                    }
                } else {
                    this.emit('unavailable', { task, reason: 'Gateway not reachable' });
                    return { success: false, error: 'ClawdBot unavailable' };
                }
            }
        }

        const prompt = this._formatTaskAsPrompt(task);

        try {
            const result = await this._request('POST', '/api/chat', {
                message: prompt,
                context: task.context || '',
                workspace: '/workspace'
            }, 120000); // 2 minute timeout for task execution

            const delegationRecord = {
                id: `clawdbot-${Date.now()}`,
                task: task.title || task.description,
                delegatedAt: Date.now(),
                result: result.success ? 'completed' : 'failed',
                response: result
            };

            this.delegatedTasks.push(delegationRecord);

            this.emit('taskCompleted', delegationRecord);
            return { success: true, result, delegationId: delegationRecord.id };
        } catch (err) {
            this.emit('taskFailed', { task, error: err.message });
            return { success: false, error: err.message };
        }
    }

    /**
     * Get ClawdBot status for Telegram
     */
    getStatus() {
        return {
            healthy: this.healthy,
            lastCheck: this.lastHealthCheck,
            delegatedTotal: this.delegatedTasks.length,
            recentTasks: this.delegatedTasks.slice(-5)
        };
    }

    /**
     * Get formatted status message
     */
    getStatusMessage() {
        const s = this.getStatus();
        const icon = s.healthy ? '🟢' : '🔴';
        const lastCheck = s.lastCheck ? new Date(s.lastCheck).toLocaleTimeString() : 'Nunca';

        return [
            `${icon} **ClawdBot** (último recurso)`,
            `Estado: ${s.healthy ? 'Operativo' : 'No disponible'}`,
            `Último check: ${lastCheck}`,
            `Tareas delegadas: ${s.delegatedTotal}`
        ].join('\n');
    }

    /**
     * Try to start the Docker compose stack
     */
    async ensureRunning() {
        const composePath = this.dockerComposePath ||
<<<<<<< HEAD
            'c:\\Users\\User\\Desktop\\getxobelaeskola\\docker-compose.openclaw.yml';
=======
            'c:\\Users\\User\\Desktop\\Saili8ng School Test\\docker-compose.openclaw.yml';
>>>>>>> pr-286

        try {
            console.log('[ClawdBot] Attempting to start Docker compose...');
            await execAsync(
                `docker compose -f "${composePath}" up -d`,
                { timeout: 60000, windowsHide: true }
            );

            // Wait for gateway to be ready
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 3000));
                if (await this.isAvailable()) {
                    console.log('[ClawdBot] Gateway is ready');
                    return true;
                }
            }

            console.warn('[ClawdBot] Gateway did not become ready in time');
            return false;
        } catch (err) {
            console.error('[ClawdBot] Failed to start Docker:', err.message);
            return false;
        }
    }

    /**
     * Format a Jules-style task into an OpenClaw chat prompt
     */
    _formatTaskAsPrompt(task) {
        const parts = [
            `TAREA: ${task.title || task.description || 'Sin título'}`,
        ];

        if (task.files) parts.push(`ARCHIVOS: ${task.files.join(', ')}`);
        if (task.criteria) parts.push(`CRITERIO DE ÉXITO: ${task.criteria}`);
        if (task.constraints) parts.push(`RESTRICCIONES: ${task.constraints}`);
        if (task.description && task.title) parts.push(`DESCRIPCIÓN: ${task.description}`);

        parts.push('\nEjecuta esta tarea en el repositorio. Sé conciso y directo.');

        return parts.join('\n');
    }

    /**
     * Make HTTP request to the OpenClaw gateway
     */
    _request(method, path, body, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const data = body ? JSON.stringify(body) : null;

            const options = {
                hostname: this.host,
                port: this.port,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
                },
                timeout
            };

            const req = http.request(options, (res) => {
                let responseBody = '';
                res.on('data', chunk => responseBody += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(responseBody));
                    } catch {
                        resolve({ raw: responseBody, statusCode: res.statusCode });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) req.write(data);
            req.end();
        });
    }

    /**
     * Simple TCP connection check
     */
    _tcpCheck() {
        return new Promise((resolve, reject) => {
            const net = require('net');
            const socket = new net.Socket();

            socket.setTimeout(3000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('error', reject);
            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('TCP timeout'));
            });

            socket.connect(this.port, this.host);
        });
    }
}

export default ClawdBotBridge;
