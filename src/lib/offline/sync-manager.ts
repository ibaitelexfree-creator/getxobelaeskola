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

/**
 * Manages the offline synchronization queue.
 * Optimized for performance with batched storage updates and concurrency-limited processing.
 */
export const offlineSyncManager = {
    /**
     * Retrieves the current queue from localStorage.
     */
    getQueue: (): QueuedAction[] => {
        if (typeof window === 'undefined') return [];
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : [];
        } catch (e) {
            console.error('[OfflineSync] Error reading queue', e);
            return [];
        }
    },

    /**
     * Persists the queue to localStorage.
     */
    saveQueue: (queue: QueuedAction[]) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.error('[OfflineSync] Error saving queue', e);
        }
    },

    /**
     * Adds a new action to the synchronization queue.
     */
    addToQueue: (url: string, method: 'POST' | 'PUT' | 'PATCH', body: unknown): QueuedAction => {
        const queue = offlineSyncManager.getQueue();

        // Robust UUID generation for browser environments
        let id: string;
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        }

        const action: QueuedAction = {
            id,
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

    /**
     * Removes a specific item from the queue by ID.
     */
    removeFromQueue: (id: string) => {
        const queue = offlineSyncManager.getQueue();
        const newQueue = queue.filter(item => item.id !== id);
        offlineSyncManager.saveQueue(newQueue);
    },

    /**
     * Processes the pending queue items when online.
     * Implements concurrency limits and batched updates for optimal performance.
     */
    processQueue: async () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.onLine) return;

        const queue = offlineSyncManager.getQueue();
        if (queue.length === 0) return;

        console.log(`[OfflineSync] Processing ${queue.length} items with concurrency limit ${CONCURRENCY_LIMIT}...`);

        const processedIds = new Set<string>();
        const activePromises = new Set<Promise<void>>();
        let networkErrorOccurred = false;

        for (const action of queue) {
            if (networkErrorOccurred) break;

            // Maintain concurrency limit
            if (activePromises.size >= CONCURRENCY_LIMIT) {
                await Promise.race(activePromises);
                if (networkErrorOccurred) break;
            }

            const processItem = async (item: QueuedAction) => {
                if (networkErrorOccurred) return;

                try {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const fullUrl = item.url.startsWith('/')
                        ? `${origin}${item.url}`
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
                        // For 4xx errors (except 429), the request is likely invalid and shouldn't be retried
                        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                            processedIds.add(item.id);
                        }
                    }
                } catch (error) {
                    console.error(`[OfflineSync] Network error for item ${item.id}:`, error);
                    networkErrorOccurred = true;
                }
            };

            const promise = processItem(action).finally(() => activePromises.delete(promise));
            activePromises.add(promise);
        }

        // Wait for any remaining in-flight requests
        await Promise.all(activePromises);

        // Batch update localStorage at the end to minimize I/O
        if (processedIds.size > 0) {
            const currentQueue = offlineSyncManager.getQueue();
            const filteredQueue = currentQueue.filter(item => !processedIds.has(item.id));
            offlineSyncManager.saveQueue(filteredQueue);
        }
    }
};
