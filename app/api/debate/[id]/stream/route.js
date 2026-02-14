import { runDebateRound, getDebate } from '@/lib/agents/orchestrator.js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const debateId = params.id;
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId') || null;

  try {
    const debate = getDebate(debateId);
    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of runDebateRound(debateId, branchId)) {
            const data = JSON.stringify(event) + '\n\n';
            controller.enqueue(encoder.encode(`data: ${data}`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({ type: 'error', message: error.message });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error streaming debate:', error);
    return NextResponse.json(
      { error: 'Failed to stream debate', details: error.message },
      { status: 500 }
    );
  }
}
