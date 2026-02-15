/**
 * Pinecone RAG: index board chunks and retrieve by semantic similarity.
 *
 * @module lib/rag/pinecone
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { chunkBoard } from './chunk';
import { embedChunks, embedText } from './embed';

const INDEX_NAME = process.env.PINECONE_INDEX || 'daisy';
const TOP_K = 12;

let _client = null;

function getClient() {
  if (!process.env.PINECONE_API_KEY) return null;
  if (!_client) _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return _client;
}

function getIndex() {
  const pc = getClient();
  if (!pc) return null;
  return pc.index({ name: INDEX_NAME });
}

/**
 * Index a board for a session: chunk, embed, upsert to namespace = sessionId.
 * Replaces any existing vectors in that namespace.
 *
 * @param {string} sessionId
 * @param {Object} board — { sources, insights, features, roadmapItems }
 */
export async function indexBoard(sessionId, board) {
  const index = getIndex();
  if (!index) throw new Error('Pinecone not configured (PINECONE_API_KEY or PINECONE_INDEX missing)');

  const chunks = chunkBoard(board);
  if (chunks.length === 0) {
    try {
      await index.deleteAll({ namespace: sessionId });
    } catch (err) {
      if (err?.status !== 404 && !/404/.test(err?.message || '')) throw err;
    }
    return { indexed: 0 };
  }

  const records = await embedChunks(chunks);

  try {
    await index.deleteAll({ namespace: sessionId });
  } catch (err) {
    if (err?.status !== 404 && !/404/.test(err?.message || '')) throw err;
  }

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map((r) => ({
      id: r.id,
      values: r.values,
      metadata: { text: r.metadata.text },
    }));
    await index.upsert({ namespace: sessionId, records: batch });
  }

  return { indexed: records.length };
}

/**
 * Retrieve relevant chunks for a query. Returns array of text strings.
 *
 * @param {string} sessionId
 * @param {string} queryText
 * @param {number} [topK=TOP_K]
 * @returns {Promise<string[]>}
 */
export async function retrieve(sessionId, queryText, topK = TOP_K) {
  const index = getIndex();
  if (!index) return [];

  const vector = await embedText(queryText);

  const response = await index.query({
    namespace: sessionId,
    vector,
    topK,
    includeMetadata: true,
  });

  const matches = response.matches || [];
  const texts = matches
    .map((m) => m.metadata?.text)
    .filter(Boolean);

  return texts;
}

export function isPineconeConfigured() {
  return !!process.env.PINECONE_API_KEY;
}
