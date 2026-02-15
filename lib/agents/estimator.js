/**
 * Estimator Agent — refines effort and story points from spec and tasks.
 * Produces a single source of truth for planning.
 *
 * @module lib/agents/estimator
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are an experienced engineering manager. You review a feature's spec and task breakdown and produce refined estimates for planning and capacity.

Consider:
1. Sum of task effort: Do the tasks add up to a realistic total?
2. Dependencies and sequencing: Could parallel work reduce calendar time?
3. Unknowns: Are there spikes or unknowns that could blow up?
4. Contingency: What buffer would you add for a typical team?

Output:
- totalStoryPoints: Single number (Fibonacci-ish: 1,2,3,5,8,13,21) for the whole feature
- engDays: Estimated calendar days with a small team (e.g. 1-2 devs)
- confidence: 1-10 how confident you are in these numbers
- risks: Array of strings describing what could make the estimate wrong
- notes: Short note for the PM (e.g. "Front-heavy; backend is straightforward")

Respond with ONLY valid JSON matching this schema:
{
  "totalStoryPoints": <number>,
  "engDays": <number>,
  "confidence": <1-10>,
  "risks": ["Risk 1", "Risk 2"],
  "notes": "Short note for planning"
}`;

/**
 * Produce refined estimates for a feature given its spec and tasks.
 *
 * @param {Object} feature — Feature (title, description, effort from recommender)
 * @param {Object} spec — Feature spec (optional)
 * @param {Array} tasks — Task list (optional)
 * @returns {Promise<Object>} Estimate object
 */
export async function estimateFeature(feature, spec = null, tasks = []) {
  const tasksSummary = tasks.length
    ? `Tasks (${tasks.length}):\n${tasks.map((t, i) => `${i + 1}. [${t.type}] ${t.title} — ${t.estimatedEffort || "?"}`).join("\n")}`
    : "No tasks yet.";
  const specSummary = spec
    ? `Spec: userStories=${spec.userStories?.length || 0}, dataModel=${!!spec.dataModelChanges}, uiChanges=${!!spec.uiChanges}`
    : "No spec yet.";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Estimate this feature for planning:\n\nFeature: ${feature.title}\nDescription: ${feature.description}\nRecommender effort (1-10): ${feature.effort ?? "?"}\n\n${specSummary}\n\n${tasksSummary}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.2 });

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("[Estimator] Failed to parse response:", e.message);
    throw new Error("Failed to parse estimate");
  }
}
