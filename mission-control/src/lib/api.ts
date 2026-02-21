const DEFAULT_BASE = 'http://localhost:3323';

function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('mc_server_url') || DEFAULT_BASE;
    }
    return DEFAULT_BASE;
}

const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
    const { timeout = TIMEOUT_MS } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function request<T>(method: string, path: string, body?: unknown, retries = MAX_RETRIES): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
    const opts: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'MissionControlV3'
        },
    };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetchWithTimeout(url, opts);

        if (!res.ok) {
            if (res.status >= 500 && retries > 0) {
                console.warn(`Retrying ${method} ${path}... attempts left: ${retries}`);
                await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1)));
                return request(method, path, body, retries - 1);
            }
            const text = await res.text().catch(() => 'Unknown error');
            throw new Error(`API ${method} ${path}: ${res.status} — ${text}`);
        }
        return res.json();
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(`API Timeout: ${method} ${path} after ${TIMEOUT_MS}ms`);
        }
        if (retries > 0) {
            console.warn(`Connection error, retrying... attempts left: ${retries}`);
            await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1)));
            return request(method, path, body, retries - 1);
        }
        throw error;
    }
}


// ─── Health & Info ───

export interface HealthResponse {
    status: string;
    version: string;
    uptime: number;
    memory: { used: string; total: string };
    services: Record<string, string>;
    circuitBreaker: { failures: number; isOpen: boolean };
}

export const getHealth = () => request<HealthResponse>('GET', '/health');

export const getActiveSessions = () => request<{ activeSessions: any[], activeCount: number }>('GET', '/api/sessions/active');

// ─── Watchdog ───

export interface WatchdogStatus {
    state: string;
    uptime: string;
    lastOutput: string;
    bufferSize: number;
    retryCount: number;
    stats: {
        loopsDetected: number;
        stallsDetected: number;
        crashesRecovered: number;
        autoContinues: number;
        totalInterventions: number;
    };
}

export const getWatchdogStatus = () => request<WatchdogStatus>('GET', '/watchdog/status');
export const watchdogAction = (action: string, message?: string) =>
    request<{ success: boolean }>('POST', '/watchdog/action', { action, message });

export const registerDevice = (token: string, platform: string, deviceId: string) =>
    request<{ success: boolean }>('POST', '/watchdog/register-device', { token, platform, deviceId });

// ─── MCP Execute (proxy to Maestro commands) ───

export interface MCPResult {
    success: boolean;
    result?: unknown;
    error?: string;
}

export const executeTool = (name: string, params: Record<string, unknown> = {}) =>
    request<MCPResult>('POST', '/mcp/execute', { tool: name, parameters: params });

// ─── Session Queue ───

export const getQueue = () => executeTool('jules_get_queue');
export const clearQueue = () => executeTool('jules_clear_queue');
export const processQueue = () => executeTool('jules_process_queue');

// ─── Cache ───

export const getCacheStats = () => executeTool('jules_cache_stats');
export const clearCache = () => executeTool('jules_clear_cache');

export { getBaseUrl, DEFAULT_BASE };
