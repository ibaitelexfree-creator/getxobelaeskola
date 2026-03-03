import { NextResponse } from 'next/server';
import { SemanticCache } from '@/lib/ai/semantic-cache';

export async function POST(req: Request) {
  try {
    const { query, simulate_response, threshold } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cache = new SemanticCache({ threshold: threshold || 0.9 });
    const cached = await cache.findSimilar(query);

    if (cached) {
      return NextResponse.json({
        source: 'cache',
        data: cached,
      });
    }

    // Simulate LLM call
    const response = simulate_response || `Simulated LLM response for: ${query}`;

    // Store in cache
    await cache.store(query, response, { source: 'demo' });

    return NextResponse.json({
      source: 'llm',
      data: {
        response,
        similarity: 0,
        metadata: { source: 'demo' }
      }
    });

  } catch (error) {
    console.error('Cache demo error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
