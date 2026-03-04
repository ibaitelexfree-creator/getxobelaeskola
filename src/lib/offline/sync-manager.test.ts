import { describe, it, expect, vi, beforeEach } from 'vitest';
import { offlineSyncManager } from './sync-manager';

describe('offlineSyncManager', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        // Mock window.location.origin
        global.window = {
            location: {
                origin: 'http://localhost:3000'
            }
        } as any;

        // Mock navigator.onLine
        global.navigator = {
            onLine: true
        } as any;

        // Mock fetch
        global.fetch = vi.fn();
    });

    it('processes items concurrently for different resource groups', async () => {
        const items = [
            { url: '/api/resource-a/1', method: 'POST' as const, body: { i: 0 } },
            { url: '/api/resource-b/1', method: 'POST' as const, body: { i: 1 } },
            { url: '/api/resource-c/1', method: 'POST' as const, body: { i: 2 } },
        ];

        for (const item of items) {
            offlineSyncManager.addToQueue(item.url, item.method, item.body);
        }

        (fetch as any).mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({ ok: true, status: 200 }), 100))
        );

        const start = Date.now();
        await offlineSyncManager.processQueue();
        const duration = Date.now() - start;

        // Total 300ms if sequential, should be ~100ms if concurrent
        expect(duration).toBeLessThan(250);
        expect(offlineSyncManager.getQueue().length).toBe(0);
    });

    it('processes items sequentially for the same resource group', async () => {
        const order: string[] = [];
        const items = [
            { url: '/api/users/1', method: 'PATCH' as const, body: { name: 'Alice' } },
            { url: '/api/users/1/settings', method: 'POST' as const, body: { theme: 'dark' } },
            { url: '/api/users/2', method: 'PATCH' as const, body: { name: 'Bob' } },
        ];

        // Since they all start with /api/users, they should be in the same group and processed sequentially
        for (const item of items) {
            offlineSyncManager.addToQueue(item.url, item.method, item.body);
        }

        (fetch as any).mockImplementation((url: string) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    order.push(url);
                    resolve({ ok: true, status: 200 });
                }, 50);
            });
        });

        const start = Date.now();
        await offlineSyncManager.processQueue();
        const duration = Date.now() - start;

        expect(order).toEqual([
            'http://localhost:3000/api/users/1',
            'http://localhost:3000/api/users/1/settings',
            'http://localhost:3000/api/users/2'
        ]);
        expect(duration).toBeGreaterThanOrEqual(150);
        expect(offlineSyncManager.getQueue().length).toBe(0);
    });

    it('handles failures by keeping items in queue', async () => {
        offlineSyncManager.addToQueue('/api/fail', 'POST', { data: 'error' });
        offlineSyncManager.addToQueue('/api/success', 'POST', { data: 'ok' });

        (fetch as any).mockImplementation((url: string) => {
            if (url.includes('fail')) {
                return Promise.resolve({ ok: false, status: 500 });
            }
            return Promise.resolve({ ok: true, status: 200 });
        });

        await offlineSyncManager.processQueue();

        const queue = offlineSyncManager.getQueue();
        expect(queue.length).toBe(1);
        expect(queue[0].url).toBe('/api/fail');
    });

    it('removes items on 4xx client errors (except 429)', async () => {
        offlineSyncManager.addToQueue('/api/bad-request', 'POST', { data: 'invalid' });

        (fetch as any).mockResolvedValue({ ok: false, status: 400 });

        await offlineSyncManager.processQueue();

        expect(offlineSyncManager.getQueue().length).toBe(0);
    });
});
