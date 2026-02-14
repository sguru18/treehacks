import { rewindDebate } from '@/lib/agents/orchestrator.js';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const debateId = params.id;

  try {
    const body = await request.json();
    const { nodeId } = body;

    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId is required' },
        { status: 400 }
      );
    }

    const debate = await rewindDebate(debateId, nodeId);

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error rewinding debate:', error);
    return NextResponse.json(
      { error: 'Failed to rewind debate', details: error.message },
      { status: 500 }
    );
  }
}
