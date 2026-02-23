import OpenAI from 'openai';
import redis from '../redis';
import { randomUUID } from 'crypto';

// Configuration
const INDEX_NAME = 'semantic-cache-index';
const VECTOR_DIM = 1536; // Dimensions for text-embedding-3-small
const DISTANCE_THRESHOLD = 0.05; // Similarity > 0.95 (Cosine Distance < 0.05)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class SemanticCache {
  private static isIndexCreated = false;

  private static async getEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  }

  private static float32Buffer(arr: number[]): Buffer {
    return Buffer.from(new Float32Array(arr).buffer);
  }

  static async ensureIndex() {
    if (this.isIndexCreated) return;
    if (!redis) return;

    try {
      await redis.call(
        'FT.CREATE',
        INDEX_NAME,
        'ON',
        'HASH',
        'PREFIX',
        '1',
        'semantic-cache:',
        'SCHEMA',
        'prompt',
        'TEXT',
        'response',
        'TEXT',
        'embedding',
        'VECTOR',
        'HNSW',
        '6',
        'TYPE',
        'FLOAT32',
        'DIM',
        VECTOR_DIM.toString(),
        'DISTANCE_METRIC',
        'COSINE'
      );
      this.isIndexCreated = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Index already exists')) {
        this.isIndexCreated = true;
      } else {
        console.error('Failed to create Redis index:', err);
      }
    }
  }

  static async get(prompt: string): Promise<string | null> {
    if (!redis) return null;

    try {
      await this.ensureIndex();

      const embedding = await this.getEmbedding(prompt);
      const blob = this.float32Buffer(embedding);

      // Search for nearest neighbor
      // FT.SEARCH index query PARAMS 2 name value DIALECT 2
      // Query: "*=>[KNN 1 @embedding $BLOB AS score]"
      const results = await redis.call(
        'FT.SEARCH',
        INDEX_NAME,
        `*=>[KNN 1 @embedding $BLOB AS score]`,
        'PARAMS',
        '2',
        'BLOB',
        blob,
        'RETURN',
        '2',
        'response',
        'score',
        'DIALECT',
        '2'
      ) as [number, string, string[], ...unknown[]];

      // Format: [total_results, key, [field, value, ...], ...]
      const totalResults = results[0];
      if (typeof totalResults === 'number' && totalResults === 0) return null;

      // Check the first result
      // results[1] is the key, results[2] is the fields array
      const fields = results[2];

      let response: string | null = null;
      let score: number | null = null;

      for (let i = 0; i < fields.length; i += 2) {
        const key = fields[i];
        const val = fields[i + 1];
        if (key === 'response') response = val;
        if (key === 'score') score = parseFloat(val);
      }

      // Check threshold
      if (score !== null && score < DISTANCE_THRESHOLD) {
        return response;
      }

      return null;

    } catch (error) {
      console.error('Semantic Cache Error (get):', error);
      return null;
    }
  }

  static async set(prompt: string, response: string): Promise<void> {
    if (!redis) return;

    try {
      await this.ensureIndex();
      const embedding = await this.getEmbedding(prompt);
      const blob = this.float32Buffer(embedding);
      const id = randomUUID();
      const key = `semantic-cache:${id}`;

      // Use pipeline for atomicity/efficiency
      // We set string fields first, then vector field as buffer
      await redis.hset(key, {
        prompt,
        response,
      });

      // Set the embedding buffer separately to ensure binary safety if needed,
      // though ioredis object syntax usually handles buffers.
      await redis.call('HSET', key, 'embedding', blob);

    } catch (error) {
      console.error('Semantic Cache Error (set):', error);
    }
  }
}
