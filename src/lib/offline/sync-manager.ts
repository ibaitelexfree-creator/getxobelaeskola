// src/lib/offline/sync-manager.ts

export interface QueuedAction {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    body: unknown;
    timestamp: number;
    retryCount: number;
}

const STORAGE_KEY = 'offline_sync_queue';
const CONCURRENCY_LIMIT = 4;

export const offlineSyncManager = {
    getQueue: (): QueuedAction[] => {
        if (typeof window === 'undefined') return [];
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : [];
        } catch (e) {
            console.error('Error reading offline queue', e);
            return [];
        }
    },

    saveQueue: (queue: QueuedAction[]) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error('Error saving offline queue', e);
        }
    },

    addToQueue: (url: string, method: 'POST' | 'PUT' | 'PATCH', body: unknown) => {
        const queue = offlineSyncManager.getQueue();
        const action: QueuedAction = {
            id: crypto.randomUUID(),
            url,
            method,
            body,
            timestamp: Date.now(),
            retryCount: 0
        };
        queue.push(action);
        offlineSyncManager.saveQueue(queue);
        return action;
    },

    removeFromQueue: (id: string) => {
        const queue = offlineSyncManager.getQueue();
        const newQueue = queue.filter(item => item.id !== id);
        offlineSyncManager.saveQueue(newQueue);
    },

    processQueue: async () => {
        if (typeof navigator === 'undefined' || !navigator.onLine) return;
        const queue = offlineSyncManager.getQueue();
        if (queue.length === 0) return;

        console.log(`[OfflineSync] Processing ${queue.length} items with concurrency limit ${CONCURRENCY_LIMIT}...`);

        const processedIds = new Set<string>();
        const activePromises = new Set<Promise<void>>();
        let networkErrorOccurred = false;

        for (const action of queue) {
            if (networkErrorOccurred) break;

            // Limit concurrency
            if (activePromises.size >= CONCURRENCY_LIMIT) {
                await Promise.race(activePromises);
            }

            // Capture the current value of networkErrorOccurred in the closure
            const processItem = async (item: QueuedAction) => {
                if (networkErrorOccurred) return;

                try {
                    const fullUrl = item.url.startsWith('/')
                        ? `${window.location.origin}${item.url}`
                        : item.url;

                    const res = await fetch(fullUrl, {
                        method: item.method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(item.body)
                    });

                    if (res.ok || res.status === 409) {
                        console.log(`[OfflineSync] Synced item ${item.id}`);
                        processedIds.add(item.id);
                    } else {
                        console.error(`[OfflineSync] Failed to sync item ${item.id}: ${res.status}`);
                        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                            processedIds.add(item.id);
                        }
                    }
                } catch (error) {
                    console.error(`[OfflineSync] Network error for item ${item.id}`, error);
                    networkErrorOccurred = true;
                }
            };

            const p = processItem(action).finally(() => activePromises.delete(p));
            activePromises.add(p);
        }

        // Wait for remaining items
        await Promise.all(activePromises);

        // Final update to localStorage
        if (processedIds.size > 0) {
            const currentQueue = offlineSyncManager.getQueue();
            const newQueue = currentQueue.filter(item => !processedIds.has(item.id));
            offlineSyncManager.saveQueue(newQueue);
        }
    }
};
