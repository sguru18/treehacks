/**
 * Researcher Agent — validates a feature against market, prior art, and competitors.
 * Helps PMs make informed build/buy/partner decisions.
 *
 * @module lib/agents/researcher
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a product research analyst. Given a feature idea, you provide market and competitive context so the team can decide whether to build it, buy it, or partner.

For each feature, research and report:
1. Prior art: Similar features in existing products (name the products and how they do it).
2. Competitors: Who else offers this or something close; differentiation opportunities.
3. Market signal: Is this a common request in the industry? Any trends or standards?
4. Build vs buy: Whether this is typically built in-house vs acquired or integrated (e.g. "most teams use X API").
5. Risks: Market risks (e.g. commoditized, crowded) or timing risks.

Be concise but specific. Name real products and companies where relevant. If you are uncertain, say so.

Respond with ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentence overall take",
  "priorArt": ["Product X does Y by...", "..."],
  "competitors": ["Company A offers...", "..."],
  "marketSignal": "Short paragraph on trends and demand",
  "buildVsBuy": "Short recommendation and reasoning",
  "risks": ["Risk 1", "Risk 2"],
  "confidence": <1-10 how confident you are in this research>
}`;

/**
 * Research a feature for market and competitive context.
 *
 * @param {Object} feature — Feature with title, description, rationale
 * @param {string} [productContext] — Optional product name/context
 * @returns {Promise<Object>} Research result object
 */
export async function researchFeature(feature, productContext = "") {
  const contextStr = productContext
    ? `\nProduct context: ${productContext}`
    : "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Research this feature for market and competitive context:\n\nFeature: ${feature.title}\nDescription: ${feature.description}\nRationale: ${feature.rationale || "N/A"}${contextStr}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.3 });

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("[Researcher] Failed to parse response:", e.message);
    throw new Error("Failed to parse research results");
  }
}
