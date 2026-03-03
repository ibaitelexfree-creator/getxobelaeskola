import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { offlineSyncManager } from './sync-manager';

const STORAGE_KEY = 'offline_sync_queue';

describe('offlineSyncManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock fetch
        global.fetch = vi.fn();

        // Ensure navigator.onLine is true by default
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            get: () => true,
        });

        // Mock window.location.origin
        if (typeof window !== 'undefined') {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'http://localhost'
                },
                writable: true,
                configurable: true
            });
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getQueue', () => {
        it('should return an empty array if localStorage is empty', () => {
            expect(offlineSyncManager.getQueue()).toEqual([]);
        });

        it('should return the queue from localStorage', () => {
            const queue = [{ id: '1', url: '/api', method: 'POST', body: {}, timestamp: Date.now(), retryCount: 0 }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
            expect(offlineSyncManager.getQueue()).toEqual(queue);
        });

        it('should return an empty array if JSON parsing fails', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid-json');
            expect(offlineSyncManager.getQueue()).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('should return empty array when window is undefined', () => {
            const originalWindow = global.window;
            // @ts-ignore
            delete global.window;

            expect(offlineSyncManager.getQueue()).toEqual([]);

            global.window = originalWindow;
        });
    });

    describe('addToQueue', () => {
        it('should add an item to the queue and save to localStorage', () => {
            const url = '/api/test';
            const method = 'POST';
            const body = { data: 'test' };

            const action = offlineSyncManager.addToQueue(url, method, body);

            expect(action.url).toBe(url);
            expect(action.method).toBe(method);
            expect(action.body).toEqual(body);
            expect(action.id).toBeDefined();

            const queue = offlineSyncManager.getQueue();
            expect(queue).toHaveLength(1);
            expect(queue[0]).toEqual(action);

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            expect(stored).toHaveLength(1);
            expect(stored[0].id).toBe(action.id);
        });
    });

    describe('removeFromQueue', () => {
        it('should remove an item from the queue by id', () => {
            const action1 = offlineSyncManager.addToQueue('/url1', 'POST', {});
            const action2 = offlineSyncManager.addToQueue('/url2', 'POST', {});

            expect(offlineSyncManager.getQueue()).toHaveLength(2);

            offlineSyncManager.removeFromQueue(action1.id);

            const queue = offlineSyncManager.getQueue();
            expect(queue).toHaveLength(1);
            expect(queue[0].id).toBe(action2.id);
        });
    });

    describe('processQueue', () => {
        it('should not process if navigator is offline', async () => {
            Object.defineProperty(navigator, 'onLine', {
                configurable: true,
                get: () => false,
            });
            offlineSyncManager.addToQueue('/api/test', 'POST', {});

            await offlineSyncManager.processQueue();

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should not process if queue is empty', async () => {
            await offlineSyncManager.processQueue();
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should process items and remove them if sync is successful', async () => {
            const action = offlineSyncManager.addToQueue('/api/test', 'POST', { foo: 'bar' });
            (global.fetch as any).mockResolvedValue({ ok: true });

            await offlineSyncManager.processQueue();

            expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/test', expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ foo: 'bar' })
            }));
            expect(offlineSyncManager.getQueue()).toHaveLength(0);
        });

        it('should remove item from queue if response is 409 conflict', async () => {
            offlineSyncManager.addToQueue('/api/test', 'POST', {});
            (global.fetch as any).mockResolvedValue({ ok: false, status: 409 });

            await offlineSyncManager.processQueue();

            expect(offlineSyncManager.getQueue()).toHaveLength(0);
        });

        it('should remove item from queue if response is 400 (client error)', async () => {
            offlineSyncManager.addToQueue('/api/test', 'POST', {});
            (global.fetch as any).mockResolvedValue({ ok: false, status: 400 });

            await offlineSyncManager.processQueue();

            expect(offlineSyncManager.getQueue()).toHaveLength(0);
        });

        it('should NOT remove item from queue if response is 429 (Too Many Requests)', async () => {
            offlineSyncManager.addToQueue('/api/test', 'POST', {});
            (global.fetch as any).mockResolvedValue({ ok: false, status: 429 });

            await offlineSyncManager.processQueue();

            expect(offlineSyncManager.getQueue()).toHaveLength(1);
        });

        it('should NOT remove item from queue if response is 500 (Server Error)', async () => {
            offlineSyncManager.addToQueue('/api/test', 'POST', {});
            (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

            await offlineSyncManager.processQueue();

            expect(offlineSyncManager.getQueue()).toHaveLength(1);
        });

        it('should NOT remove item from queue if network error occurs', async () => {
            offlineSyncManager.addToQueue('/api/test', 'POST', {});
            (global.fetch as any).mockRejectedValue(new Error('Network failure'));

            await offlineSyncManager.processQueue();

            expect(offlineSyncManager.getQueue()).toHaveLength(1);
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle full URLs and relative URLs', async () => {
            offlineSyncManager.addToQueue('/relative', 'POST', {});
            offlineSyncManager.addToQueue('http://external.com/api', 'POST', {});

            (global.fetch as any).mockResolvedValue({ ok: true });

            await offlineSyncManager.processQueue();

            expect(global.fetch).toHaveBeenCalledWith('http://localhost/relative', expect.anything());
            expect(global.fetch).toHaveBeenCalledWith('http://external.com/api', expect.anything());
        });
    });
});
