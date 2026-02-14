/**
 * Critic Agent -- argues AGAINST the idea.
 * Uses Perplexity Sonar to find counterevidence.
 *
 * @module lib/agents/critic
 */

import { chat, chatStream } from '../llm.js';
import { findCounterevidence } from '../research/perplexity.js';

const SYSTEM_PROMPT = `You are the CRITIC in a startup idea debate. Your role:

1. Find the STRONGEST objections to this idea
2. Identify real risks: market, technical, competitive, regulatory
3. Point out failed similar startups with specific examples
4. Challenge vague claims made by the advocate -- demand evidence
5. Reference research data and cite sources when available
6. Be tough but constructive -- your job is to stress-test, not just bash

Structure your counterargument clearly with:
- Core vulnerability (1 sentence)  
- Key risks (3-4 specific, evidence-backed objections)
- Failed precedents (similar ideas that didn't work and why)
- Unanswered questions the advocate must address

Keep your response under 400 words. Be specific, not generic.`;

/**
 * Generate a critic counterargument (non-streaming).
 * @param {Object} options
 * @param {string} options.idea
 * @param {string} options.advocateArgument
 * @param {string} [options.context]
 * @param {Object} [options.counterevidence]
 * @returns {Promise<{content: string, citations: import('../types.js').Citation[]}>}
 */
export async function generateCounterargument({ idea, advocateArgument, context = '', counterevidence = null }) {
  if (!counterevidence) {
    try {
      counterevidence = process.env.PERPLEXITY_API_KEY
        ? await findCounterevidence(idea)
        : { summary: '', citations: [] };
    } catch (e) {
      console.error('[Critic] Counterevidence fetch failed:', e.message);
      counterevidence = { summary: '', citations: [] };
    }
  }

  const userPrompt = buildPrompt(idea, advocateArgument, context, counterevidence);

  const content = await chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  return { content, citations: counterevidence?.citations || [] };
}

/**
 * Stream a critic counterargument.
 * @param {Object} options
 * @returns {AsyncGenerator<string>}
 */
export async function* streamCounterargument({ idea, advocateArgument, context = '', counterevidence = null }) {
  if (!counterevidence) {
    try {
      counterevidence = process.env.PERPLEXITY_API_KEY
        ? await findCounterevidence(idea)
        : { summary: '', citations: [] };
    } catch (e) {
      counterevidence = { summary: '', citations: [] };
    }
  }

  const userPrompt = buildPrompt(idea, advocateArgument, context, counterevidence);

  yield* chatStream({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });
}

function buildPrompt(idea, advocateArgument, context, counterevidence) {
  let prompt = `STARTUP IDEA: "${idea}"\n\n`;
  prompt += `ADVOCATE'S ARGUMENT:\n${advocateArgument}\n\n`;

  if (context) {
    prompt += `PREVIOUS DEBATE CONTEXT:\n${context}\n\n`;
  }

  if (counterevidence?.summary) {
    prompt += `COUNTEREVIDENCE RESEARCH:\n${counterevidence.summary.substring(0, 1500)}\n\n`;
  }

  prompt += `Tear this argument apart. Challenge every claim. Find the weaknesses. Be specific.`;
  return prompt;
}
