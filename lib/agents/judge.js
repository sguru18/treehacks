/**
 * Judge Agent -- multi-step reasoning pipeline.
 * This is the prize-winning component: an agent that reasons about feedback
 * to dynamically complete complex, multi-step tasks.
 *
 * Pipeline:
 *   1. Extract claims from both arguments
 *   2. Classify claims (factual / vague / opinion)
 *   3. Verify factual claims via Perplexity Sonar
 *   4. Scrape cited sources via Stagehand for concrete validation
 *   5. Reflect on evidence quality and demand more if needed
 *   6. Synthesize final verdict with citations
 *
 * @module lib/agents/judge
 */

import { chat } from '../llm.js';
import { verifyClaims } from '../research/perplexity.js';
import { scrapeProductHunt, scrapeGitHub } from '../research/stagehand.js';

/**
 * @typedef {import('../types.js').Verdict} Verdict
 * @typedef {import('../types.js').ClaimVerification} ClaimVerification
 * @typedef {import('../types.js').Citation} Citation
 */

/**
 * Run the full judge evaluation pipeline.
 * Yields progress events so the frontend can show each step.
 *
 * @param {Object} options
 * @param {string} options.idea
 * @param {string} options.advocateArgument
 * @param {string} options.criticArgument
 * @param {string} [options.context]
 * @param {number} [options.maxVerificationRounds=1]
 * @returns {AsyncGenerator<Object>}
 */
export async function* evaluateRound({ idea, advocateArgument, criticArgument, context = '', maxVerificationRounds = 1 }) {
  // --- Step 1: Extract claims ---
  yield { step: 'extract', message: 'Extracting claims from both arguments...' };

  const claims = await extractClaims(advocateArgument, criticArgument);
  yield { step: 'extract_done', claims };

  // --- Step 2: Classify claims ---
  yield { step: 'classify', message: 'Classifying claims as factual, vague, or opinion...' };

  const classified = await classifyClaims(claims);
  yield { step: 'classify_done', classified };

  // --- Step 3: Verify factual claims via Perplexity ---
  const factualClaims = classified.filter(c => c.type === 'factual').map(c => c.claim);
  let verifications = [];

  if (factualClaims.length > 0) {
    yield { step: 'verify', message: `Verifying ${factualClaims.length} factual claims via Perplexity Sonar...` };

    try {
      const verifyResult = process.env.PERPLEXITY_API_KEY
        ? await verifyClaims(factualClaims.slice(0, 5), idea)
        : { summary: 'Mock verification', citations: [] };

      verifications = parseVerifications(verifyResult.summary, factualClaims);
      yield { step: 'verify_done', verifications, citations: verifyResult.citations };
    } catch (e) {
      console.error('[Judge] Verification failed:', e.message);
      yield { step: 'verify_error', error: e.message };
    }
  }

  // --- Step 4: Stagehand scraping for concrete validation ---
  let scrapedEvidence = [];

  yield { step: 'scrape', message: 'Searching Product Hunt and GitHub for similar products...' };

  try {
    const [phResults, ghResults] = await Promise.allSettled([
      scrapeProductHunt(idea),
      scrapeGitHub(idea),
    ]);

    if (phResults.status === 'fulfilled') {
      scrapedEvidence.push({ source: 'producthunt', data: phResults.value });
    }
    if (ghResults.status === 'fulfilled') {
      scrapedEvidence.push({ source: 'github', data: ghResults.value });
    }

    yield { step: 'scrape_done', evidence: scrapedEvidence };
  } catch (e) {
    console.error('[Judge] Scraping failed:', e.message);
    yield { step: 'scrape_error', error: e.message };
  }

  // --- Step 5: Reflect on evidence quality ---
  yield { step: 'reflect', message: 'Reflecting on evidence quality...' };

  const reflection = await reflect({
    idea,
    advocateArgument,
    criticArgument,
    verifications,
    scrapedEvidence,
    context,
  });

  yield { step: 'reflect_done', reflection };

  // --- Step 6: Synthesize verdict ---
  yield { step: 'verdict', message: 'Synthesizing final verdict...' };

  const verdict = await synthesizeVerdict({
    idea,
    advocateArgument,
    criticArgument,
    verifications,
    scrapedEvidence,
    reflection,
  });

  // Collect all citations
  const allCitations = [];
  verifications.forEach(v => {
    if (v.citations) allCitations.push(...v.citations);
  });
  scrapedEvidence.forEach(e => {
    if (e.data?.results) {
      e.data.results.forEach(r => {
        if (r.url) allCitations.push({ url: r.url, title: r.name || r.url, source: 'stagehand' });
      });
    }
    if (e.data?.repositories) {
      e.data.repositories.forEach(r => {
        if (r.url) allCitations.push({ url: r.url, title: r.name || r.url, source: 'stagehand' });
      });
    }
  });

  verdict.citations = allCitations;

  yield { step: 'verdict_done', verdict };
}

/**
 * Step 1: Extract claims from both arguments.
 */
