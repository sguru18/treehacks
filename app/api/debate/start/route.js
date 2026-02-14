import { startDebate } from '@/lib/agents/orchestrator.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idea, criteria = [] } = body;

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    const debate = await startDebate(idea, criteria);

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error starting debate:', error);
    return NextResponse.json(
      { error: 'Failed to start debate', details: error.message },
      { status: 500 }
    );
  }
}
