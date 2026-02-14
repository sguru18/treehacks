/**
 * Perplexity Sonar API integration for research pipeline
 * @module lib/research/perplexity
 */

/**
 * @typedef {import('../types.js').ResearchResult} ResearchResult
 * @typedef {import('../types.js').Citation} Citation
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Search for prior art and similar products
 * @param {string} idea - The startup idea to research
 * @param {string} [apiKey] - Perplexity API key (from env)
 * @returns {Promise<ResearchResult>}
 */
export async function searchPriorArt(idea, apiKey = null) {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY is required');
  }

  const query = `Find prior art, similar products, and competitors for this startup idea: "${idea}". Include Product Hunt listings, YC companies, GitHub repos, and failed startups. Provide citations.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that finds prior art, competitors, and market information for startup ideas. Always provide citations with URLs.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        return_citations: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message;

    // Extract citations from the response
    const citations = extractCitations(data, message);

    return {
      query,
      summary: message?.content || '',
      citations,
      data: {
        priorArt: extractPriorArt(message?.content || ''),
        competitors: extractCompetitors(message?.content || ''),
      },
    };
  } catch (error) {
    console.error('Perplexity prior art search error:', error);
    throw error;
  }
}

/**
 * Analyze market size and trends
 * @param {string} idea - The startup idea
 * @param {string[]} criteria - Optimization criteria
 * @param {string} [apiKey] - Perplexity API key
 * @returns {Promise<ResearchResult>}
 */
export async function analyzeMarket(idea, criteria = [], apiKey = null) {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY is required');
  }

  const criteriaText = criteria.length > 0 ? ` Criteria: ${criteria.join(', ')}.` : '';
  const query = `Analyze the market size, trends, and growth potential for this startup idea: "${idea}".${criteriaText} Provide market data, TAM/SAM/SOM estimates, and citations.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a market research analyst. Provide detailed market analysis with citations.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        return_citations: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    const citations = extractCitations(data, message);

    return {
      query,
      summary: message?.content || '',
      citations,
      data: {
        marketSize: extractMarketSize(message?.content || ''),
        trends: extractTrends(message?.content || ''),
      },
    };
  } catch (error) {
    console.error('Perplexity market analysis error:', error);
    throw error;
  }
}

/**
 * Find counterevidence and failed startups
 * @param {string} idea - The startup idea
 * @param {string} [apiKey] - Perplexity API key
 * @returns {Promise<ResearchResult>}
 */
export async function findCounterevidence(idea, apiKey = null) {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY is required');
  }

  const query = `Find reasons why this startup idea might fail, similar failed startups, market risks, and counterarguments: "${idea}". Include specific examples of failed companies and why they failed. Provide citations.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a critical analyst that finds risks, failures, and counterarguments. Be thorough and provide citations.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        return_citations: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    const citations = extractCitations(data, message);

    return {
      query,
      summary: message?.content || '',
      citations,
      data: {
        failures: extractFailures(message?.content || ''),
        risks: extractRisks(message?.content || ''),
      },
    };
  } catch (error) {
    console.error('Perplexity counterevidence search error:', error);
    throw error;
  }
}

/**
 * Deep reasoning analysis using sonar-reasoning model
 * @param {string} idea - The startup idea
 * @param {string} context - Additional context about the debate
 * @param {string} [apiKey] - Perplexity API key
 * @returns {Promise<ResearchResult>}
 */
export async function deepReasoning(idea, context, apiKey = null) {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY is required');
  }

  const query = `Perform a deep analysis and reasoning about this startup idea: "${idea}". Context: ${context}. Evaluate feasibility, market fit, and provide a reasoned verdict.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning',
        messages: [
          {
            role: 'system',
            content: 'You are an expert startup evaluator. Provide deep reasoning and analysis with citations.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        return_citations: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    const citations = extractCitations(data, message);

    return {
      query,
      summary: message?.content || '',
      citations,
      data: {
        reasoning: message?.content || '',
      },
    };
  } catch (error) {
    console.error('Perplexity deep reasoning error:', error);
    throw error;
  }
}

/**
 * Extract citations from Perplexity API response
 * @param {Object} data - API response data
 * @param {Object} message - Message object
 * @returns {Citation[]}
 */
function extractCitations(data, message) {
  const citations = [];
  
  // Perplexity returns citations in citations array
  if (data.citations && Array.isArray(data.citations)) {
    data.citations.forEach((cite, index) => {
      citations.push({
        url: cite.url || cite,
        title: cite.title || `Source ${index + 1}`,
        snippet: cite.snippet,
        source: 'perplexity',
      });
    });
  }

  // Also check for citations in the message content
  if (message?.citations) {
    message.citations.forEach((cite) => {
      citations.push({
        url: cite.url || cite,
        title: cite.title || 'Citation',
        source: 'perplexity',
      });
    });
  }

  return citations;
}

/**
 * Extract prior art mentions from text
 * @param {string} text
 * @returns {string[]}
 */
function extractPriorArt(text) {
  // Simple extraction - in production, use more sophisticated parsing
  const matches = text.match(/(?:Product Hunt|YC|Y Combinator|GitHub|similar to|competitor)[^.]*\./gi);
  return matches || [];
}

/**
 * Extract competitor mentions
 * @param {string} text
 * @returns {string[]}
 */
function extractCompetitors(text) {
  const matches = text.match(/(?:competitor|competes with|alternative|similar product)[^.]*\./gi);
  return matches || [];
}

/**
 * Extract market size data
 * @param {string} text
 * @returns {Object}
 */
function extractMarketSize(text) {
  const tamMatch = text.match(/TAM[^:]*:?\s*\$?([\d.]+)\s*(billion|million|B|M)/i);
  const samMatch = text.match(/SAM[^:]*:?\s*\$?([\d.]+)\s*(billion|million|B|M)/i);
  return {
    tam: tamMatch ? tamMatch[0] : null,
    sam: samMatch ? samMatch[0] : null,
  };
}

/**
 * Extract trends
 * @param {string} text
 * @returns {string[]}
 */
function extractTrends(text) {
  const trendMatches = text.match(/(?:trend|growing|increasing|declining)[^.]*\./gi);
  return trendMatches || [];
}

/**
 * Extract failed startup mentions
 * @param {string} text
 * @returns {string[]}
 */
function extractFailures(text) {
  const failureMatches = text.match(/(?:failed|shut down|closed|bankrupt)[^.]*\./gi);
  return failureMatches || [];
}

/**
 * Extract risks
 * @param {string} text
 * @returns {string[]}
 */
function extractRisks(text) {
  const riskMatches = text.match(/(?:risk|challenge|concern|problem)[^.]*\./gi);
  return riskMatches || [];
}
