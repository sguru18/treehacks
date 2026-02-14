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

    return NextResponse.json({
      verdict: debate.finalVerdict,
      debateId: debate.id,
      idea: debate.idea,
    });
  } catch (error) {
    console.error('Error getting verdict:', error);
    return NextResponse.json(
      { error: 'Failed to get verdict', details: error.message },
      { status: 500 }
    );
  }
}
