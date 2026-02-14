import { NextResponse } from 'next/server';
import { getDebate } from '@/lib/store.js';

/**
 * GET /api/debates/:id -- get a single debate
 */
export async function GET(request, { params }) {
  try {
    const debate = getDebate(params.id);
    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }
    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error getting debate:', error);
    return NextResponse.json({ error: 'Failed to get debate' }, { status: 500 });
  }
}
