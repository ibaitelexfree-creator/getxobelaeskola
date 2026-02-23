import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should allow the first request', () => {
        const key = 'test-key-1';
        const limit = 5;
        const windowSeconds = 60;

        const result = rateLimit(key, limit, windowSeconds);

        expect(result.success).toBe(true);
        expect(result.remaining).toBe(limit - 1);
        // We can check exact reset time because we control time
        const now = Date.now();
        expect(result.reset).toBe(now + windowSeconds * 1000);
    });

    it('should decrement remaining count on subsequent requests', () => {
        const key = 'test-key-2';
        const limit = 3;
        const windowSeconds = 60;

        rateLimit(key, limit, windowSeconds); // 2 remaining
        const result = rateLimit(key, limit, windowSeconds); // 1 remaining

        expect(result.success).toBe(true);
        expect(result.remaining).toBe(1);
    });

    it('should block requests when limit is exceeded', () => {
        const key = 'test-key-3';
        const limit = 2;
        const windowSeconds = 60;

        rateLimit(key, limit, windowSeconds); // 1 remaining
        rateLimit(key, limit, windowSeconds); // 0 remaining

        const result = rateLimit(key, limit, windowSeconds); // Blocked

        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('should reset the limit after the window expires', () => {
        const key = 'test-key-4';
        const limit = 2;
        const windowSeconds = 10; // 10 seconds

        rateLimit(key, limit, windowSeconds);
        rateLimit(key, limit, windowSeconds);

        // Verify blocked
        expect(rateLimit(key, limit, windowSeconds).success).toBe(false);

        // Advance time by window + 1 second
        vi.advanceTimersByTime((windowSeconds * 1000) + 1000);

        // Should be allowed again
        const result = rateLimit(key, limit, windowSeconds);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(limit - 1);
    });

    it('should handle different keys independently', () => {
        const key1 = 'user-1';
        const key2 = 'user-2';
        const limit = 2;
        const windowSeconds = 60;

        // Exhaust key1
        rateLimit(key1, limit, windowSeconds);
        rateLimit(key1, limit, windowSeconds);
        expect(rateLimit(key1, limit, windowSeconds).success).toBe(false);

        // Key2 should still be fresh
        const result = rateLimit(key2, limit, windowSeconds);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(limit - 1);
    });

    it('should handle limit of 1 correctly', () => {
        const key = 'test-key-limit-1';
        const limit = 1;
        const windowSeconds = 60;

        const result1 = rateLimit(key, limit, windowSeconds);
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(0);

        const result2 = rateLimit(key, limit, windowSeconds);
        expect(result2.success).toBe(false);
        expect(result2.remaining).toBe(0);
    });
});
