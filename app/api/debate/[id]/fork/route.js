import { forkDebate } from '@/lib/agents/orchestrator.js';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const debateId = params.id;

  try {
    const body = await request.json();
    const { nodeId, label } = body;

    if (!nodeId || !label) {
      return NextResponse.json(
        { error: 'nodeId and label are required' },
        { status: 400 }
      );
    }

    const branch = await forkDebate(debateId, nodeId, label);

    return NextResponse.json(branch);
  } catch (error) {
    console.error('Error forking debate:', error);
    return NextResponse.json(
      { error: 'Failed to fork debate', details: error.message },
      { status: 500 }
    );
  }
}
