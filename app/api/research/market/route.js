import { analyzeMarket } from '@/lib/research/perplexity.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idea, criteria = [] } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const result = await analyzeMarket(idea, criteria);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing market:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market', details: error.message },
      { status: 500 }
    );
  }
}
