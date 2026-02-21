'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { getHealth, getWatchdogStatus, getActiveSessions, getResourceStatus } from '@/lib/api';


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
    } = useMissionStore();


    const poll = useCallback(async () => {
        try {
            const [health, watchdog, sessions, resources] = await Promise.all([
                getHealth().catch(() => null),
                getWatchdogStatus().catch(() => null),
                getActiveSessions().catch(() => null),
                getResourceStatus().catch(() => null),
            ]);


            if (health) {
                setConnected(true);
                setLastSync(Date.now());

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
                    clawdbot: {
                        health: svc.clawdbot !== 'error' ? 'online' : 'offline',
                        delegations: 0,
                    },
                    browserless: {
                        health: svc.browserless !== 'error' ? 'online' : 'offline',
                    },
                });
            } else {
                setConnected(false);
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
            }

        } catch {
            setConnected(false);
        }
    }, [setConnected, updateServices, setLastSync]);

    useEffect(() => {
        poll(); // Initial fetch
        intervalRef.current = setInterval(poll, autoRefreshMs);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [poll, autoRefreshMs]);

    return { refresh: poll };
}
