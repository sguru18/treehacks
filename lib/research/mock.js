/**
 * Mock research data for demo mode when API keys are not available.
 * Provides realistic-looking fallback data so the app still works.
 *
 * @module lib/research/mock
 */

/**
 * Mock Product Hunt results.
 * @param {string} query
 * @returns {Object}
 */
export function getMockProductHunt(query) {
  return {
    query,
    results: [
      {
        name: 'Similar Product Alpha',
        tagline: `AI-powered tool related to "${query.substring(0, 30)}..."`,
        upvotes: '342',
        url: 'https://producthunt.com/posts/example',
      },
      {
        name: 'Competitor Beta',
        tagline: 'Another approach to the same problem space',
        upvotes: '187',
        url: 'https://producthunt.com/posts/example-2',
      },
    ],
    source: 'mock',
    _note: 'Mock data -- set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID for real scraping',
  };
}

/**
 * Mock GitHub results.
 * @param {string} query
 * @returns {Object}
 */
export function getMockGitHub(query) {
  return {
    query,
    repositories: [
      {
        name: 'open-source/related-project',
        description: `Open-source project related to "${query.substring(0, 30)}..."`,
        stars: '1.2k',
        language: 'Python',
        url: 'https://github.com/example/repo',
      },
      {
        name: 'another/similar-tool',
        description: 'Similar functionality implemented differently',
        stars: '456',
        language: 'JavaScript',
        url: 'https://github.com/example/repo-2',
      },
    ],
    source: 'mock',
    _note: 'Mock data -- set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID for real scraping',
  };
}

/**
 * Mock competitor scrape.
 * @param {string} url
 * @returns {Object}
 */
export function getMockCompetitor(url) {
  return {
    url,
    title: 'Competitor Website',
    pricing: [
      { plan: 'Free', price: '$0/mo' },
      { plan: 'Pro', price: '$29/mo' },
      { plan: 'Enterprise', price: 'Custom' },
    ],
    features: [
      'Core feature set',
      'API access',
      'Integrations',
      'Analytics dashboard',
    ],
    targetAudience: 'Small to medium businesses',
    differentiators: ['Established brand', 'Large user base'],
    source: 'mock',
    _note: 'Mock data -- set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID for real scraping',
  };
}

/**
 * Mock Perplexity prior art results.
 * @param {string} idea
 * @returns {Object}
 */
export function getMockPriorArt(idea) {
  return {
    query: `Prior art for: ${idea}`,
    summary: `[Mock] Several companies have attempted similar approaches to "${idea.substring(0, 50)}...". Key competitors include established players in the space. Market research suggests moderate competition with room for differentiation.`,
    citations: [
      {
        url: 'https://example.com/competitor-1',
        title: 'Related Company Analysis',
        source: 'perplexity',
      },
    ],
    _note: 'Mock data -- set PERPLEXITY_API_KEY for real research',
  };
}

/**
 * Mock market analysis.
 * @param {string} idea
 * @returns {Object}
 */
export function getMockMarketAnalysis(idea) {
  return {
    query: `Market analysis for: ${idea}`,
    summary: `[Mock] The addressable market for "${idea.substring(0, 50)}..." is estimated at $2-5B TAM with a 15% CAGR. Key trends include increasing AI adoption and growing demand for automation tools.`,
    citations: [
      {
        url: 'https://example.com/market-report',
        title: 'Market Research Report',
        source: 'perplexity',
      },
    ],
    _note: 'Mock data -- set PERPLEXITY_API_KEY for real research',
  };
}
