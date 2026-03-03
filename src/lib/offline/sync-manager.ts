// src/lib/offline/sync-manager.ts

interface QueuedAction {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    body: any;
    timestamp: number;
    retryCount: number;
}

const STORAGE_KEY = 'offline_sync_queue';

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

    addToQueue: (url: string, method: 'POST' | 'PUT' | 'PATCH', body: any) => {
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        return action;
    },

    removeFromQueue: (id: string) => {
        const queue = offlineSyncManager.getQueue();
        const newQueue = queue.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
    },

    processQueue: async (concurrencyLimit = 5) => {
        if (typeof navigator === 'undefined' || !navigator.onLine) return;

        const initialQueue = offlineSyncManager.getQueue();
        if (initialQueue.length === 0) return;

        console.log(`[OfflineSync] Processing ${initialQueue.length} items with concurrency ${concurrencyLimit}...`);

        const processedIds = new Set<string>();

        // Process in batches to limit concurrency while maintaining relative order
        for (let i = 0; i < initialQueue.length; i += concurrencyLimit) {
            const batch = initialQueue.slice(i, i + concurrencyLimit);

            await Promise.all(batch.map(async (action) => {
                try {
                    const fullUrl = action.url.startsWith('/')
                        ? `${window.location.origin}${action.url}`
                        : action.url;

                    const res = await fetch(fullUrl, {
                        method: action.method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(action.body)
                    });

                    if (res.ok || res.status === 409) {
                        console.log(`[OfflineSync] Synced item ${action.id}`);
                        processedIds.add(action.id);
                    } else {
                        console.error(`[OfflineSync] Failed to sync item ${action.id}: ${res.status}`);
                        // If 4xx (client error), it's likely invalid and retrying won't help, unless it's 429
                        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                            processedIds.add(action.id);
                        }
                    }
                } catch (error) {
                    console.error(`[OfflineSync] Network error for item ${action.id}`, error);
                    // Keep in queue for retry later
                }
            }));

            // Sync with current localStorage state in case other processes added items
            const latestQueue = offlineSyncManager.getQueue();
            const updatedQueue = latestQueue.filter(item => !processedIds.has(item.id));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
        }
    }
};
