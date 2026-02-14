import { NextResponse } from 'next/server';
import { createDebate } from '@/lib/agents/orchestrator.js';
import { listDebates } from '@/lib/store.js';

/**
 * GET /api/debates -- list all debates
 */
export async function GET() {
  try {
    const debates = listDebates();
    return NextResponse.json(debates);
  } catch (error) {
    console.error('Error listing debates:', error);
    return NextResponse.json({ error: 'Failed to list debates' }, { status: 500 });
  }
}

/**
 * POST /api/debates -- create a new debate
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { idea, criteria = [] } = body;

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return NextResponse.json({ error: 'idea is required' }, { status: 400 });
    }

    const debate = await createDebate(idea.trim(), criteria);
    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error creating debate:', error);
    return NextResponse.json({ error: 'Failed to create debate', details: error.message }, { status: 500 });
  }
}
