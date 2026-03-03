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

    processQueue: async () => {
        if (typeof navigator === 'undefined' || !navigator.onLine) return;
        const queue = offlineSyncManager.getQueue();
        if (queue.length === 0) return;

        console.log(`[OfflineSync] Processing ${queue.length} items...`);

        for (const action of queue) {
            try {
                // Determine the full URL. If it starts with /, use window.location.origin
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

                if (res.ok || res.status === 409) { // 409 conflict might mean already done
                    console.log(`[OfflineSync] Synced item ${action.id}`);
                    offlineSyncManager.removeFromQueue(action.id);
                } else {
                    console.error(`[OfflineSync] Failed to sync item ${action.id}: ${res.status}`);
                    // If 4xx (client error), it's likely invalid and retrying won't help, unless it's 429 (Too Many Requests)
                    if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                        offlineSyncManager.removeFromQueue(action.id);
                    }
                }
            } catch (error) {
                console.error(`[OfflineSync] Network error for item ${action.id}`, error);
                // Keep in queue for retry later
            }
        }
    }
};
