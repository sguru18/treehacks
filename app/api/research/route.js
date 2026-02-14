import { NextResponse } from 'next/server';
import { searchPriorArt, analyzeMarket, findCounterevidence, verifyClaims } from '@/lib/research/perplexity.js';
import { scrapeProductHunt, scrapeGitHub, scrapeCompetitor } from '@/lib/research/stagehand.js';

/**
 * POST /api/research -- unified research endpoint
 * Body: { type: "prior-art" | "market" | "counter" | "verify" | "producthunt" | "github" | "competitor", ... }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case 'prior-art': {
        const result = await searchPriorArt(body.idea);
        return NextResponse.json(result);
      }
      case 'market': {
        const result = await analyzeMarket(body.idea, body.criteria);
        return NextResponse.json(result);
      }
      case 'counter': {
        const result = await findCounterevidence(body.idea);
        return NextResponse.json(result);
      }
      case 'verify': {
        const result = await verifyClaims(body.claims, body.context);
        return NextResponse.json(result);
      }
      case 'producthunt': {
        const result = await scrapeProductHunt(body.query);
        return NextResponse.json(result);
      }
      case 'github': {
        const result = await scrapeGitHub(body.query);
        return NextResponse.json(result);
      }
      case 'competitor': {
        const result = await scrapeCompetitor(body.url);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: `Unknown research type: ${type}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json({ error: 'Research failed', details: error.message }, { status: 500 });
  }
}
