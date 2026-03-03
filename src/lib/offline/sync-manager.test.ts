import { describe, it, expect, vi, beforeEach } from 'vitest';
import { offlineSyncManager } from './sync-manager';

describe('offlineSyncManager', () => {
    const STORAGE_KEY = 'offline_sync_queue';

    beforeEach(() => {
        vi.resetAllMocks();

        // Mock localStorage
        let store: Record<string, string> = {};
        global.localStorage = {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
            removeItem: vi.fn((key) => { delete store[key]; }),
            clear: vi.fn(() => { store = {}; }),
            length: 0,
            key: vi.fn()
        } as unknown as Storage;

        // Mock navigator
        global.navigator = {
            onLine: true
        } as unknown as Navigator;

        // Mock fetch
        global.fetch = vi.fn();

        // Mock window.location
        global.window = {
            location: { origin: 'http://localhost' }
        } as unknown as Window & typeof globalThis;
    });

    it('processes items concurrently and removes them from queue on success', async () => {
        const queue = [
            { id: '1', url: '/api/1', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '2', url: '/api/2', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '3', url: '/api/3', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });

        await offlineSyncManager.processQueue();

        expect(global.fetch).toHaveBeenCalledTimes(3);
        expect(offlineSyncManager.getQueue()).toEqual([]);
    });

    it('keeps items in queue on network error and stops processing further', async () => {
        const queue = [
            { id: '1', url: '/api/1', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '2', url: '/api/2', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        await offlineSyncManager.processQueue();

        // One item failed, the rest might not even be attempted or might be in flight
        // But the failed one and subsequent ones should remain in the queue
        const remainingQueue = offlineSyncManager.getQueue();
        expect(remainingQueue.length).toBe(2);
    });

    it('removes items on client errors (4xx) but keeps on server errors (5xx)', async () => {
        const queue = [
            { id: '400', url: '/api/400', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '500', url: '/api/500', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        (global.fetch as any)
            .mockResolvedValueOnce({ ok: false, status: 400 })
            .mockResolvedValueOnce({ ok: false, status: 500 });

        await offlineSyncManager.processQueue();

        const remainingQueue = offlineSyncManager.getQueue();
        expect(remainingQueue.length).toBe(1);
        expect(remainingQueue[0].id).toBe('500');
    });

    it('handles 409 conflict as success', async () => {
        const queue = [{ id: '409', url: '/api/409', method: 'POST' as const, body: {}, timestamp: Date.now(), retryCount: 0 }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

        (global.fetch as any).mockResolvedValue({ ok: false, status: 409 });

        await offlineSyncManager.processQueue();

        expect(offlineSyncManager.getQueue()).toEqual([]);
    });
});
