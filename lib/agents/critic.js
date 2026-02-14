/**
 * Critic Agent - argues AGAINST the idea
 * @module lib/agents/critic
 */

import OpenAI from 'openai';
import { findCounterevidence } from '../research/perplexity.js';

/**
 * @typedef {import('../types.js').AgentResponse} AgentResponse
 * @typedef {import('../types.js').ResearchResult} ResearchResult
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a counterargument AGAINST the idea with research enrichment
 * @param {string} idea - The startup idea
 * @param {string} advocateArgument - The advocate's argument to counter
 * @param {string} [context] - Previous debate context
 * @param {ResearchResult} [counterevidence] - Counterevidence research (optional, will fetch if not provided)
 * @returns {Promise<AgentResponse>}
 */
export async function generateCounterargument(idea, advocateArgument, context = '', counterevidence = null) {
  // Fetch counterevidence if not provided
  if (!counterevidence) {
    try {
      counterevidence = await findCounterevidence(idea);
    } catch (error) {
      console.error('Error fetching counterevidence:', error);
    }
  }

  // Build system prompt
  const systemPrompt = `You are a Critic agent arguing AGAINST a startup idea. Your role is to:
1. Identify weaknesses, risks, and potential failure points
2. Challenge assumptions and claims made by the advocate
3. Find counterexamples and failed similar startups
4. Use research data to support your counterarguments
5. Be critical but constructive - help identify real risks
6. Extract specific claims that can be verified

Always cite sources when using research data.`;

  // Build user prompt with context
  const userPrompt = buildCriticPrompt(idea, advocateArgument, context, counterevidence);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    return {
      content: response.counterargument || response.content || '',
      claims: extractClaims(response.counterargument || response.content || ''),
      citations: counterevidence?.citations || [],
      metadata: {
        model: 'gpt-4o',
        researchUsed: {
          counterevidence: !!counterevidence,
        },
      },
    };
  } catch (error) {
    console.error('Critic agent error:', error);
    throw error;
  }
}

/**
 * Stream a counterargument AGAINST the idea
 * @param {string} idea
 * @param {string} advocateArgument
 * @param {string} context
 * @param {ResearchResult} [counterevidence]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamCounterargument(idea, advocateArgument, context = '', counterevidence = null) {
  // Fetch counterevidence if not provided
  if (!counterevidence) {
    try {
      counterevidence = await findCounterevidence(idea);
    } catch (error) {
      console.error('Error fetching counterevidence:', error);
    }
  }

  const systemPrompt = `You are a Critic agent arguing AGAINST a startup idea. Your role is to:
1. Identify weaknesses, risks, and potential failure points
2. Challenge assumptions and claims made by the advocate
3. Find counterexamples and failed similar startups
4. Use research data to support your counterarguments
5. Be critical but constructive - help identify real risks

Always cite sources when using research data.`;

  const userPrompt = buildCriticPrompt(idea, advocateArgument, context, counterevidence);

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        yield content;
      }
    }

    // After streaming, extract claims and return metadata
    return {
      content: fullContent,
      claims: extractClaims(fullContent),
      citations: counterevidence?.citations || [],
      metadata: {
        model: 'gpt-4o',
        researchUsed: {
          counterevidence: !!counterevidence,
        },
      },
    };
  } catch (error) {
    console.error('Critic streaming error:', error);
    throw error;
  }
}

/**
 * Build the critic prompt with context and research
 * @param {string} idea
 * @param {string} advocateArgument
 * @param {string} context
 * @param {ResearchResult} [counterevidence]
 * @returns {string}
 */
function buildCriticPrompt(idea, advocateArgument, context, counterevidence) {
  let prompt = `Argue AGAINST this startup idea: "${idea}"\n\n`;

  prompt += `The Advocate's argument:\n${advocateArgument}\n\n`;

  if (context) {
    prompt += `Previous debate context:\n${context}\n\n`;
  }

  if (counterevidence) {
    prompt += `Counterevidence Research:\n${counterevidence.summary}\n\n`;
    if (counterevidence.citations.length > 0) {
      prompt += `Sources:\n${counterevidence.citations.map(c => `- ${c.title}: ${c.url}`).join('\n')}\n\n`;
    }
  }

  prompt += `Provide a critical counterargument. Challenge the advocate's claims. Use the research to find risks, failures, and weaknesses. Be specific and cite sources.`;

  return prompt;
}

/**
 * Extract claims from text
 * @param {string} text
 * @returns {string[]}
 */
function extractClaims(text) {
  // Simple extraction - look for statements that can be verified
  const claims = [];
  
  // Look for sentences that make factual claims
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    // Look for claims (statements with risks, failures, or factual assertions)
    if (trimmed.match(/\b(failed|risk|problem|challenge|concern|evidence|data|study|research|competitor|market)\b/i)) {
      claims.push(trimmed);
    }
  });

  return claims.slice(0, 5); // Limit to top 5 claims
}
