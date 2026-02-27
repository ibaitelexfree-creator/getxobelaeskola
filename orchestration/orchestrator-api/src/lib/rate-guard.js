import Redis from 'ioredis';
import db from './db-client.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => null // Do not retry if connection fails
});

const memRate = new Map();
let isRedisDown = false;

redis.on('error', (err) => {
    if (!isRedisDown) {
        console.warn('[RateGuard] Redis connection failed, falling back to memory.');
        isRedisDown = true;
    }
});

/**
 * RateGuard for SWARM CI/CD 2.0
 * Manages API quotas for multiple models and accounts.
 */
export class RateGuard {
    static LIMITS = {
        'google/gemini-2.0-flash-001': { hour: 55, day: 500 },
        'grok-beta': { hour: 15, day: 100 }
    };

    /**
     * Checks if we can call a specific model.
     * Returns { allowed: boolean, waitMs: number, reason: string }
     */
    static async check(model, provider = 'OpenRouter') {
        const limit = this.LIMITS[model] || { hour: 20, day: 100 };
        const now = Date.now();
        const hourKey = `rate:h:${model}:${Math.floor(now / 3600000)}`;
        const dayKey = `rate:d:${model}:${Math.floor(now / 86400000)}`;

        let hourCount, dayCount;

        if (!isRedisDown) {
            try {
                [hourCount, dayCount] = await Promise.all([
                    redis.get(hourKey),
                    redis.get(dayKey)
                ]);
            } catch (e) {
                isRedisDown = true;
                hourCount = memRate.get(hourKey);
                dayCount = memRate.get(dayKey);
            }
        } else {
            hourCount = memRate.get(hourKey);
            dayCount = memRate.get(dayKey);
        }

        if (parseInt(hourCount || 0) >= limit.hour) {
            return { allowed: false, waitMs: 60000, reason: 'Hourly limit reached' };
        }

        if (parseInt(dayCount || 0) >= limit.day) {
            return { allowed: false, waitMs: 3600000, reason: 'Daily limit reached' };
        }

        // Check for hard blocks in DB
        try {
            const blockCheck = await db.query(
                'SELECT is_blocked FROM sw2_rate_limits WHERE model_name = $1 AND is_blocked = TRUE ORDER BY created_at DESC LIMIT 1',
                [model]
            );

            if (blockCheck.rows.length > 0 && blockCheck.rows[0].is_blocked) {
                return { allowed: false, waitMs: 600000, reason: 'Model manually or auto-blocked' };
            }
        } catch (e) {
            // DB resilience handles ECONNREFUSED
        }

        return { allowed: true, waitMs: 0 };
    }

    /**
     * Active Wait: If limit is hit, sleeps and retries.
     */
    static async waitIfNeeded(model, provider = 'OpenRouter') {
        const result = await this.check(model, provider);
        if (!result.allowed) {
            console.log(`[RateGuard] ⏳ Quota full for ${model}. Sleeping ${Math.round(result.waitMs / 1000)}s...`);
            await new Promise(r => setTimeout(r, result.waitMs));
            return this.waitIfNeeded(model, provider); // Recursive check
        }
        return true;
    }

    /**
     * Registers a call attempt and its result.
     */
    static async register(model, provider, success, statusCode = 200, retryAfterMs = 0) {
        const now = Date.now();
        const hourKey = `rate:h:${model}:${Math.floor(now / 3600000)}`;
        const dayKey = `rate:d:${model}:${Math.floor(now / 86400000)}`;

        if (!isRedisDown) {
            try {
                const multi = redis.multi();
                multi.incr(hourKey);
                multi.expire(hourKey, 3600);
                multi.incr(dayKey);
                multi.expire(dayKey, 86400);
                await multi.exec();
            } catch (e) {
                isRedisDown = true;
            }
        }

        // Always sync with memory
        memRate.set(hourKey, (memRate.get(hourKey) || 0) + 1);
        memRate.set(dayKey, (memRate.get(dayKey) || 0) + 1);

        // Log to DB for analytics
        try {
            await db.query(
                'INSERT INTO sw2_rate_limits (model_name, provider, status_code, retry_after_ms, is_blocked) VALUES ($1, $2, $3, $4, $5)',
                [model, provider, statusCode, retryAfterMs, statusCode === 429]
            );
        } catch (e) {
            // DB resilience handles ECONNREFUSED
        }
    }

    static async getStats() {
        return { isRedisDown, memRateSize: memRate.size };
    }

    static async handleOriginRequest(originId, dailyLimit = 100) {
        try {
            const res = await db.query(`
                INSERT INTO sw2_rate_by_origin (origin_id, date, request_count, block_count)
                VALUES ($1, CURRENT_DATE, 1, 0)
                ON CONFLICT (origin_id, date) 
                DO UPDATE SET request_count = sw2_rate_by_origin.request_count + 1
                RETURNING request_count, block_count
            `, [originId]);

            const row = res.rows[0];
            if (!row || row.command === 'MOCK') return { allowed: true, current: 1 };

            const { request_count, block_count } = row;

            if (request_count > dailyLimit) {
                await db.query(`
                    UPDATE sw2_rate_by_origin 
                    SET block_count = block_count + 1 
                    WHERE origin_id = $1 AND date = CURRENT_DATE
                `, [originId]);

                return { allowed: false, reason: 'Origin daily rate limit exceeded' };
            }

            return { allowed: true, current: request_count };
        } catch (error) {
            return { allowed: true, current: 0 };
        }
    }
}
