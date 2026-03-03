import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit, _resetRateLimitStore, _getRateLimitStoreSize, _cleanupRateLimitStore } from './rate-limit';

describe('rateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        _resetRateLimitStore();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should allow the first request', () => {
        const result = rateLimit('test-key', 5, 60);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
        expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should allow multiple requests within the limit', () => {
        rateLimit('test-key', 3, 60);
        const result = rateLimit('test-key', 3, 60);

        expect(result.success).toBe(true);
        expect(result.remaining).toBe(1);
    });

    it('should block requests that exceed the limit', () => {
        const key = 'test-key';
        const limit = 2;

        rateLimit(key, limit, 60);
        rateLimit(key, limit, 60);
        const result = rateLimit(key, limit, 60);

        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('should reset the limit after the window expires', () => {
        const key = 'test-key';
        const limit = 1;
        const windowSeconds = 60;

        // Use up the limit
        rateLimit(key, limit, windowSeconds);
        expect(rateLimit(key, limit, windowSeconds).success).toBe(false);

        // Advance time past the window
        vi.advanceTimersByTime((windowSeconds + 1) * 1000);

        const result = rateLimit(key, limit, windowSeconds);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(0); // limit - 1
    });

    it('should isolate limits between different keys', () => {
        const key1 = 'key1';
        const key2 = 'key2';
        const limit = 1;

        rateLimit(key1, limit, 60);
        expect(rateLimit(key1, limit, 60).success).toBe(false);

        // key2 should still be allowed
        expect(rateLimit(key2, limit, 60).success).toBe(true);
    });

    it('should cleanup expired entries from the store', () => {
        const windowSeconds = 10; // 10 seconds window

        rateLimit('key1', 5, windowSeconds);

        expect(_getRateLimitStoreSize()).toBe(1);

        // Advance time to expire the entry (11 seconds)
        vi.advanceTimersByTime(11000);

        // Entry is expired but still in store until cleanup runs
        expect(_getRateLimitStoreSize()).toBe(1);

        // Explicitly call cleanup
        _cleanupRateLimitStore();

        expect(_getRateLimitStoreSize()).toBe(0);
    });

    it('should handle multiple keys with mixed expiration', () => {
        rateLimit('key-expiring-soon', 5, 10);
        rateLimit('key-expiring-later', 5, 100);

        expect(_getRateLimitStoreSize()).toBe(2);

        // Advance time so only the first one expires
        vi.advanceTimersByTime(11000);

        // Call cleanup
        _cleanupRateLimitStore();

        expect(_getRateLimitStoreSize()).toBe(1);

        // Advance time so the second one expires
        vi.advanceTimersByTime(100000);

        // Call cleanup again
        _cleanupRateLimitStore();

        expect(_getRateLimitStoreSize()).toBe(0);
    });
});
