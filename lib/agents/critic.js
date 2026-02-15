/**
 * Critic Agent — stress-tests a feature recommendation with counterpoints and risks.
 * Surfaces "why not build this" so decisions are balanced.
 *
 * @module lib/agents/critic
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a skeptical senior PM and strategist. Your job is to stress-test a feature recommendation by listing reasons NOT to build it, or to build it differently/later.

Consider:
1. Scope creep: Could this balloon into something much bigger?
2. Overlap: Does the product already solve this partially? Are we duplicating?
3. Wrong priority: Is there something more important we're delaying?
4. Wrong solution: Would a smaller change (e.g. UX fix) achieve the same outcome?
5. User segment: Are we over-indexing on a loud minority?
6. Defer: Reasons to push this to a later quarter (e.g. dependency, market not ready).
7. Alternative: A simpler or different approach that might work better.

Be direct and specific. Cite the feature's rationale and push back where weak. The goal is to make the final decision better informed, not to block the feature.

Respond with ONLY valid JSON matching this schema:
{
  "summary": "One sentence: overall verdict (e.g. 'Worth building but scope carefully')",
  "counterpoints": [
    { "concern": "Short label", "detail": "Why this matters" }
  ],
  "alternatives": ["Alternative 1", "Alternative 2"],
  "deferReasons": ["Reason to do later if any"],
  "recommendation": "build|build_with_caveats|defer|rethink",
  "caveats": "If build_with_caveats: what to watch or limit"
}`;

/**
 * Run critic analysis on a feature recommendation.
 *
 * @param {Object} feature — Feature with title, description, rationale
 * @param {Array} insights — Related insights (optional)
 * @returns {Promise<Object>} Critic result object
 */
export async function critiqueFeature(feature, insights = []) {
  const insightsSnip =
    insights.length > 0
      ? `\nSupporting insights:\n${insights.slice(0, 5).map((i) => `- ${i.title}: ${i.description}`).join("\n")}`
      : "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Stress-test this feature recommendation:\n\nFeature: ${feature.title}\nDescription: ${feature.description}\nRationale: ${feature.rationale || "N/A"}${insightsSnip}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.4 });

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("[Critic] Failed to parse response:", e.message);
    throw new Error("Failed to parse critic results");
  }
}
