import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { forkDebate, getDebate } from '@/lib/store.js';

/**
 * POST /api/debates/:id/fork -- fork a debate at a specific node
 */
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { nodeId, label } = body;

    if (!nodeId || !label) {
      return NextResponse.json({ error: 'nodeId and label are required' }, { status: 400 });
    }

    const branchId = uuidv4();
    const branch = forkDebate(params.id, nodeId, label, branchId);

    if (!branch) {
      return NextResponse.json({ error: 'Failed to fork -- debate or node not found' }, { status: 404 });
    }

    const debate = getDebate(params.id);
    return NextResponse.json(debate);
  } catch (error) {
    console.error('Error forking debate:', error);
    return NextResponse.json({ error: 'Failed to fork debate', details: error.message }, { status: 500 });
  }
}
