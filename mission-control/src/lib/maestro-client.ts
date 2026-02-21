/**
 * Maestro Client — HTTP interface to Maestro commands
 * Each method maps to a Telegram command from maestro.js
 */

const DEFAULT_MAESTRO = 'http://localhost:3323';
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

function getMaestroUrl(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('mc_server_url') || DEFAULT_MAESTRO;
    }
    return DEFAULT_MAESTRO;
}

/**
 * Generic request with timeout and retry logic
 */
async function maestroRequest<T>(method: string, path: string, body?: unknown, retries = MAX_RETRIES): Promise<T> {
    const url = `${getMaestroUrl()}${path}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!res.ok) {
            if (res.status >= 500 && retries > 0) {
                await new Promise(r => setTimeout(r, 1000));
                return maestroRequest(method, path, body, retries - 1);
            }
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`Maestro error ${res.status}: ${text}`);
        }
        return res.json();
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') throw new Error('Maestro Request Timeout');
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            return maestroRequest(method, path, body, retries - 1);
        }
        throw error;
    }
}

async function maestroPost<T>(path: string, body?: unknown): Promise<T> {
    return maestroRequest('POST', path, body);
}

async function maestroGet<T>(path: string): Promise<T> {
    return maestroRequest('GET', path);
}

// ─── Execution Commands ───

/** /task <desc> — Cascade: Jules → Flash → ClawdBot */
export async function sendTask(description: string, mode: 'cascade' | 'flash' | 'clawdbot' = 'cascade') {
    return maestroPost('/mcp/execute', {
        tool: 'jules_create_session',
        parameters: {
            prompt: description,
            title: description,
            source: 'sources/github/ibaitelexfree-creator/getxobelaeskola',
            automationMode: mode === 'flash' ? 'FLASH_ONLY' : mode === 'clawdbot' ? 'NONE' : 'AUTO_CREATE_PR'
        },
    });
}

/** /todo <desc> — Alias for /task */
export const sendTodo = sendTask;

/** /clawdebot <desc> — Isolated session direct to PC ClawdBot */
export async function sendClawdebot(description: string) {
    return maestroPost('/mcp/execute', {
        tool: 'jules_create_session',
        parameters: {
            prompt: description,
            title: `[ClawdBot] ${description}`,
            source: 'sources/github/ibaitelexfree-creator/getxobelaeskola',
            automationMode: 'NONE'
        },
    });
}

/** /approve — Approve pending ClawdBot task */
export async function approve() {
    return maestroPost('/watchdog/action', { action: 'feed', message: '/approve' });
}

/** /reject — Reject and re-queue */
export async function reject() {
    return maestroPost('/watchdog/action', { action: 'feed', message: '/reject' });
}

/** /force-clawdbot — Force next task to ClawdBot */
export async function forceClawdbot() {
    return maestroPost('/watchdog/action', { action: 'feed', message: '/force-clawdbot' });
}

// ─── Monitoring Commands ───

export interface MaestroStatus {
    jules: { used: number; total: number; active: number };
    flash: { enabled: boolean; tasksToday: number; tokensUsed: number };
    clawdbot: { healthy: boolean; delegations: number };
    visual: { enabled: boolean };
    thermal: { label: string; level: number };
    queue: number;
    pendingApproval: boolean;
    stats: { assigned: number; completed: number };
}

/** /status — Get full system status */
export async function getStatus(): Promise<MaestroStatus> {
    const health = await maestroGet<any>('/health');
    const watchdog = await maestroGet<any>('/watchdog/status');

    return {
        jules: {
            used: health.circuitBreaker?.failures || 0,
            total: 300,
            active: health.services?.julesApi === 'configured' ? 1 : 0
        },
        flash: { enabled: health.services?.github === 'configured', tasksToday: 0, tokensUsed: 0 },
        clawdbot: { healthy: true, delegations: 0 },
        visual: { enabled: health.services?.browserless !== 'error' },
        thermal: { label: 'Normal', level: 0 },
        queue: 0,
        pendingApproval: watchdog.state === 'STALLED' || watchdog.state === 'LOOPING',
        stats: { assigned: 0, completed: 0 },
    };
}

/** /usage — Credit usage dashboard */
export async function getUsage() {
    return maestroGet('/health');
}

/** /doctor — Health check all services */
export interface DoctorResult {
    checks: Array<{ name: string; ok: boolean; error?: string }>;
}

export async function doctor(): Promise<DoctorResult> {
    const health = await maestroGet<any>('/health');
    const checks = Object.entries(health.services || {}).map(([name, status]) => ({
        name,
        ok: status !== 'error' && status !== 'not_configured',
    }));
    return { checks };
}

/** /screenshot <url> — Remote screenshot via Browserless */
export async function screenshot(url: string) {
    return maestroPost('/mcp/execute', {
        tool: 'telegram_send_message',
        parameters: { text: `/screenshot ${url}` },
    });
}

/** /queue — Task queue status */
export async function getQueue() {
    return maestroPost('/mcp/execute', { tool: 'jules_get_queue' });
}

// ─── Control Commands ───

/** /temp — CPU/GPU temperatures */
export const getTemp = () => maestroGet('/health');

/** /pool — Jules pool status */
export const getPool = () => maestroGet('/health');

/** /pause — Pause Jules pool */
export const pausePool = () => maestroPost('/watchdog/action', { action: 'pause' });

/** /resume — Resume Jules pool */
export const resumePool = () => maestroPost('/watchdog/action', { action: 'resume' });

/** /watchdog — Watchdog status */
export const getWatchdog = () => maestroGet('/watchdog/status');

/** /watchdog pause */
export const pauseWatchdog = () => maestroPost('/watchdog/action', { action: 'pause' });

/** /watchdog resume */
export const resumeWatchdog = () => maestroPost('/watchdog/action', { action: 'resume' });

// ─── Release Management ───

export interface ReleaseAsset {
    id: number;
    name: string;
    size: number;
    downloadUrl: string;
}

export interface Release {
    id: number;
    tagName: string;
    name: string;
    publishDate: string;
    body: string;
    assets: ReleaseAsset[];
}

/** Get list of Mission Control releases */
export async function getReleases() {
    return maestroGet<{ success: boolean; releases: Release[] }>('/api/releases');
}

/** Get the proxy download URL for an asset */
export function getDownloadUrl(assetId: number): string {
    return `${getMaestroUrl()}/api/releases/download/${assetId}`;
}

