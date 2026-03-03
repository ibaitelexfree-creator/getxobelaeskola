import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';

export interface SemanticCacheConfig {
  threshold?: number;
  model?: string;
  apiKey?: string;
}

export class SemanticCache {
  private openai: OpenAI | null = null;
  private threshold: number;
  private model: string;
  private apiKey?: string;

  constructor(config: SemanticCacheConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.threshold = config.threshold ?? 0.9;
    this.model = config.model ?? 'text-embedding-3-small';
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!this.apiKey) {
        throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY environment variable or pass it to the constructor.');
      }
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
    return this.openai!;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const openai = this.getOpenAI();
    const response = await openai.embeddings.create({
      model: this.model,
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  }

  async findSimilar(query: string, customThreshold?: number): Promise<{ response: string; similarity: number; metadata: any } | null> {
    try {
      const embedding = await this.generateEmbedding(query);
      const supabase = createAdminClient();

      // @ts-ignore: Supabase types might not have the table yet
      const { data, error } = await supabase.rpc('match_cached_response', {
        query_embedding: embedding,
        match_threshold: customThreshold ?? this.threshold,
        match_count: 1,
      });

      if (error) {
        console.error('Error querying semantic cache:', error);
        return null;
      }

      if (data && data.length > 0) {
        return {
          response: data[0].response_text,
          similarity: data[0].similarity,
          metadata: data[0].metadata,
        };
      }

      return null;
    } catch (error) {
      console.error('Semantic Cache find error:', error);
      if (error instanceof Error && error.message.includes('OpenAI API Key is missing')) {
        throw error;
      }
      return null;
    }
  }

  async store(query: string, response: string, metadata: any = {}): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(query);
      const supabase = createAdminClient();

      // @ts-ignore: Supabase types might not have the table yet
      const { error } = await supabase.from('semantic_cache').insert({
        query_text: query,
        query_embedding: embedding,
        response_text: response,
        metadata: metadata,
      });

      if (error) {
        console.error('Error storing in semantic cache:', error);
      }
    } catch (error) {
      console.error('Semantic Cache store error:', error);
    }
  }
}
