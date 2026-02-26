import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SemanticCache } from './semantic-cache';

// Mock OpenAI
const { mockCreateEmbedding } = vi.hoisted(() => {
  return { mockCreateEmbedding: vi.fn() };
});

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      embeddings = {
        create: mockCreateEmbedding,
      };
    },
  };
});

// Mock Supabase
const mockRpc = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

describe('SemanticCache', () => {
  let cache: SemanticCache;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new SemanticCache({ apiKey: 'test-key' });

    // Default embedding mock
    mockCreateEmbedding.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    });
  });

  it('should return null if no similar entry found (cache miss)', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const result = await cache.findSimilar('test query');

    expect(mockCreateEmbedding).toHaveBeenCalledWith(expect.objectContaining({
      input: 'test query',
    }));
    expect(mockRpc).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return cached response if similar entry found (cache hit)', async () => {
    mockRpc.mockResolvedValue({
      data: [{
        response_text: 'Cached Response',
        similarity: 0.95,
        metadata: { source: 'test' },
      }],
      error: null,
    });

    const result = await cache.findSimilar('test query');

    expect(result).toEqual({
      response: 'Cached Response',
      similarity: 0.95,
      metadata: { source: 'test' },
    });
  });

  it('should handle API errors gracefully (return null)', async () => {
    mockCreateEmbedding.mockRejectedValue(new Error('OpenAI Error'));

    const result = await cache.findSimilar('test query');

    expect(result).toBeNull();
  });

  it('should store new entries correctly', async () => {
    mockInsert.mockResolvedValue({ error: null });

    await cache.store('test query', 'new response', { key: 'value' });

    expect(mockCreateEmbedding).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('semantic_cache');
    expect(mockInsert).toHaveBeenCalledWith({
      query_text: 'test query',
      query_embedding: [0.1, 0.2, 0.3],
      response_text: 'new response',
      metadata: { key: 'value' },
    });
  });
});