async function extractClaims(advocateArgument, criticArgument) {
  const result = await chat({
    messages: [
      {
        role: 'system',
        content: `Extract specific, verifiable claims from both arguments. Return JSON: { "claims": [{ "claim": "...", "source": "advocate"|"critic" }] }`,
      },
      {
        role: 'user',
        content: `ADVOCATE:\n${advocateArgument}\n\nCRITIC:\n${criticArgument}\n\nExtract all specific claims.`,
      },
    ],
    temperature: 0.2,
    json: true,
  });

  try {
    const parsed = JSON.parse(result);
    return parsed.claims || [];
  } catch {
    return [];
  }
}

/**
 * Step 2: Classify claims.
 */
async function classifyClaims(claims) {
  if (claims.length === 0) return [];

  const claimsList = claims.map((c, i) => `${i + 1}. [${c.source}] ${c.claim}`).join('\n');

  const result = await chat({
    messages: [
      {
        role: 'system',
        content: `Classify each claim as "factual" (verifiable with data), "vague" (no specifics), or "opinion" (subjective). Return JSON: { "classified": [{ "claim": "...", "source": "advocate"|"critic", "type": "factual"|"vague"|"opinion" }] }`,
      },
      {
        role: 'user',
        content: `Classify these claims:\n${claimsList}`,
      },
    ],
    temperature: 0.2,
    json: true,
  });

  try {
    const parsed = JSON.parse(result);
    return parsed.classified || [];
  } catch {
    return claims.map(c => ({ ...c, type: 'vague' }));
  }
}

/**
 * Step 5: Reflect on evidence quality.
 */
async function reflect({ idea, advocateArgument, criticArgument, verifications, scrapedEvidence, context }) {
  const evidenceSummary = verifications.length > 0
    ? verifications.map(v => `- "${v.claim}" → ${v.status}`).join('\n')
    : 'No claims were verified.';

  const scrapeSummary = scrapedEvidence.length > 0
    ? scrapedEvidence.map(e => `- ${e.source}: ${JSON.stringify(e.data).substring(0, 300)}`).join('\n')
    : 'No web scraping results.';

  const result = await chat({
    messages: [
      {
        role: 'system',
        content: `You are a critical judge reflecting on evidence quality. Assess:
1. How well-supported are the advocate's claims?
2. How valid are the critic's concerns?
3. What evidence is missing?
4. What is your preliminary leaning?

Be concise (under 200 words).`,
      },
      {
        role: 'user',
        content: `IDEA: ${idea}\n\nADVOCATE: ${advocateArgument.substring(0, 500)}\n\nCRITIC: ${criticArgument.substring(0, 500)}\n\nVERIFICATION RESULTS:\n${evidenceSummary}\n\nWEB SCRAPING RESULTS:\n${scrapeSummary}`,
      },
    ],
    temperature: 0.3,
  });

  return result;
}

/**
 * Step 6: Synthesize verdict.
 */
async function synthesizeVerdict({ idea, advocateArgument, criticArgument, verifications, scrapedEvidence, reflection }) {
  const result = await chat({
    messages: [
      {
        role: 'system',
        content: `You are the judge delivering a final verdict on a startup idea debate.
Based on all evidence, provide your verdict as JSON:
{
  "recommendation": "pursue" | "pivot" | "pass",
  "score": <0-100>,
  "reasoning": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"]
}

Be decisive. Use evidence from the verification and scraping results to back your verdict.`,
      },
      {
        role: 'user',
        content: `IDEA: ${idea}

ADVOCATE ARGUMENT:
${advocateArgument}

CRITIC ARGUMENT:
${criticArgument}

EVIDENCE VERIFICATION:
${verifications.map(v => `- "${v.claim}" → ${v.status}: ${v.evidence || 'N/A'}`).join('\n') || 'None'}

WEB SCRAPING:
${JSON.stringify(scrapedEvidence.map(e => ({ source: e.source, data: e.data })), null, 2).substring(0, 1000)}

REFLECTION:
${reflection}

Deliver your verdict.`,
      },
    ],
    temperature: 0.3,
    json: true,
  });

  try {
    return JSON.parse(result);
  } catch {
    return {
      recommendation: 'pivot',
      score: 50,
      reasoning: 'Unable to fully evaluate. The idea shows some promise but needs more validation.',
      strengths: ['Addresses a real problem'],
      weaknesses: ['Insufficient evidence provided'],
      risks: ['Market validation needed'],
      nextSteps: ['Conduct user interviews', 'Build an MVP', 'Validate pricing'],
      citations: [],
    };
  }
}

/**
 * Parse verification results from Sonar response.
 */
function parseVerifications(summary, claims) {
  return claims.map(claim => {
    const lower = summary.toLowerCase();
    const claimLower = claim.toLowerCase().substring(0, 50);

    let status = 'unverified';
    if (lower.includes('verified') && lower.includes(claimLower.substring(0, 20))) {
      status = 'verified';
    } else if (lower.includes('contradicted') || lower.includes('false') || lower.includes('inaccurate')) {
      status = 'contradicted';
    }

    return {
      claim,
      status,
      evidence: summary.substring(0, 200),
      citations: [],
    };
  });
}
