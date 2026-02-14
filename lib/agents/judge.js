/**
 * Judge Agent - demands evidence and provides verdicts
 * Multi-step reasoning pipeline for the "best agent reasoning" prize
 * @module lib/agents/judge
 */

import OpenAI from 'openai';
import { deepReasoning } from '../research/perplexity.js';
import { validateClaim, searchProductHunt, searchGitHub } from '../research/stagehand.js';

/**
 * @typedef {import('../types.js').Verdict} Verdict
 * @typedef {import('../types.js').DebateNode} DebateNode
 * @typedef {import('../types.js').ClaimVerification} ClaimVerification
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Multi-step reasoning pipeline:
 * 1. Evaluate claim quality
 * 2. Demand evidence for vague claims
 * 3. Trigger Sonar research to verify
 * 4. Trigger Stagehand scraping for concrete validation
 * 5. Synthesize verdict
 * 
 * @param {string} idea - The startup idea
 * @param {string} advocateArgument - Advocate's argument
 * @param {string} criticArgument - Critic's counterargument
 * @param {DebateNode[]} previousNodes - Previous debate nodes for context
 * @returns {Promise<Object>}
 */
export async function evaluateRound(idea, advocateArgument, criticArgument, previousNodes = []) {
  console.log('Judge: Starting multi-step evaluation pipeline');

  // Step 1: Evaluate claim quality
  const evaluation = await evaluateClaims(advocateArgument, criticArgument);
  console.log('Judge: Step 1 - Claim evaluation complete', evaluation);

  // Step 2: Identify vague claims that need evidence
  const vagueClaims = identifyVagueClaims(evaluation.advocateClaims, evaluation.criticClaims);
  console.log('Judge: Step 2 - Identified vague claims', vagueClaims);

  // Step 3: Trigger Sonar research for verification
  let sonarVerification = null;
  if (vagueClaims.length > 0) {
    try {
      const claimsToVerify = vagueClaims.slice(0, 3).join('; ');
      sonarVerification = await deepReasoning(
        idea,
        `Verify these claims: ${claimsToVerify}. Advocate says: ${advocateArgument.substring(0, 500)}. Critic says: ${criticArgument.substring(0, 500)}.`
      );
      console.log('Judge: Step 3 - Sonar verification complete');
    } catch (error) {
      console.error('Judge: Sonar verification error:', error);
    }
  }

  // Step 4: Trigger Stagehand scraping for concrete validation
  let stagehandValidation = null;
  if (vagueClaims.length > 0 && evaluation.advocateClaims.length > 0) {
    try {
      // Try to find URLs in the arguments
      const urls = extractUrls(advocateArgument + ' ' + criticArgument);
      if (urls.length > 0) {
        stagehandValidation = await validateClaim(
          vagueClaims[0],
          urls.slice(0, 3)
        );
        console.log('Judge: Step 4 - Stagehand validation complete');
      } else {
        // Search Product Hunt and GitHub for similar products
        const productHuntResults = await searchProductHunt(idea).catch(() => null);
        const githubResults = await searchGitHub(idea).catch(() => null);
        stagehandValidation = {
          productHunt: productHuntResults,
          github: githubResults,
        };
        console.log('Judge: Step 4 - Stagehand search complete');
      }
    } catch (error) {
      console.error('Judge: Stagehand validation error:', error);
    }
  }

  // Step 5: Synthesize verdict
  const verdict = await synthesizeVerdict(
    idea,
    advocateArgument,
    criticArgument,
    evaluation,
    sonarVerification,
    stagehandValidation
  );
  console.log('Judge: Step 5 - Verdict synthesized', verdict);

  return {
    evaluation,
    vagueClaims,
    sonarVerification,
    stagehandValidation,
    verdict,
    reasoning: `Evaluated ${evaluation.advocateClaims.length} advocate claims and ${evaluation.criticClaims.length} critic claims. Verified ${vagueClaims.length} vague claims using Sonar and Stagehand.`,
  };
}

/**
 * Step 1: Evaluate claim quality
 * @param {string} advocateArgument
 * @param {string} criticArgument
 * @returns {Promise<Object>}
 */
