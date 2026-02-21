import { create } from 'zustand';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type ServiceHealth = 'online' | 'offline' | 'degraded' | 'unknown';
export type Tab = 'dashboard' | 'tasks' | 'queue' | 'control' | 'visual' | 'settings';

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
        browserless: { health: ServiceHealth; used?: number; total?: number };
        thermal: { label: string; level: number };
        watchdog: { state: string; loops: number; stalls: number; crashes: number };
    };
    power: {
        mode: 'eco' | 'performance';
        lastActivity: string;
        services: Record<string, { name: string; running: boolean; type: string; used?: number; limit?: number }>;
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
        executor: 'jules' | 'flash' | 'clawdbot' | 'antigravity';
        status: 'completed' | 'failed' | 'queued' | 'running';
        latencyMs?: number;
        timestamp: number;
        layer?: 1 | 2 | 3;
    }>;

    // Active Threads (Radar Contacts)
    activeThreads: Array<{
        id: string;
        label: string;
        executor: 'jules' | 'flash' | 'clawdbot' | 'antigravity';
        layer: 1 | 2 | 3;
        progress: number;
        status: string;
    }>;

    // Navigation
    activeTab: Tab;
    taskDraft: string;

    // Live View
    livePreviewUrl: string;
    livePreviewPassword: string;

    // Settings
    autoRefreshMs: number;

    // Actions
    setServerUrl: (url: string) => void;
    setConnected: (connected: boolean) => void;
    updateServices: (services: Partial<MissionState['services']>) => void;
    updateStats: (stats: Partial<MissionState['stats']>) => void;
    setQueue: (queue: MissionState['queue']) => void;
    setHistory: (history: MissionState['history']) => void;
    setPendingApproval: (approval: MissionState['pendingApproval']) => void;
    setLivePreviewUrl: (url: string) => void;
    setLivePreviewPassword: (password: string) => void;
    addToHistory: (entry: MissionState['history'][0]) => void;
    setActiveTab: (tab: Tab) => void;
    updateActiveThreads: (threads: MissionState['activeThreads']) => void;
    setAutoRefresh: (ms: number) => void;
    setLastSync: (ts: number) => void;
    updatePower: (power: Partial<MissionState['power']>) => void;
    setTaskDraft: (draft: string) => void;
}

const STORAGE_KEY = 'mc_server_url';
const LIVE_URL_KEY = 'mc_live_preview_url';

export const useMissionStore = create<MissionState>((set, get) => ({
    // Initial state
    serverUrl: typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY) || 'http://localhost:3323'
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
    power: {
        mode: 'eco',
        lastActivity: '',
        services: {},
    },


    stats: { assigned: 0, completed: 0, failed: 0 },
    queue: [],
    pendingApproval: null,
    history: [],
    activeThreads: [],
    activeTab: 'dashboard',
    taskDraft: '',
    livePreviewUrl: typeof window !== 'undefined'
        ? localStorage.getItem(LIVE_URL_KEY) || ''
        : '',
    livePreviewPassword: '',
    autoRefreshMs: 10_000,

    // Actions
    setServerUrl: (url) => {
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, url);
        set({ serverUrl: url });
    },
    setConnected: (connected) => set({ connected }),
    updateServices: (partial) =>
        set((state) => ({ services: { ...state.services, ...partial } })),
    updateStats: (partial) =>
        set((state) => ({ stats: { ...state.stats, ...partial } })),
    setQueue: (queue) => set({ queue }),
    setHistory: (history) => set({ history }),
    setPendingApproval: (pendingApproval) => {
        const current = get().pendingApproval;
        if (pendingApproval && !current) {
            Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { });
            setTimeout(() => {
                Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { });
            }, 200);
        }
        set({ pendingApproval });
    },
    setLivePreviewUrl: (url) => {
        if (typeof window !== 'undefined') localStorage.setItem(LIVE_URL_KEY, url);
        set({ livePreviewUrl: url });
    },
    setLivePreviewPassword: (livePreviewPassword) => set({ livePreviewPassword }),
    addToHistory: (entry) =>
        set((state) => ({ history: [entry, ...state.history].slice(0, 100) })),
    setActiveTab: (activeTab) => set({ activeTab }),
    updateActiveThreads: (activeThreads) => set({ activeThreads }),
    setAutoRefresh: (autoRefreshMs) => set({ autoRefreshMs }),
    setLastSync: (lastSync) => set({ lastSync }),
    updatePower: (partial) => set((state) => ({ power: { ...state.power, ...partial } })),
    setTaskDraft: (taskDraft) => set({ taskDraft }),
}));
