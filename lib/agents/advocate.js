/**
 * Advocate Agent - argues FOR the idea
 * @module lib/agents/advocate
 */

import OpenAI from 'openai';
import { searchPriorArt, analyzeMarket } from '../research/perplexity.js';

/**
 * @typedef {import('../types.js').AgentResponse} AgentResponse
 * @typedef {import('../types.js').DebateNode} DebateNode
 * @typedef {import('../types.js').ResearchResult} ResearchResult
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an argument FOR the idea with research enrichment
 * @param {string} idea - The startup idea
 * @param {string[]} criteria - Optimization criteria
 * @param {string} [context] - Previous debate context
 * @param {ResearchResult} [priorArt] - Prior art research (optional, will fetch if not provided)
 * @param {ResearchResult} [marketData] - Market analysis (optional, will fetch if not provided)
 * @returns {Promise<AgentResponse>}
 */
export async function generateArgument(idea, criteria = [], context = '', priorArt = null, marketData = null) {
  // Fetch research if not provided
  if (!priorArt) {
    try {
      priorArt = await searchPriorArt(idea);
    } catch (error) {
      console.error('Error fetching prior art:', error);
    }
  }

  if (!marketData) {
    try {
      marketData = await analyzeMarket(idea, criteria);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }

  // Build system prompt
  const systemPrompt = `You are an Advocate agent arguing FOR a startup idea. Your role is to:
1. Present compelling arguments for why this idea is viable
2. Highlight market opportunities and strengths
3. Address potential concerns proactively
4. Use research data to support your claims
5. Be enthusiastic but realistic
6. Extract specific claims that can be verified

Always cite sources when using research data.`;

  // Build user prompt with context
  const userPrompt = buildAdvocatePrompt(idea, criteria, context, priorArt, marketData);

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
      content: response.argument || response.content || '',
      claims: extractClaims(response.argument || response.content || ''),
      citations: combineCitations(priorArt, marketData),
      metadata: {
        model: 'gpt-4o',
        researchUsed: {
          priorArt: !!priorArt,
          marketData: !!marketData,
        },
      },
    };
  } catch (error) {
    console.error('Advocate agent error:', error);
    throw error;
  }
}

/**
 * Stream an argument FOR the idea
 * @param {string} idea
 * @param {string[]} criteria
 * @param {string} context
 * @param {ResearchResult} [priorArt]
 * @param {ResearchResult} [marketData]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamArgument(idea, criteria = [], context = '', priorArt = null, marketData = null) {
  // Fetch research if not provided
  if (!priorArt) {
    try {
      priorArt = await searchPriorArt(idea);
    } catch (error) {
      console.error('Error fetching prior art:', error);
    }
  }

  if (!marketData) {
    try {
      marketData = await analyzeMarket(idea, criteria);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }

  const systemPrompt = `You are an Advocate agent arguing FOR a startup idea. Your role is to:
1. Present compelling arguments for why this idea is viable
2. Highlight market opportunities and strengths
3. Address potential concerns proactively
4. Use research data to support your claims
5. Be enthusiastic but realistic

Always cite sources when using research data.`;

  const userPrompt = buildAdvocatePrompt(idea, criteria, context, priorArt, marketData);

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
      citations: combineCitations(priorArt, marketData),
      metadata: {
        model: 'gpt-4o',
        researchUsed: {
          priorArt: !!priorArt,
          marketData: !!marketData,
        },
      },
    };
  } catch (error) {
    console.error('Advocate streaming error:', error);
    throw error;
  }
}

/**
 * Build the advocate prompt with context and research
 * @param {string} idea
 * @param {string[]} criteria
 * @param {string} context
 * @param {ResearchResult} [priorArt]
 * @param {ResearchResult} [marketData]
 * @returns {string}
 */
function buildAdvocatePrompt(idea, criteria, context, priorArt, marketData) {
  let prompt = `Argue FOR this startup idea: "${idea}"\n\n`;

  if (criteria.length > 0) {
    prompt += `Optimization Criteria:\n${criteria.map(c => `- ${c}`).join('\n')}\n\n`;
  }

  if (context) {
    prompt += `Previous debate context:\n${context}\n\n`;
  }

  if (priorArt) {
    prompt += `Prior Art Research:\n${priorArt.summary}\n\n`;
    if (priorArt.citations.length > 0) {
      prompt += `Sources:\n${priorArt.citations.map(c => `- ${c.title}: ${c.url}`).join('\n')}\n\n`;
    }
  }

  if (marketData) {
    prompt += `Market Analysis:\n${marketData.summary}\n\n`;
    if (marketData.citations.length > 0) {
      prompt += `Sources:\n${marketData.citations.map(c => `- ${c.title}: ${c.url}`).join('\n')}\n\n`;
    }
  }

  prompt += `Provide a compelling argument FOR this idea. Use the research to support your claims. Be specific and cite sources.`;

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
    // Look for claims (statements with numbers, comparisons, or factual assertions)
    if (trimmed.match(/\b(market|size|growth|revenue|users|customers|competitors|proven|evidence|data|study|research)\b/i)) {
      claims.push(trimmed);
    }
  });

  return claims.slice(0, 5); // Limit to top 5 claims
}

/**
 * Combine citations from multiple research results
 * @param {ResearchResult} [priorArt]
 * @param {ResearchResult} [marketData]
 * @returns {Array}
 */
function combineCitations(priorArt, marketData) {
  const citations = [];
  
  if (priorArt?.citations) {
    citations.push(...priorArt.citations);
  }
  
  if (marketData?.citations) {
    citations.push(...marketData.citations);
  }

  // Deduplicate by URL
  const seen = new Set();
  return citations.filter(cite => {
    if (seen.has(cite.url)) {
      return false;
    }
    seen.add(cite.url);
    return true;
  });
}
