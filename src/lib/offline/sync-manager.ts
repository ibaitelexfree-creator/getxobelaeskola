// src/lib/offline/sync-manager.ts

interface QueuedAction {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    body: unknown;
    timestamp: number;
    retryCount: number;
}

const STORAGE_KEY = 'offline_sync_queue';
let isProcessing = false;

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        return action;
    },

    removeFromQueue: (id: string) => {
        const queue = offlineSyncManager.getQueue();
        const newQueue = queue.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
    },

    processQueue: async () => {
        if (typeof navigator === 'undefined' || !navigator.onLine || isProcessing) return;

        const queue = offlineSyncManager.getQueue();
        if (queue.length === 0) return;

        isProcessing = true;
        console.log(`[OfflineSync] Processing ${queue.length} items...`);

        // Group actions by their resource path to ensure sequential processing for related items.
        // We group by the first two segments of the path (e.g., /api/orders) to catch dependencies
        // between collection and member endpoints.
        const getResourceGroup = (url: string) => {
            const path = url.split('?')[0];
            const segments = path.startsWith('/')
                ? path.split('/').filter(Boolean)
                : path.split('//').pop()?.split('/').filter(Boolean) || [];

            if (segments.length >= 2) {
                return `/${segments[0]}/${segments[1]}`;
            }
            return path;
        };

        const groups: Record<string, QueuedAction[]> = {};
        for (const action of queue) {
            const groupKey = getResourceGroup(action.url);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(action);
        }

        const successfulIds = new Set<string>();
        const failedIds = new Set<string>();

        // Process each group in parallel
        const groupPromises = Object.values(groups).map(async (group) => {
            // Process items within a group sequentially to maintain dependency order
            for (const action of group) {
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
                        successfulIds.add(action.id);
                    } else {
                        console.error(`[OfflineSync] Failed to sync item ${action.id}: ${res.status}`);
                        // If 4xx (client error), it's likely invalid and retrying won't help
                        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                            failedIds.add(action.id);
                        } else {
                            // Stop processing this group if it's a server error or rate limit
                            // Subsequent items in this group might depend on this one.
                            break;
                        }
                    }
                } catch (error) {
                    console.error(`[OfflineSync] Network error for item ${action.id}`, error);
                    // Stop processing this group on network error
                    break;
                }
            }
        });

        await Promise.all(groupPromises);

        // Update the queue in one go to avoid O(N^2) overhead with removeFromQueue calls in a loop
        const currentQueue = offlineSyncManager.getQueue();
        const finalQueue = currentQueue.filter(
            item => !successfulIds.has(item.id) && !failedIds.has(item.id)
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalQueue));

        isProcessing = false;
    }
};
