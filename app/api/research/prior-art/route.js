import { searchPriorArt } from '@/lib/research/perplexity.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const result = await searchPriorArt(idea);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching prior art:', error);
    return NextResponse.json(
      { error: 'Failed to search prior art', details: error.message },
      { status: 500 }
    );
  }
}
