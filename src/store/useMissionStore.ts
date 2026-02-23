import { create } from 'zustand';

// Haptics stub for root app
const Haptics = {
    impact: async (options: any) => { console.log('Haptics stub', options); }
};
const ImpactStyle = { Heavy: 'HEAVY' };

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
        orchestrator: { health: ServiceHealth };
    };
    hardware: {
        cpu: { load: number; temp: number };
        gpu: { temp: number; hotspot: number; name: string };
    };
    power: {
        mode: 'eco' | 'performance';
        lastActivity: string;
        services: Record<string, {
            name: string;
            running: boolean;
            type: string;
            used?: number;
            limit?: number;
            url?: string;
            description?: string;
        }>;
    };

    // Stats
    stats: { assigned: number; completed: number; failed: number };

    // Queue & Approvals
    queue: Array<{ id: string; title: string; createdAt: number; position: number; status: string; requiresApproval?: boolean }>;
    pendingApproval: { id: string; task: string; reason: string } | null;

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
    syncHistory: Array<{
        id: number;
        service_id: string;
        status: string;
        metric_value: number;
        metric_label: string;
        timestamp: string;
    }>;

    // Navigation
    activeTab: Tab;
    taskDraft: string;

    // Live View
    livePreviewUrl: string;
    livePreviewPassword: string;

    // Jules Status
    julesWaiting: boolean;
    waitingTasks: Array<{ id: string; title: string; url: string; state: string }>;

    // Preview Environment
    previewMode: 'render' | 'local';
    latestPreviews: Array<{ branch: string; url: string; timestamp: number }>;

    // Settings
    autoRefreshMs: number;

    // Actions
    setServerUrl: (url: string) => void;
    setConnected: (connected: boolean) => void;
    updateServices: (services: Partial<MissionState['services']>) => void;
    updateHardware: (hardware: Partial<HardwareState>) => void;
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
    updateJulesWaiting: (waiting: boolean, tasks: MissionState['waitingTasks']) => void;
    setSyncHistory: (history: MissionState['syncHistory']) => void;
    setPreviewMode: (mode: 'render' | 'local') => void;
    setLatestPreviews: (previews: MissionState['latestPreviews']) => void;

    // Task Operations
    updateTask: (id: string, updates: Partial<MissionState['queue'][0]>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    approveTask: (id: string) => Promise<void>;
}

interface HardwareState {
    cpu: { load: number; temp: number };
    gpu: { temp: number; hotspot: number; name: string };
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
        orchestrator: { health: 'unknown' },
    },
    hardware: {
        cpu: { load: 0, temp: 0 },
        gpu: { temp: 0, hotspot: 0, name: 'NVIDIA GPU' },
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
    julesWaiting: false,
    waitingTasks: [],
    syncHistory: [],
    previewMode: (typeof window !== 'undefined' ? (localStorage.getItem('mc_preview_mode') as 'render' | 'local') : 'render') || 'render',
    latestPreviews: [],

    // Actions
    setServerUrl: (url) => {
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, url);
        set({ serverUrl: url });
    },
    setConnected: (connected) => set({ connected }),
    updateServices: (partial: Partial<MissionState['services']>) =>
        set((state) => ({ services: { ...state.services, ...partial } })),
    updateHardware: (partial: Partial<HardwareState>) =>
        set((state) => ({ hardware: { ...state.hardware, ...partial } })),
    updateStats: (partial: Partial<MissionState['stats']>) =>
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
    updateJulesWaiting: (julesWaiting, waitingTasks) => set({ julesWaiting, waitingTasks }),
    setSyncHistory: (syncHistory) => set({ syncHistory }),
    setPreviewMode: (previewMode) => {
        if (typeof window !== 'undefined') localStorage.setItem('mc_preview_mode', previewMode);
        set({ previewMode });
    },
    setLatestPreviews: (latestPreviews) => set({ latestPreviews }),

    // Task Operations
    updateTask: async (id, updates) => {
        const { serverUrl } = get();
        try {
            const res = await fetch(`${serverUrl}/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                set(state => ({
                    queue: state.queue.map(t => t.id === id ? { ...t, ...updates } : t)
                }));
            }
        } catch (e) {
            console.error('Failed to update task:', e);
        }
    },

    deleteTask: async (id) => {
        const { serverUrl } = get();
        try {
            const res = await fetch(`${serverUrl}/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                set(state => ({
                    queue: state.queue.filter(t => t.id !== id),
                    stats: { ...state.stats, assigned: Math.max(0, state.stats.assigned - 1) }
                }));
            }
        } catch (e) {
            console.error('Failed to delete task:', e);
        }
    },

    approveTask: async (id) => {
        const { serverUrl } = get();
        try {
            const res = await fetch(`${serverUrl}/api/tasks/${id}/approve`, { method: 'POST' });
            if (res.ok) {
                set(state => ({
                    queue: state.queue.map(t => t.id === id ? { ...t, status: 'pending', requiresApproval: false } : t)
                }));
            }
        } catch (e) {
            console.error('Failed to approve task:', e);
        }
    },
}));
