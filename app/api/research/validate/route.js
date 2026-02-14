import { validateClaim, searchProductHunt, searchGitHub } from '@/lib/research/stagehand.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, claim, urls, query } = body;

    if (type === 'claim' && claim && urls) {
      const result = await validateClaim(claim, urls);
      return NextResponse.json(result);
    }

    if (type === 'producthunt' && query) {
      const result = await searchProductHunt(query);
      return NextResponse.json(result);
    }

    if (type === 'github' && query) {
      const result = await searchGitHub(query);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error validating:', error);
    return NextResponse.json(
      { error: 'Failed to validate', details: error.message },
      { status: 500 }
    );
  }
}
