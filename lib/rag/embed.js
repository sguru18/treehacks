/**
 * OpenAI embeddings for RAG (text-embedding-3-small, 1536 dims).
 *
 * @module lib/rag/embed
 */

const EMBEDDING_MODEL = 'text-embedding-3-small';
const DIMENSION = 1536;

/**
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for RAG embeddings');

  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // API limit
  });

  const vector = res.data?.[0]?.embedding;
  if (!vector || vector.length !== DIMENSION) {
    throw new Error('Unexpected embedding response');
  }
  return vector;
}

/**
 * @param {Array<{ id: string, text: string }>} chunks
 * @returns {Promise<Array<{ id: string, values: number[], metadata: { text: string } }>>}
 */
export async function embedChunks(chunks) {
  if (chunks.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for RAG embeddings');

  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });

  const inputs = chunks.map((c) => c.text);
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
  });

  const ordered = res.data?.slice(0, chunks.length).sort((a, b) => a.index - b.index) ?? [];
  return chunks.map((chunk, i) => {
    const vec = ordered[i]?.embedding;
    if (!vec) throw new Error('Missing embedding for chunk ' + chunk.id);
    return {
      id: chunk.id,
      values: vec,
      metadata: { text: chunk.text },
    };
  });
}

export { DIMENSION };
