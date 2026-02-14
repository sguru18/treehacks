import { NextResponse } from 'next/server';
import { rewindDebate } from '@/lib/store.js';

/**
 * POST /api/debates/:id/rewind -- rewind to a specific node
 */
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { nodeId } = body;

    if (!nodeId) {
      return NextResponse.json({ error: 'nodeId is required' }, { status: 400 });
    }

    const debate = rewindDebate(params.id, nodeId);
    if (!debate) {
      return NextResponse.json({ error: 'Failed to rewind -- debate or node not found' }, { status: 404 });
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error rewinding debate:', error);
    return NextResponse.json({ error: 'Failed to rewind debate', details: error.message }, { status: 500 });
  }
}
