/**
 * LLM adapter — supports Anthropic, OpenAI, or any OpenAI-compatible API (e.g. Grok).
 *
 * For Grok (xAI): set LLM_PROVIDER=openai-compatible, LLM_BASE_URL=https://api.x.ai/v1,
 * LLM_API_KEY=<your key>, and LLM_MODEL=<e.g. grok-3>.
 *
 * Env: LLM_PROVIDER, LLM_MODEL, LLM_BASE_URL, LLM_API_KEY (openai-compatible);
 * OPENAI_API_KEY (openai); ANTHROPIC_API_KEY (anthropic).
 *
 * @module lib/llm
 */

/**
 * Get the configured provider name.
 * @returns {'anthropic'|'openai'|'openai-compatible'}
 */
function getProvider() {
  return process.env.LLM_PROVIDER || 'anthropic';
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
 * Build an OpenAI client (only used for openai/openai-compatible providers).
 */
function getOpenAIClient() {
  const OpenAI = require('openai').default;
  const provider = getProvider();

  if (provider === 'openai-compatible') {
    return new OpenAI({
      apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || 'dummy',
      baseURL: process.env.LLM_BASE_URL,
    });
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
 * Chat via Anthropic SDK (non-streaming).
 */
async function chatAnthropic({ messages, temperature, json, model }) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Separate system message
  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const params = {
    model,
    max_tokens: 8192,
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
 */
async function* chatStreamAnthropic({ messages, temperature, model }) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemMsg = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const params = {
    model,
    max_tokens: 8192,
    temperature,
    messages: userMessages,
  };

  if (systemMsg) {
    params.system = systemMsg.content;
  }

  const stream = client.messages.stream(params);

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      yield event.delta.text;
    }
  }
}
