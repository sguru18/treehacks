/**
 * Stagehand / Browserbase integration for live web scraping.
 * Uses the real @browserbasehq/stagehand SDK.
 * Falls back to mock data when BROWSERBASE_API_KEY is not set.
 *
 * @module lib/research/stagehand
 */

import { getMockProductHunt, getMockGitHub, getMockCompetitor } from './mock.js';

/**
 * @typedef {import('../types.js').Citation} Citation
 */

/**
 * Check if Stagehand/Browserbase credentials are available.
 * @returns {boolean}
 */
function hasCredentials() {
  return !!(process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID);
}

/**
 * Create a Stagehand instance connected to Browserbase.
 * Dynamically imports @browserbasehq/stagehand to avoid build errors when not installed.
 * @returns {Promise<Object>} stagehand instance
 */
async function createStagehand() {
  const { Stagehand } = await import('@browserbasehq/stagehand');

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    modelName: 'gpt-4o',
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();
  return stagehand;
}

/**
 * Scrape Product Hunt for similar products.
 * @param {string} query
 * @returns {Promise<Object>}
 */
export async function scrapeProductHunt(query) {
  if (!hasCredentials()) {
    console.log('[Stagehand] No credentials, using mock data for Product Hunt');
    return getMockProductHunt(query);
  }

  let stagehand;
  try {
    stagehand = await createStagehand();
    const page = stagehand.page;

    await page.goto(`https://www.producthunt.com/search?q=${encodeURIComponent(query)}`);
    await page.waitForTimeout(2000);

    const results = await page.extract({
      instruction: `Extract the top 5 product search results. For each, get: product name, tagline, upvote count, and product URL.`,
      schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                tagline: { type: 'string' },
                upvotes: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return {
      query,
      results: results.products || [],
      source: 'stagehand',
    };
  } catch (error) {
    console.error('[Stagehand] Product Hunt scrape error:', error.message);
    return getMockProductHunt(query);
  } finally {
    if (stagehand) {
      await stagehand.close().catch(() => {});
    }
  }
}

/**
 * Scrape GitHub for similar open-source projects.
 * @param {string} query
 * @returns {Promise<Object>}
 */
export async function scrapeGitHub(query) {
  if (!hasCredentials()) {
    console.log('[Stagehand] No credentials, using mock data for GitHub');
    return getMockGitHub(query);
  }

  let stagehand;
  try {
    stagehand = await createStagehand();
    const page = stagehand.page;

    await page.goto(`https://github.com/search?q=${encodeURIComponent(query)}&type=repositories&sort=stars`);
    await page.waitForTimeout(2000);

    const results = await page.extract({
      instruction: `Extract the top 5 repository results. For each, get: repo name (owner/repo format), description, star count, primary language, and repo URL.`,
      schema: {
        type: 'object',
        properties: {
          repositories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                stars: { type: 'string' },
                language: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return {
      query,
      repositories: results.repositories || [],
      source: 'stagehand',
    };
  } catch (error) {
    console.error('[Stagehand] GitHub scrape error:', error.message);
    return getMockGitHub(query);
  } finally {
    if (stagehand) {
      await stagehand.close().catch(() => {});
    }
  }
}

/**
 * Scrape a competitor website for pricing and feature info.
 * @param {string} url
 * @returns {Promise<Object>}
 */
export async function scrapeCompetitor(url) {
  if (!hasCredentials()) {
    console.log('[Stagehand] No credentials, using mock data for competitor');
    return getMockCompetitor(url);
  }

  let stagehand;
  try {
    stagehand = await createStagehand();
    const page = stagehand.page;

    await page.goto(url);
    await page.waitForTimeout(3000);

    const results = await page.extract({
      instruction: `Extract key business information from this page: pricing plans (names and prices), main features, target audience, and any differentiators. Also extract the page title and main heading.`,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          pricing: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                plan: { type: 'string' },
                price: { type: 'string' },
              },
            },
          },
          features: { type: 'array', items: { type: 'string' } },
          targetAudience: { type: 'string' },
          differentiators: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return {
      url,
      ...results,
      source: 'stagehand',
    };
  } catch (error) {
    console.error('[Stagehand] Competitor scrape error:', error.message);
    return getMockCompetitor(url);
  } finally {
    if (stagehand) {
      await stagehand.close().catch(() => {});
    }
  }
}
