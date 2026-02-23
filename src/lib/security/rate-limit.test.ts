import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
    vi.useFakeTimers();
});

import { rateLimit, _resetRateLimitStore, _getRateLimitStoreSize } from './rate-limit';

describe('rateLimit', () => {
    beforeEach(() => {
        _resetRateLimitStore();
    });

    afterEach(() => {
        // We don't call useRealTimers here because we are using hoisted fake timers
    });

    it('should allow requests within the limit', () => {
        const key = 'user-1';
        const limit = 3;
        const window = 60;

        const result1 = rateLimit(key, limit, window);
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(2);
        expect(result1.reset).toBeGreaterThan(Date.now());

        const result2 = rateLimit(key, limit, window);
        expect(result2.success).toBe(true);
        expect(result2.remaining).toBe(1);

        const result3 = rateLimit(key, limit, window);
        expect(result3.success).toBe(true);
        expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding the limit', () => {
        const key = 'user-2';
        const limit = 2;
        const window = 60;

        rateLimit(key, limit, window);
        rateLimit(key, limit, window);

        const result = rateLimit(key, limit, window);
        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('should reset the limit after the window expires', () => {
        const key = 'user-3';
        const limit = 1;
        const window = 60;

        rateLimit(key, limit, window);
        expect(rateLimit(key, limit, window).success).toBe(false);

        // Advance time by 61 seconds
        vi.advanceTimersByTime(61000);

        const result = rateLimit(key, limit, window);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(0);
    });

    it('should maintain independent limits for different keys', () => {
        const limit = 1;
        const window = 60;

        rateLimit('user-a', limit, window);
        expect(rateLimit('user-a', limit, window).success).toBe(false);

        // user-b should still be allowed
        expect(rateLimit('user-b', limit, window).success).toBe(true);
    });

    it('should cleanup expired entries via the interval', () => {
        const window = 10; // 10 seconds

        rateLimit('expired-user', 5, window);

        expect(_getRateLimitStoreSize()).toBe(1);

        // Advance time by 61 seconds (CLEANUP_INTERVAL is 60s)
        vi.advanceTimersByTime(61000);

        expect(_getRateLimitStoreSize()).toBe(0);
    });
});
