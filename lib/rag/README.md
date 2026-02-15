# RAG layer for Daisy chat

The chatbot uses **Pinecone** for retrieval: the board (sources, insights, features, roadmap) is chunked, embedded with **OpenAI text-embedding-3-small**, and stored in Pinecone. Each chat session has its own namespace so multiple users/sessions don’t mix.

## Setup

1. **Pinecone**
   - Create an index in the [Pinecone console](https://app.pinecone.io) with:
     - **Dimension:** `1536` (default) or `1024` — must match `RAG_EMBED_DIMENSION` (see below)
     - **Metric:** cosine (default)
   - Set env vars:
     - `PINECONE_API_KEY` — your Pinecone API key
     - `PINECONE_INDEX` — index name (default: `daisy-board`)
   - If your index uses **1024** dimensions, set `RAG_EMBED_DIMENSION=1024` so embeddings match.

2. **OpenAI**
   - RAG embeddings use the OpenAI API. Set `OPENAI_API_KEY` (same as for chat if you use OpenAI).

If Pinecone or OpenAI isn’t configured, the chat falls back to sending the full board in the request (no vector retrieval).

## Flow

- **Index:** When the user opens the chat panel, the client calls `POST /api/chat/index` with `{ sessionId, board }`. The server chunks the board, embeds chunks, and upserts them into Pinecone under namespace `sessionId` (replacing any existing vectors for that session).
- **Query:** When the user sends a message, the server embeds the last user message, runs a vector search in the session namespace, and injects the top‑k chunk texts into the system prompt. The LLM then streams the reply.

## Files

- `chunk.js` — turns the board into text chunks (sources, insights, features, roadmap).
- `embed.js` — OpenAI embeddings (single text and batch).
- `pinecone.js` — index and retrieve helpers; uses namespace = sessionId.
