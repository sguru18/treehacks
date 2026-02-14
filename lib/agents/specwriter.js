/**
 * Spec Writer Agent — generates detailed feature specifications
 * that are comprehensive enough for AI coding agents to implement.
 *
 * @module lib/agents/specwriter
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a senior product manager writing a detailed feature specification. The spec should be comprehensive enough for a development team or AI coding agent (like Cursor or Claude Code) to implement without needing to ask clarifying questions.

Write a thorough spec with these sections:

1. userStories: Array of user stories in "As a [user type], I want [action] so that [benefit]" format. Include 3-6 stories covering the main use cases.

2. uiChanges: Detailed description of UI changes. Include:
   - New screens/views needed
   - Changes to existing screens
   - Component hierarchy
   - Key interactions and states (loading, empty, error)
   - Responsive behavior

3. dataModelChanges: Database/schema changes needed. Include:
   - New tables/collections
   - New fields on existing tables
   - Relationships and constraints
   - Migration considerations

4. workflowChanges: How existing workflows change and new workflows needed. Include:
   - User flow diagrams (described in text)
   - Edge cases and error handling
   - Integration points with existing features

5. successMetrics: How to measure if this feature succeeds. Include 3-5 specific, measurable metrics.

6. technicalNotes: Important technical considerations:
   - Performance requirements
   - Security considerations
   - Third-party dependencies
   - Potential technical risks

7. acceptanceCriteria: Detailed acceptance criteria (5-10 items) that define "done".

Respond with ONLY valid JSON matching this schema:
{
  "spec": {
    "userStories": ["As a...", "As a..."],
    "uiChanges": "Detailed UI changes description...",
    "dataModelChanges": "Detailed data model changes...",
    "workflowChanges": "Detailed workflow changes...",
    "successMetrics": ["Metric 1", "Metric 2"],
    "technicalNotes": "Technical considerations...",
    "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
  }
}`;

/**
 * Generate a detailed feature specification.
 *
 * @param {Object} feature — The feature recommendation
 * @param {Array} insights — Related insights supporting this feature
 * @returns {Promise<Object>} The feature spec object
 */
export async function generateFeatureSpec(feature, insights = []) {
  const insightsContext =
    insights.length > 0
      ? `\n\nSupporting customer insights:\n${insights.map((ins, i) => `- ${ins.title}: ${ins.description}`).join("\n")}`
      : "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Write a detailed specification for this feature:

Feature: ${feature.title}
Description: ${feature.description}
Rationale: ${feature.rationale}
Category: ${feature.category}
${insightsContext}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.3 });

  try {
    const parsed = JSON.parse(result);
    return parsed.spec || parsed;
  } catch (e) {
    console.error("[SpecWriter] Failed to parse LLM response:", e.message);
    throw new Error("Failed to parse feature specification");
  }
}
