
/**
 * Simple In-Memory Rate Limiter
 * 
 * Note: In a distributed environment (Vercel, AWS Lambda), this state is not shared between instances.
 * Ideally, this should use Redis (Upstash) or a DB table.
 * 
 * For this project phase (Hardening without Redis credential), we use a Singleton Map.
 */

type RateLimitEntry = {
    count: number;
    resetTime: number;
};

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000; // 1 minute cleanup

// Periodic cleanup to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (now > value.resetTime) {
            store.delete(key);
        }
    }
}, CLEANUP_INTERVAL);

/**
 * Checks if a key has exceeded the rate limit.
 * 
 * @param key - Unique identifier (Employee ID, IP, etc.)
 * @param limit - Max requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const record = store.get(key);

    if (!record) {
        store.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true, remaining: limit - 1, reset: now + windowMs };
    }

    if (now > record.resetTime) {
        // Expired window, reset
        store.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true, remaining: limit - 1, reset: now + windowMs };
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0, reset: record.resetTime };
    }

    record.count += 1;
    return { success: true, remaining: limit - record.count, reset: record.resetTime };
}
