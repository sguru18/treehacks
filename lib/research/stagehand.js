/**
 * Stagehand/Browserbase integration for web scraping validation
 * @module lib/research/stagehand
 */

/**
 * @typedef {import('../types.js').Citation} Citation
 */

const BROWSERBASE_API_URL = 'https://api.browserbase.com/v1';
const STAGEHAND_API_URL = 'https://api.stagehand.tech/v1';

/**
 * Scrape a competitor's website for pricing and features
 * @param {string} url - URL to scrape
 * @param {string} [apiKey] - Browserbase API key
 * @returns {Promise<Object>}
 */
export async function scrapeCompetitor(url, apiKey = null) {
  const key = apiKey || process.env.BROWSERBASE_API_KEY;
  if (!key) {
    throw new Error('BROWSERBASE_API_KEY is required');
  }

  try {
    // Create a browser session
    const sessionResponse = await fetch(`${BROWSERBASE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error(`Browserbase API error: ${sessionResponse.statusText}`);
    }

    const session = await sessionResponse.json();
    const sessionId = session.id;

    // Use Stagehand to automate the scraping
    const stagehandKey = process.env.STAGEHAND_API_KEY;
    if (stagehandKey) {
      return await scrapeWithStagehand(url, sessionId, stagehandKey);
    }

    // Fallback: simple page content extraction
    return await extractPageContent(sessionId, key);
  } catch (error) {
    console.error('Stagehand scraping error:', error);
    throw error;
  }
}

/**
 * Scrape using Stagehand automation
 * @param {string} url
 * @param {string} sessionId
 * @param {string} apiKey
 * @returns {Promise<Object>}
 */
async function scrapeWithStagehand(url, sessionId, apiKey) {
  try {
    const response = await fetch(`${STAGEHAND_API_URL}/automate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        url,
        instructions: `Extract pricing information, feature lists, and key product details from this page. Return structured JSON with: pricing, features, targetAudience, and keyDifferentiators.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stagehand API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url,
      pricing: data.pricing || null,
      features: data.features || [],
      targetAudience: data.targetAudience || null,
      keyDifferentiators: data.keyDifferentiators || [],
      screenshot: data.screenshot || null,
      source: 'stagehand',
    };
  } catch (error) {
    console.error('Stagehand automation error:', error);
    // Fallback to manual extraction
    return await extractPageContent(sessionId, process.env.BROWSERBASE_API_KEY);
  }
}

/**
 * Extract page content manually
 * @param {string} sessionId
 * @param {string} apiKey
 * @returns {Promise<Object>}
 */
async function extractPageContent(sessionId, apiKey) {
  try {
    const response = await fetch(`${BROWSERBASE_API_URL}/sessions/${sessionId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Browserbase content error: ${response.statusText}`);
    }

    const content = await response.json();
    
    // Simple extraction from HTML/text
    return {
      url: content.url || '',
      content: content.text || content.html || '',
      title: content.title || '',
      source: 'browserbase',
    };
  } catch (error) {
    console.error('Content extraction error:', error);
    throw error;
  }
}

/**
 * Search Product Hunt for similar products
 * @param {string} query - Search query
 * @param {string} [apiKey] - Browserbase API key
 * @returns {Promise<Object>}
 */
export async function searchProductHunt(query, apiKey = null) {
  const key = apiKey || process.env.BROWSERBASE_API_KEY;
  if (!key) {
    throw new Error('BROWSERBASE_API_KEY is required');
  }

  const searchUrl = `https://www.producthunt.com/search?q=${encodeURIComponent(query)}`;

  try {
    const sessionResponse = await fetch(`${BROWSERBASE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error(`Browserbase API error: ${sessionResponse.statusText}`);
    }

    const session = await sessionResponse.json();
    const sessionId = session.id;

    // Use Stagehand to extract Product Hunt results
    const stagehandKey = process.env.STAGEHAND_API_KEY;
    if (stagehandKey) {
      const response = await fetch(`${STAGEHAND_API_URL}/automate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stagehandKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          url: searchUrl,
          instructions: `Extract Product Hunt search results. For each product, get: name, tagline, upvotes, launch date, and product URL. Return as JSON array.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          query,
          results: data.results || [],
          source: 'stagehand',
        };
      }
    }

    // Fallback
    const content = await extractPageContent(sessionId, key);
    return {
      query,
      results: parseProductHuntResults(content.content || ''),
      source: 'browserbase',
    };
  } catch (error) {
    console.error('Product Hunt search error:', error);
    throw error;
  }
}

/**
 * Scrape GitHub for similar projects
 * @param {string} query - Search query
 * @param {string} [apiKey] - Browserbase API key
 * @returns {Promise<Object>}
 */
export async function searchGitHub(query, apiKey = null) {
  const key = apiKey || process.env.BROWSERBASE_API_KEY;
  if (!key) {
    throw new Error('BROWSERBASE_API_KEY is required');
  }

  const searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;

  try {
    const sessionResponse = await fetch(`${BROWSERBASE_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error(`Browserbase API error: ${sessionResponse.statusText}`);
    }

    const session = await sessionResponse.json();
    const sessionId = session.id;

    const stagehandKey = process.env.STAGEHAND_API_KEY;
    if (stagehandKey) {
      const response = await fetch(`${STAGEHAND_API_URL}/automate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stagehandKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          url: searchUrl,
          instructions: `Extract GitHub repository search results. For each repo, get: name, description, stars, language, and repo URL. Return as JSON array.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          query,
          repositories: data.repositories || [],
          source: 'stagehand',
        };
      }
    }

    const content = await extractPageContent(sessionId, key);
    return {
      query,
      repositories: parseGitHubResults(content.content || ''),
      source: 'browserbase',
    };
  } catch (error) {
    console.error('GitHub search error:', error);
    throw error;
  }
}

/**
 * Validate a specific claim by scraping relevant URLs
 * @param {string} claim - The claim to validate
 * @param {string[]} urls - URLs to check
 * @param {string} [apiKey] - Browserbase API key
 * @returns {Promise<Object>}
 */
export async function validateClaim(claim, urls, apiKey = null) {
  const key = apiKey || process.env.BROWSERBASE_API_KEY;
  if (!key) {
    throw new Error('BROWSERBASE_API_KEY is required');
  }

  const results = [];

  for (const url of urls) {
    try {
      const data = await scrapeCompetitor(url, key);
      results.push({
        url,
        data,
        claimRelevant: checkClaimRelevance(claim, data),
      });
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      results.push({
        url,
        error: error.message,
      });
    }
  }

  return {
    claim,
    urls,
    results,
    verified: results.some(r => r.claimRelevant),
  };
}

/**
 * Check if scraped data is relevant to the claim
 * @param {string} claim
 * @param {Object} data
 * @returns {boolean}
 */
function checkClaimRelevance(claim, data) {
  const claimLower = claim.toLowerCase();
  const dataText = JSON.stringify(data).toLowerCase();
  return dataText.includes(claimLower) || 
         claimLower.split(' ').some(word => word.length > 3 && dataText.includes(word));
}

/**
 * Parse Product Hunt results from HTML/text
 * @param {string} content
 * @returns {Array}
 */
function parseProductHuntResults(content) {
  // Simple parsing - in production, use more sophisticated HTML parsing
  const results = [];
  const productMatches = content.match(/<article[^>]*>[\s\S]*?<\/article>/gi);
  
  if (productMatches) {
    productMatches.forEach((match, index) => {
      const nameMatch = match.match(/<h3[^>]*>([^<]+)<\/h3>/i);
      const taglineMatch = match.match(/<p[^>]*>([^<]+)<\/p>/i);
      
      results.push({
        name: nameMatch ? nameMatch[1] : `Product ${index + 1}`,
        tagline: taglineMatch ? taglineMatch[1] : '',
        upvotes: null,
        launchDate: null,
        url: null,
      });
    });
  }
  
  return results;
}

/**
 * Parse GitHub results from HTML/text
 * @param {string} content
 * @returns {Array}
 */
function parseGitHubResults(content) {
  const repositories = [];
  const repoMatches = content.match(/<li[^>]*class="repo-list-item"[^>]*>[\s\S]*?<\/li>/gi);
  
  if (repoMatches) {
    repoMatches.forEach((match, index) => {
      const nameMatch = match.match(/<a[^>]*>([^<]+)<\/a>/i);
      const descMatch = match.match(/<p[^>]*>([^<]+)<\/p>/i);
      
      repositories.push({
        name: nameMatch ? nameMatch[1] : `Repo ${index + 1}`,
        description: descMatch ? descMatch[1] : '',
        stars: null,
        language: null,
        url: null,
      });
    });
  }
  
  return repositories;
}
