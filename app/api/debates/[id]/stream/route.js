import { runRound } from '@/lib/agents/orchestrator.js';
import { getDebate } from '@/lib/store.js';
import { NextResponse } from 'next/server';

/**
 * GET /api/debates/:id/stream -- SSE stream of a debate round
 */
export async function GET(request, { params }) {
  const debateId = params.id;
  const debate = getDebate(debateId);

  if (!debate) {
    return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runRound(debateId)) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('[Stream] Error:', error);
        const errData = `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`;
        controller.enqueue(encoder.encode(errData));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
