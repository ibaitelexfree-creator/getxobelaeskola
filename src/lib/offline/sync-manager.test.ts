import { describe, it, expect, vi, beforeEach } from 'vitest';
import { offlineSyncManager } from './sync-manager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

if (typeof window === 'undefined') {
    (global as any).window = { location: { origin: 'http://localhost' } };
    (global as any).localStorage = localStorageMock;
    (global as any).navigator = { onLine: true };
} else {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
}

// Mock fetch
global.fetch = vi.fn();

describe('offlineSyncManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    (navigator as any).onLine = true;
  });

  it('should process queue items with concurrency (Optimized)', async () => {
    const itemCount = 50;
    const fetchDelay = 50;
    const concurrencyLimit = 5;

    // Fill the queue
    for (let i = 0; i < itemCount; i++) {
        offlineSyncManager.addToQueue(`/api/test-${i}`, 'POST', { data: i });
    }

    // Reset mock counts after filling the queue
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    (fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), fetchDelay)));

    const start = Date.now();
    await offlineSyncManager.processQueue(concurrencyLimit);
    const duration = Date.now() - start;

    console.log(`Optimized Duration (50 items, 50ms latency, concurrency 5): ${duration}ms`);
    console.log(`Optimized LocalStorage GetItem calls: ${localStorageMock.getItem.mock.calls.length}`);
    console.log(`Optimized LocalStorage SetItem calls: ${localStorageMock.setItem.mock.calls.length}`);

    // Expect duration to be roughly (itemCount / concurrencyLimit) * fetchDelay (500ms + overhead)
    expect(duration).toBeLessThan(itemCount * fetchDelay);
    expect(duration).toBeGreaterThanOrEqual((itemCount / concurrencyLimit) * fetchDelay);
    expect(offlineSyncManager.getQueue().length).toBe(0);

    // SetItem calls should be equal to the number of batches (50 / 5 = 10)
    expect(localStorageMock.setItem.mock.calls.length).toBe(itemCount / concurrencyLimit);
  });

  it('should handle failures correctly in optimized mode', async () => {
    offlineSyncManager.addToQueue('/api/ok', 'POST', { ok: true });
    offlineSyncManager.addToQueue('/api/fail-client', 'POST', { fail: true });
    offlineSyncManager.addToQueue('/api/fail-server', 'POST', { fail: true });

    (fetch as any).mockImplementation((url: string) => {
        if (url.includes('ok')) return Promise.resolve({ ok: true });
        if (url.includes('fail-client')) return Promise.resolve({ ok: false, status: 400 });
        if (url.includes('fail-server')) return Promise.resolve({ ok: false, status: 500 });
        return Promise.reject(new Error('Network error'));
    });

    await offlineSyncManager.processQueue(3);

    const remaining = offlineSyncManager.getQueue();
    // /api/ok -> ok (removed)
    // /api/fail-client (400) -> invalid (removed)
    // /api/fail-server (500) -> retry (kept)
    expect(remaining.length).toBe(1);
    expect(remaining[0].url).toBe('/api/fail-server');
  });
});