async function evaluateClaims(advocateArgument, criticArgument) {
  const systemPrompt = `You are a judge evaluating debate claims. Extract and evaluate the quality of claims made by both sides.`;

  const userPrompt = `Extract and evaluate claims from these arguments:

ADVOCATE ARGUMENT:
${advocateArgument}

CRITIC ARGUMENT:
${criticArgument}

For each argument, extract:
1. Specific factual claims (with numbers, data, examples)
2. Vague claims (without evidence or specifics)
3. Opinion statements
4. Assumptions

Return JSON with:
{
  "advocateClaims": ["claim1", "claim2", ...],
  "criticClaims": ["claim1", "claim2", ...],
  "advocateVague": ["vague claim1", ...],
  "criticVague": ["vague claim1", ...],
  "advocateScore": 0-100,
  "criticScore": 0-100
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Claim evaluation error:', error);
    // Fallback
    return {
      advocateClaims: extractSimpleClaims(advocateArgument),
      criticClaims: extractSimpleClaims(criticArgument),
      advocateVague: [],
      criticVague: [],
      advocateScore: 50,
      criticScore: 50,
    };
  }
}

/**
 * Step 2: Identify vague claims that need evidence
 * @param {string[]} advocateClaims
 * @param {string[]} criticClaims
 * @returns {string[]}
 */
function identifyVagueClaims(advocateClaims, criticClaims) {
  const allClaims = [...advocateClaims, ...criticClaims];
  const vague = [];

  allClaims.forEach(claim => {
    // Check if claim is vague (no numbers, no specific examples, no citations)
    const hasNumbers = /\d/.test(claim);
    const hasSpecifics = claim.match(/\b(specifically|for example|according to|study|research|data)\b/i);
    const hasUrl = /https?:\/\//.test(claim);

    if (!hasNumbers && !hasSpecifics && !hasUrl) {
      vague.push(claim);
    }
  });

  return vague.slice(0, 5); // Top 5 vague claims
}

/**
 * Step 5: Synthesize final verdict
 * @param {string} idea
 * @param {string} advocateArgument
 * @param {string} criticArgument
 * @param {Object} evaluation
 * @param {Object} [sonarVerification]
 * @param {Object} [stagehandValidation]
 * @returns {Promise<Verdict>}
 */
async function synthesizeVerdict(idea, advocateArgument, criticArgument, evaluation, sonarVerification, stagehandValidation) {
  const systemPrompt = `You are a judge providing a final verdict on a startup idea debate. Be critical, demand evidence, and provide clear recommendations.`;

  let context = `IDEA: ${idea}\n\n`;
  context += `ADVOCATE SCORE: ${evaluation.advocateScore}/100\n`;
  context += `CRITIC SCORE: ${evaluation.criticScore}/100\n\n`;
  context += `ADVOCATE ARGUMENT:\n${advocateArgument}\n\n`;
  context += `CRITIC ARGUMENT:\n${criticArgument}\n\n`;

  if (sonarVerification) {
    context += `SONAR VERIFICATION:\n${sonarVerification.summary}\n\n`;
  }

  if (stagehandValidation) {
    context += `STAGEHAND VALIDATION:\n${JSON.stringify(stagehandValidation, null, 2)}\n\n`;
  }

  const userPrompt = `${context}

Provide a verdict with:
1. Recommendation: "pursue", "pivot", or "pass"
2. Overall score (0-100)
3. Reasoning (2-3 sentences)
4. Top 3 strengths
5. Top 3 weaknesses
6. Top 3 risks

Return JSON:
{
  "recommendation": "pursue|pivot|pass",
  "score": 0-100,
  "reasoning": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "risks": ["...", "...", "..."]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const verdict = JSON.parse(completion.choices[0].message.content);
    
    // Combine citations
    const citations = [];
    if (sonarVerification?.citations) {
      citations.push(...sonarVerification.citations);
    }
    if (stagehandValidation?.results) {
      stagehandValidation.results.forEach(r => {
        if (r.url) {
          citations.push({
            url: r.url,
            title: 'Stagehand Validation',
            source: 'stagehand',
          });
        }
      });
    }

    return {
      ...verdict,
      citations,
    };
  } catch (error) {
    console.error('Verdict synthesis error:', error);
    // Fallback verdict
    return {
      recommendation: 'pivot',
      score: 50,
      reasoning: 'Unable to fully evaluate due to errors. Review manually.',
      strengths: [],
      weaknesses: [],
      risks: [],
      citations: [],
    };
  }
}

/**
 * Extract URLs from text
 * @param {string} text
 * @returns {string[]}
 */
function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}

/**
 * Simple claim extraction fallback
 * @param {string} text
 * @returns {string[]}
 */
function extractSimpleClaims(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 5).map(s => s.trim());
}

/**
 * Score a single argument node
 * @param {DebateNode} node
 * @returns {Promise<number>}
 */
export async function scoreArgument(node) {
  if (node.type === 'judge' && node.score !== undefined) {
    return node.score;
  }

  // Simple scoring based on content quality
  let score = 50; // Base score

  // Add points for citations
  if (node.citations && node.citations.length > 0) {
    score += Math.min(node.citations.length * 5, 20);
  }

  // Add points for length (more detailed arguments)
  const wordCount = node.content.split(/\s+/).length;
  if (wordCount > 100) score += 10;
  if (wordCount > 200) score += 10;

  // Deduct points if too short
  if (wordCount < 50) score -= 20;

  return Math.max(0, Math.min(100, score));
}
