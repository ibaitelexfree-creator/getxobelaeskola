import { create } from 'zustand';

export type ServiceHealth = 'online' | 'offline' | 'degraded' | 'unknown';
export type Tab = 'dashboard' | 'tasks' | 'queue' | 'control';

interface MissionState {
    // Connection
    serverUrl: string;
    connected: boolean;
    lastSync: number | null;

    // Service Health
    services: {
        jules: { health: ServiceHealth; used: number; total: number; active: number };
        flash: { health: ServiceHealth; tasksToday: number; tokensUsed: number };
        clawdbot: { health: ServiceHealth; delegations: number };
        browserless: { health: ServiceHealth };
        thermal: { label: string; level: number };
        watchdog: { state: string; loops: number; stalls: number; crashes: number };
    };

    // Stats
    stats: { assigned: number; completed: number; failed: number };

    // Queue & Approvals
    queue: Array<{ title: string; createdAt: number; position: number }>;
    pendingApproval: { task: string; reason: string } | null;

    // Task History
    history: Array<{
        id: string;
        title: string;
        executor: 'jules' | 'flash' | 'clawdbot';
        status: 'completed' | 'failed' | 'queued' | 'running';
        latencyMs?: number;
        timestamp: number;
    }>;

    // Navigation
    activeTab: Tab;

    // Settings
    autoRefreshMs: number;

    // Actions
    setServerUrl: (url: string) => void;
    setConnected: (connected: boolean) => void;
    updateServices: (services: Partial<MissionState['services']>) => void;
    updateStats: (stats: Partial<MissionState['stats']>) => void;
    setQueue: (queue: MissionState['queue']) => void;
    setPendingApproval: (approval: MissionState['pendingApproval']) => void;
    addToHistory: (entry: MissionState['history'][0]) => void;
    setActiveTab: (tab: Tab) => void;
    setAutoRefresh: (ms: number) => void;
    setLastSync: (ts: number) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
    // Initial state
    serverUrl: typeof window !== 'undefined'
        ? localStorage.getItem('mc_server_url') || 'http://localhost:3323'
        : 'http://localhost:3323',
    connected: false,
    lastSync: null,

    services: {
        jules: { health: 'unknown', used: 0, total: 300, active: 0 },
        flash: { health: 'unknown', tasksToday: 0, tokensUsed: 0 },
        clawdbot: { health: 'unknown', delegations: 0 },
        browserless: { health: 'unknown' },
        thermal: { label: 'Unknown', level: 0 },
        watchdog: { state: 'UNKNOWN', loops: 0, stalls: 0, crashes: 0 },
    },

    stats: { assigned: 0, completed: 0, failed: 0 },
    queue: [],
    pendingApproval: null,
    history: [],
    activeTab: 'dashboard',
    autoRefreshMs: 10_000,

    // Actions
    setServerUrl: (url) => {
        if (typeof window !== 'undefined') localStorage.setItem('mc_server_url', url);
        set({ serverUrl: url });
    },
    setConnected: (connected) => set({ connected }),
    updateServices: (partial) =>
        set((state) => ({ services: { ...state.services, ...partial } })),
    updateStats: (partial) =>
        set((state) => ({ stats: { ...state.stats, ...partial } })),
    setQueue: (queue) => set({ queue }),
    setPendingApproval: (pendingApproval) => set({ pendingApproval }),
    addToHistory: (entry) =>
        set((state) => ({ history: [entry, ...state.history].slice(0, 100) })),
    setActiveTab: (activeTab) => set({ activeTab }),
    setAutoRefresh: (autoRefreshMs) => set({ autoRefreshMs }),
    setLastSync: (lastSync) => set({ lastSync }),
}));
