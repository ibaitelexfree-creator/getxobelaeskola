import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SemanticCache } from '../src/lib/ai/semantic-cache';
import redis from '../src/lib/redis';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = {
        create: vi.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.1) }],
        }),
      };
    },
  };
});

// Mock Redis
vi.mock('../src/lib/redis', () => {
  const mRedis = {
    call: vi.fn(),
    hset: vi.fn(),
    pipeline: vi.fn().mockReturnThis(),
    exec: vi.fn(),
    on: vi.fn(),
  };
  return { default: mRedis };
});

describe('SemanticCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SemanticCache as any).isIndexCreated = false;
  });

  it('should ensure index is created', async () => {
    (redis as any).call.mockResolvedValue('OK');
    await SemanticCache.get('test');

    const calls = (redis.call as any).mock.calls;
    const createCall = calls.find((c: any[]) => c[0] === 'FT.CREATE');
    expect(createCall).toBeDefined();
    expect(createCall[1]).toBe('semantic-cache-index');
    expect(createCall[3]).toBe('HASH');
  });

  it('should return null if cache miss (score too high)', async () => {
    // Mock FT.SEARCH result
    (redis as any).call.mockImplementation((cmd: string) => {
      if (cmd === 'FT.SEARCH') {
        return [1, 'semantic-cache:123', ['response', 'cached response', 'score', '0.9']];
      }
      return 'OK';
    });

    const result = await SemanticCache.get('test prompt');
    expect(result).toBeNull();
  });

  it('should return response if cache hit (score low)', async () => {
    // Distance 0.01 < 0.05 => Hit
    (redis as any).call.mockImplementation((cmd: string) => {
      if (cmd === 'FT.SEARCH') {
        return [1, 'semantic-cache:123', ['response', 'cached response', 'score', '0.01']];
      }
      return 'OK';
    });

    const result = await SemanticCache.get('test prompt');
    expect(result).toBe('cached response');
  });

  it('should cache response correctly', async () => {
    await SemanticCache.set('prompt', 'response');

    // Check hset for string fields
    expect(redis.hset).toHaveBeenCalledWith(expect.stringContaining('semantic-cache:'), {
      prompt: 'prompt',
      response: 'response',
    });

    // Check call for vector field
    expect(redis.call).toHaveBeenCalledWith(
      'HSET',
      expect.stringContaining('semantic-cache:'),
      'embedding',
      expect.any(Buffer)
    );
  });
});
