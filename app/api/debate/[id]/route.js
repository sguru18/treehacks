import { getDebate } from '@/lib/agents/orchestrator.js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const debateId = params.id;

  try {
    const debate = getDebate(debateId);
    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error getting debate:', error);
    return NextResponse.json(
      { error: 'Failed to get debate', details: error.message },
      { status: 500 }
    );
  }
}
