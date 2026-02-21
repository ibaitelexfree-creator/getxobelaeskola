const DEFAULT_BASE = 'http://localhost:3323';

function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('mc_server_url') || DEFAULT_BASE;
    }
    return DEFAULT_BASE;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
    const opts: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`API ${method} ${path}: ${res.status} — ${text}`);
    }
    return res.json();
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
