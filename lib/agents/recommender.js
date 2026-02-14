/**
 * Recommender Agent — synthesizes insights into prioritized feature recommendations.
 * Considers frequency, severity, impact, and effort to rank what to build next.
 *
 * @module lib/agents/recommender
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a senior product manager at a top-tier tech company. You synthesize customer insights into concrete, prioritized feature recommendations.

Given a set of insights extracted from customer data, recommend features the team should build next. Think like a PM who balances user needs, business impact, and engineering effort.

For each feature recommendation:
- title: Clear, concise feature name
- description: What the feature does and how it works (2-3 sentences)
- rationale: Why this is worth building — cite specific insights and customer quotes
- impact: Expected user/business impact (1-10, where 10 is transformative)
- effort: Estimated development effort (1-10, where 10 is massive)
- confidence: How confident you are in this recommendation (1-10)
- insightIndices: Array of insight indices (0-based) that support this recommendation
- category: One of "ui", "backend", "data", "workflow", "integration", "infrastructure"

PRIORITIZATION RULES:
1. High frequency + high severity insights should drive top recommendations
2. Quick wins (high impact / low effort) should rank higher
3. Group related insights into single coherent features
4. Consider dependencies — if Feature A enables Feature B, recommend A first
5. Include a mix of quick wins and strategic bets
6. Limit to 5-8 recommendations, ordered by priority

Respond with ONLY valid JSON matching this schema:
{
  "features": [
    {
      "title": "Feature name",
      "description": "What this feature does",
      "rationale": "Why to build this, citing insights",
      "impact": <1-10>,
      "effort": <1-10>,
      "confidence": <1-10>,
      "insightIndices": [0, 2, 5],
      "category": "ui|backend|data|workflow|integration|infrastructure"
    }
  ]
}`;

/**
 * Generate prioritized feature recommendations from insights.
 *
 * @param {Array} insights — Array of insight objects
 * @param {string} [productContext] — Optional product context
 * @returns {Promise<Array>} Array of feature recommendation objects
 */
export async function recommendFeatures(insights, productContext = "") {
  const insightsText = insights
    .map(
      (ins, i) =>
        `${i + 1}. [${ins.type.toUpperCase()}] "${ins.title}" — ${ins.description} (severity: ${ins.severity}/5, mentioned by ${ins.frequency} sources)\n   Quotes: ${ins.quotes?.map((q) => `"${q.text}"`).join("; ") || "N/A"}`,
    )
    .join("\n\n");

  const contextStr = productContext
    ? `\n\nProduct context: ${productContext}`
    : "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Based on these ${insights.length} customer insights, recommend what features to build next:\n\n${insightsText}${contextStr}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.3 });

  try {
    const parsed = JSON.parse(result);
    return parsed.features || [];
  } catch (e) {
    console.error("[Recommender] Failed to parse LLM response:", e.message);
    throw new Error("Failed to parse feature recommendations");
  }
}
