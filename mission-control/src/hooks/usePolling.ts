'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMissionStore } from '@/store/useMissionStore';
import { getHealth, getWatchdogStatus } from '@/lib/api';

export function usePolling() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const {
        autoRefreshMs,
        setConnected,
        updateServices,
        updateStats,
        setLastSync,
    } = useMissionStore();

    const poll = useCallback(async () => {
        try {
            const [health, watchdog] = await Promise.all([
                getHealth().catch(() => null),
                getWatchdogStatus().catch(() => null),
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
