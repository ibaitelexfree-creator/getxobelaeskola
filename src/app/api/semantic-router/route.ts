import { NextRequest, NextResponse } from 'next/server';
import { semanticRouter } from '@/lib/semantic-router';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "prompt" parameter. Must be a string.' },
        { status: 400 }
      );
    }

    const result = await semanticRouter.route(prompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Semantic Router API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
