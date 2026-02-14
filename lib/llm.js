/**
 * Model-agnostic LLM adapter.
 * Reads LLM_PROVIDER env var and routes to the right SDK.
 * Supports: "openai" (default), "anthropic", "openai-compatible" (any endpoint).
 *
 * @module lib/llm
 */

import OpenAI from 'openai';

/**
 * Get the configured provider name.
 * @returns {'openai'|'anthropic'|'openai-compatible'}
 */
function getProvider() {
  return process.env.LLM_PROVIDER || 'openai';
}

/**
 * Build an OpenAI-compatible client for the current provider.
 * Anthropic's messages API is different, so we wrap it to match.
 * @returns {OpenAI}
 */
function getOpenAIClient() {
  const provider = getProvider();

  if (provider === 'anthropic') {
    // Anthropic doesn't use OpenAI SDK, but we can route through
    // openai-compatible proxy or handle separately in chat()
    return null;
  }

  if (provider === 'openai-compatible') {
    return new OpenAI({
      apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || 'dummy',
      baseURL: process.env.LLM_BASE_URL,
    });
  }

  // Default: OpenAI
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Get the default model name for the provider.
 * @returns {string}
 */
function getModel() {
  if (process.env.LLM_MODEL) return process.env.LLM_MODEL;

  const provider = getProvider();
  switch (provider) {
    case 'anthropic': return 'claude-sonnet-4-20250514';
    case 'openai-compatible': return 'gpt-4o';
    default: return 'gpt-4o';
  }
}

/**
 * Send a chat completion request (non-streaming).
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {number} [options.temperature=0.7]
 * @param {boolean} [options.json=false] - Request JSON response format
 * @param {string} [options.model] - Override default model
 * @returns {Promise<string>} The assistant message content
 */
export async function chat({ messages, temperature = 0.7, json = false, model }) {
  const provider = getProvider();
  const modelName = model || getModel();

  if (provider === 'anthropic') {
    return chatAnthropic({ messages, temperature, json, model: modelName });
  }

  const client = getOpenAIClient();
  const params = {
    model: modelName,
    messages,
    temperature,
  };

  if (json) {
    params.response_format = { type: 'json_object' };
  }

  const completion = await client.chat.completions.create(params);
  return completion.choices[0]?.message?.content || '';
}

/**
 * Send a streaming chat completion request.
 * Yields string chunks as they arrive.
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {number} [options.temperature=0.7]
 * @param {string} [options.model]
 * @returns {AsyncGenerator<string>}
 */
export async function* chatStream({ messages, temperature = 0.7, model }) {
  const provider = getProvider();
  const modelName = model || getModel();

  if (provider === 'anthropic') {
    yield* chatStreamAnthropic({ messages, temperature, model: modelName });
    return;
  }

  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: modelName,
    messages,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

/**
 * Chat via Anthropic SDK.
 * @param {Object} options
 * @returns {Promise<string>}
 */
async function chatAnthropic({ messages, temperature, json, model }) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Separate system message
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const params = {
    model,
    max_tokens: 4096,
    temperature,
    messages: userMessages,
  };

  if (systemMsg) {
    params.system = systemMsg.content;
  }

  const response = await client.messages.create(params);
  const text = response.content.map(b => b.text).join('');
  return text;
}

/**
 * Streaming chat via Anthropic SDK.
 * @param {Object} options
 * @returns {AsyncGenerator<string>}
 */
async function* chatStreamAnthropic({ messages, temperature, model }) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const params = {
    model,
    max_tokens: 4096,
    temperature,
    messages: userMessages,
    stream: true,
  };

  if (systemMsg) {
    params.system = systemMsg.content;
  }

  const stream = await client.messages.stream(params);

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      yield event.delta.text;
    }
  }
}
