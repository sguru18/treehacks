/**
 * POST /api/chat/index
 * Index the board into Pinecone for RAG. Call when the board changes or when opening chat.
 */

import { indexBoard } from '@/lib/rag/pinecone';

export async function POST(request) {
  try {
    const { sessionId, board } = await request.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const result = await indexBoard(sessionId, board || {});

    return Response.json({ ok: true, indexed: result.indexed });
  } catch (error) {
    console.error('[API /chat/index] Error:', error);
    return Response.json(
      { error: error.message || 'Indexing failed' },
      { status: 500 },
    );
  }
}
