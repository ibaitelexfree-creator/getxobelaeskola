'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { getHealth, getWatchdogStatus, getActiveSessions, getResourceStatus, getQueue, getLivePreviewConfig, getJulesBlockedStatus, getSyncHistory, getPreviews } from '@/lib/api';


export function usePolling() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const {
        autoRefreshMs,
        setConnected,
        updateServices,
        updateStats,
        setLastSync,
        updateActiveThreads,
        updatePower,
        setLivePreviewUrl,
        livePreviewUrl,
        updateJulesWaiting,
        setSyncHistory
    } = useMissionStore();


    const poll = useCallback(async () => {
        try {
            const [health, watchdog, sessions, resources, queueData, liveConfig, julesBlocked, syncData] = await Promise.all([
                getHealth().catch(() => null),
                getWatchdogStatus().catch(() => null),
                getActiveSessions().catch(() => null),
                getResourceStatus().catch(() => null),
                getQueue().catch(() => null),
                getLivePreviewConfig().catch(() => null),
                getJulesBlockedStatus().catch(() => null),
                getSyncHistory(1).catch(() => null),
            ]);


            if (health) {
                setConnected(true);
                setLastSync(Date.now());

                if (julesBlocked) {
                    updateJulesWaiting(julesBlocked.blocked, julesBlocked.sessions || []);
                }

                const svc = health.services || {};
                updateServices({
                    jules: {
                        health: svc.julesApi === 'configured' ? 'online' : 'offline',
                        used: 0,
                        total: 300,
                        active: 0,
                    },
                    flash: {
                        health: svc.geminiFlash !== 'error' ? 'online' : 'offline',
                        tasksToday: 0,
                        tokensUsed: 0,
                    },
                    clawdebot: {
                        health: svc.clawdebot !== 'error' ? 'online' : 'offline',
                        delegations: 0,
                    },
                    browserless: {
                        health: svc.browserless !== 'error' ? (resources?.services?.BROWSERLESS?.running ? 'online' : 'offline') : 'offline',
                        used: resources?.services?.BROWSERLESS?.used || 0,
                        total: resources?.services?.BROWSERLESS?.limit || 0,
                    },
                    orchestrator: {
                        health: svc.orchestrator === 'online' ? 'online' : 'offline',
                    },
                });
            } else {
                setConnected(false);
            }

            if (liveConfig?.url && (liveConfig.url !== livePreviewUrl || liveConfig.password !== useMissionStore.getState().livePreviewPassword)) {
                setLivePreviewUrl(liveConfig.url);
                if (liveConfig.password) useMissionStore.getState().setLivePreviewPassword(liveConfig.password);
            }

            if (watchdog) {
                updateServices({
                    watchdog: {
                        state: watchdog.state,
                        loops: watchdog.stats.loopsDetected,
                        stalls: watchdog.stats.stallsDetected,
                        crashes: watchdog.stats.crashesRecovered,
                    },
                });
            }

            if (queueData?.success && queueData.result) {
                const { queue, history } = queueData.result as any;
                if (queue) useMissionStore.getState().setQueue(queue);
                if (history) {
                    useMissionStore.getState().setHistory(history);

                    // Calculate stats
                    const assigned = (queue || []).length + (history || []).filter((h: any) => h.status === 'running' || h.status === 'queued').length;
                    const completed = (history || []).filter((h: any) => h.status === 'completed').length;
                    const failed = (history || []).filter((h: any) => h.status === 'failed').length;

                    updateStats({ assigned, completed, failed });
                }
            }

            if (sessions?.activeSessions) {
                const threads = sessions.activeSessions.map((s: any) => {
                    const executor = s.executor || (s.title?.toLowerCase().includes('flash') ? 'flash' : 'jules');
                    const layer = (executor === 'jules' ? 1 : (executor === 'flash' ? 2 : 3)) as 1 | 2 | 3;
                    return {
                        id: s.id,
                        label: s.title || 'Untitled Task',
                        executor: executor,
                        layer: layer,
                        progress: s.progress || 0,
                        status: s.state,
                    };
                });

                // Add Antigravity if it's active in watchdog
                if (watchdog && watchdog.state === 'ACTIVE') {
                    threads.push({
                        id: 'antigravity-core',
                        label: 'Antigravity Main Loop',
                        executor: 'antigravity',
                        layer: 1,
                        progress: 100,
                        status: 'RUNNING',
                    });
                }

                updateActiveThreads(threads);
            }

            if (resources) {
                updatePower({
                    mode: resources.powerMode,
                    lastActivity: resources.lastActivity,
                    services: resources.services,
                });
                if (resources.hardware) {
                    useMissionStore.getState().updateHardware(resources.hardware);
                }
            }

            if (syncData) {
                setSyncHistory(syncData);
            }

        } catch {
            setConnected(false);
        }
    }, [setConnected, updateServices, setLastSync, updateActiveThreads, updatePower]);

    useEffect(() => {
        poll(); // Initial fetch
        intervalRef.current = setInterval(poll, autoRefreshMs);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [poll, autoRefreshMs]);

    return { refresh: poll };
}
