/**
 * Maestro Client — HTTP interface to Maestro commands
 * Each method maps to a Telegram command from maestro.js
 */

const DEFAULT_MAESTRO = 'http://localhost:3323';

function getMaestroUrl(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('mc_server_url') || DEFAULT_MAESTRO;
    }
    return DEFAULT_MAESTRO;
}

async function maestroPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${getMaestroUrl()}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

async function maestroGet<T>(path: string): Promise<T> {
    const res = await fetch(`${getMaestroUrl()}${path}`);
    return res.json();
}

// ─── Execution Commands ───

/** /task <desc> — Cascade: Jules → Flash → ClawdBot */
export async function sendTask(description: string, mode: 'cascade' | 'flash' | 'clawdbot' = 'cascade') {
    const toolMap = {
        cascade: 'jules_create_session',
        flash: 'jules_create_session',
        clawdbot: 'jules_create_session',
    };
    return maestroPost('/mcp/execute', {
        tool: toolMap[mode],
        parameters: { prompt: description, title: description, source: 'sources/github/ibaitelexfree-creator/getxobelaeskola' },
    });
}

/** Direct question to specific Jules via Telegram */
export async function sendQuestion(text: string, julesId: string) {
    const roles: Record<string, string> = {
<<<<<<< HEAD
        '1': 'Analytics',
=======
        '1': 'Analytics & Testing',
>>>>>>> d903948 (chore: auto-sync)
        '2': 'Data Engineering',
        '3': 'Dev / Orquestador',
    };

    const role = roles[julesId] || 'Agente';

    return maestroPost('/mcp/execute', {
        tool: 'telegram_send_message',
        parameters: {
            text: `❓ *Pregunta para Jules ${julesId}* (${role})\n\n${text}`,
            parseMode: 'Markdown',
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
    return {
        jules: { used: 0, total: 300, active: 0 },
        flash: { enabled: health.services?.geminiFlash !== 'error', tasksToday: 0, tokensUsed: 0 },
        clawdbot: { healthy: health.services?.clawdbot !== 'error', delegations: 0 },
        visual: { enabled: health.services?.browserless !== 'error' },
        thermal: { label: 'Normal', level: 0 },
        queue: 0,
        pendingApproval: false,
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
