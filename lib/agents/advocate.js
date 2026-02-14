/**
 * Advocate Agent -- argues FOR the idea.
 * Uses Perplexity Sonar for research enrichment.
 *
 * @module lib/agents/advocate
 */

import { chat, chatStream } from '../llm.js';
import { searchPriorArt, analyzeMarket } from '../research/perplexity.js';
import { getMockPriorArt, getMockMarketAnalysis } from '../research/mock.js';

const SYSTEM_PROMPT = `You are the ADVOCATE in a startup idea debate. Your role:

1. Build the STRONGEST possible case FOR this idea
2. Identify real market opportunities with specific data
3. Counter the critic's objections with evidence and reasoning
4. Highlight unique advantages, timing, and moats
5. Reference research data and cite sources when available
6. Be passionate but intellectually honest -- don't make things up

Structure your argument clearly with:
- Key thesis (1 sentence)
- Supporting arguments (3-4 points with evidence)
- Why now? (timing advantage)
- Addressable counterarguments

Keep your response under 400 words. Be specific, not generic.`;

/**
 * Generate an advocate argument (non-streaming).
 * @param {Object} options
 * @param {string} options.idea
 * @param {string[]} [options.criteria]
 * @param {string} [options.context] - Previous debate context
 * @param {Object} [options.research] - Pre-fetched research
 * @returns {Promise<{content: string, citations: import('../types.js').Citation[]}>}
 */
export async function generateArgument({ idea, criteria = [], context = '', research = null }) {
  // Fetch research if not provided
  let priorArt = research?.priorArt;
  let market = research?.market;

  if (!priorArt) {
    try {
      priorArt = process.env.PERPLEXITY_API_KEY
        ? await searchPriorArt(idea)
        : getMockPriorArt(idea);
    } catch (e) {
      console.error('[Advocate] Prior art fetch failed:', e.message);
      priorArt = getMockPriorArt(idea);
    }
  }

  if (!market) {
    try {
      market = process.env.PERPLEXITY_API_KEY
        ? await analyzeMarket(idea, criteria)
        : getMockMarketAnalysis(idea);
    } catch (e) {
      console.error('[Advocate] Market fetch failed:', e.message);
      market = getMockMarketAnalysis(idea);
    }
  }

  const userPrompt = buildPrompt(idea, criteria, context, priorArt, market);

  const content = await chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  const citations = [
    ...(priorArt?.citations || []),
    ...(market?.citations || []),
  ];

  return { content, citations };
}

/**
 * Stream an advocate argument.
 * @param {Object} options
 * @param {string} options.idea
 * @param {string[]} [options.criteria]
 * @param {string} [options.context]
 * @param {Object} [options.research]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamArgument({ idea, criteria = [], context = '', research = null }) {
  let priorArt = research?.priorArt;
  let market = research?.market;

  if (!priorArt) {
    try {
      priorArt = process.env.PERPLEXITY_API_KEY
        ? await searchPriorArt(idea)
        : getMockPriorArt(idea);
    } catch (e) {
      priorArt = getMockPriorArt(idea);
    }
  }

  if (!market) {
    try {
      market = process.env.PERPLEXITY_API_KEY
        ? await analyzeMarket(idea, criteria)
        : getMockMarketAnalysis(idea);
    } catch (e) {
      market = getMockMarketAnalysis(idea);
    }
  }

  const userPrompt = buildPrompt(idea, criteria, context, priorArt, market);

  yield* chatStream({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });
}

/**
 * Build the user prompt with context and research.
 */
function buildPrompt(idea, criteria, context, priorArt, market) {
  let prompt = `STARTUP IDEA: "${idea}"\n\n`;

  if (criteria.length > 0) {
    prompt += `OPTIMIZATION CRITERIA:\n${criteria.map(c => `- ${c}`).join('\n')}\n\n`;
  }

  if (context) {
    prompt += `PREVIOUS DEBATE CONTEXT:\n${context}\n\n`;
  }

  if (priorArt?.summary) {
    prompt += `PRIOR ART RESEARCH:\n${priorArt.summary.substring(0, 1500)}\n\n`;
  }

  if (market?.summary) {
    prompt += `MARKET ANALYSIS:\n${market.summary.substring(0, 1500)}\n\n`;
  }

  prompt += `Make your strongest argument FOR this idea. Be specific, cite data, and address known competitors.`;
  return prompt;
}
