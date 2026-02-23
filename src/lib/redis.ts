import Redis from 'ioredis';

const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    // In production, we might want to throw error, but for now we warn
    // and return null or let it default to localhost if desired,
    // but explicit URL is safer.
    console.warn('REDIS_URL is not defined in environment variables.');
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    client.on('error', (err) => {
      // Suppress connection errors to avoid crashing the app if Redis is down
      // but log them.
      console.error('Redis Client Error:', err.message);
    });

    return client;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
};

// Use a global variable to preserve the client across hot reloads in development
const globalForRedis = global as unknown as { redis: Redis | null };

const redis = globalForRedis.redis ?? getRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
