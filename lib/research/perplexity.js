/**
 * Perplexity Sonar API integration.
 * Provides grounded web search with real citations.
 *
 * @module lib/research/perplexity
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * @typedef {import('../types.js').Citation} Citation
 * @typedef {import('../types.js').ResearchResult} ResearchResult
 */

/**
 * Low-level Perplexity Sonar call.
 * @param {Object} options
 * @param {string} options.systemPrompt
 * @param {string} options.userPrompt
 * @param {string} [options.model='sonar'] - "sonar" or "sonar-pro"
 * @returns {Promise<{content: string, citations: Citation[]}>}
 */
async function querySonar({ systemPrompt, userPrompt, model = 'sonar' }) {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY is required');
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Perplexity API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const content = message?.content || '';

  // Perplexity returns citations at the top level of the response
  const citations = [];
  if (Array.isArray(data.citations)) {
    data.citations.forEach((cite, i) => {
      if (typeof cite === 'string') {
        citations.push({ url: cite, title: `Source ${i + 1}`, source: 'perplexity' });
      } else {
        citations.push({
          url: cite.url || cite,
          title: cite.title || `Source ${i + 1}`,
          snippet: cite.snippet || undefined,
          source: 'perplexity',
        });
      }
    });
  }

  return { content, citations };
}

/**
 * Search for prior art, similar products, competitors.
 * @param {string} idea
 * @returns {Promise<ResearchResult>}
 */
export async function searchPriorArt(idea) {
  const systemPrompt = `You are a startup research analyst. Find prior art, similar products, and competitors. 
Look for: Product Hunt listings, YC companies, GitHub repos, and failed startups in this space.
Be specific -- include company names, URLs, funding amounts, and launch dates where possible.
Structure your response with clear sections: COMPETITORS, PRIOR ART, FAILED ATTEMPTS.`;

  const userPrompt = `Find all prior art and competitors for this startup idea: "${idea}"`;

  const { content, citations } = await querySonar({
    systemPrompt,
    userPrompt,
    model: 'sonar-pro',
  });

  return { query: userPrompt, summary: content, citations };
}

/**
 * Analyze market size, trends, and opportunity.
 * @param {string} idea
 * @param {string[]} [criteria]
 * @returns {Promise<ResearchResult>}
 */
export async function analyzeMarket(idea, criteria = []) {
  const criteriaStr = criteria.length > 0 ? `\nOptimization criteria: ${criteria.join(', ')}` : '';

  const systemPrompt = `You are a market research analyst. Provide data-driven market analysis.
Include: TAM/SAM/SOM estimates with sources, growth rates, key trends, regulatory factors.
Use real numbers and cite your sources.`;

  const userPrompt = `Analyze the market for this startup idea: "${idea}"${criteriaStr}`;

  const { content, citations } = await querySonar({
    systemPrompt,
    userPrompt,
    model: 'sonar-pro',
  });

  return { query: userPrompt, summary: content, citations };
}

/**
 * Find counterevidence -- reasons the idea might fail.
 * @param {string} idea
 * @returns {Promise<ResearchResult>}
 */
export async function findCounterevidence(idea) {
  const systemPrompt = `You are a critical startup analyst. Find reasons this idea might fail.
Look for: failed similar startups (with post-mortems), market risks, technical challenges, 
regulatory hurdles, and strong existing competitors that would crush a newcomer.
Be brutally honest and cite specific examples.`;

  const userPrompt = `Find counterevidence and failure risks for: "${idea}"`;

  const { content, citations } = await querySonar({
    systemPrompt,
    userPrompt,
    model: 'sonar-pro',
  });

  return { query: userPrompt, summary: content, citations };
}

/**
 * Verify specific claims by searching for evidence.
 * @param {string[]} claims - Claims to verify
 * @param {string} context - Additional context
 * @returns {Promise<ResearchResult>}
 */
export async function verifyClaims(claims, context) {
  const systemPrompt = `You are a fact-checker. For each claim, find supporting or contradicting evidence.
Rate each claim as VERIFIED, UNVERIFIED, or CONTRADICTED.
Cite specific sources for each verification.`;

  const claimsList = claims.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const userPrompt = `Verify these claims about a startup idea:\n${claimsList}\n\nContext: ${context}`;

  const { content, citations } = await querySonar({
    systemPrompt,
    userPrompt,
    model: 'sonar',
  });

  return { query: userPrompt, summary: content, citations };
}
