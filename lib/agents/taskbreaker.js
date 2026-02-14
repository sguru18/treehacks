/**
 * Task Breaker Agent — decomposes feature specs into discrete development
 * tasks ready for AI coding agents (Cursor, Claude Code, etc.).
 *
 * @module lib/agents/taskbreaker
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a senior software engineer and tech lead. You break down feature specs into discrete, implementable development tasks that can each be handled by an AI coding agent like Cursor or Claude Code.

Each task should be:
- ATOMIC: Can be implemented as a single focused coding session
- CLEAR: Has unambiguous requirements and definition of done
- ORDERED: Dependencies are explicit so tasks can be done in sequence
- AGENT-READY: Includes a detailed prompt that could be pasted directly into Cursor or Claude Code

For each task, generate:
1. title: Short, action-oriented title (e.g., "Create user settings database migration")
2. description: What needs to be done (2-3 sentences)
3. type: One of "frontend", "backend", "database", "api", "test", "infrastructure"
4. estimatedEffort: One of "xs" (< 30min), "s" (30min-2hr), "m" (2-4hr), "l" (4-8hr), "xl" (1-2 days)
5. acceptanceCriteria: Array of specific, testable criteria
6. dependsOn: Array of task indices (0-based) this task depends on. Empty array if no dependencies.
7. agentPrompt: A DETAILED prompt (100-300 words) ready to paste into an AI coding agent. Include:
   - What to build
   - Specific technical requirements
   - File structure suggestions
   - Key patterns to follow
   - What NOT to do (common pitfalls)
   - How to verify it works

RULES:
1. Start with database/infrastructure tasks, then API/backend, then frontend, then tests
2. Keep tasks focused — one task should take 30min to 4hr for an AI agent
3. The agentPrompt should be self-contained — an agent should be able to implement the task with just the prompt
4. Include 6-12 tasks per feature (enough detail without over-fragmenting)
5. Each agentPrompt should be specific to the codebase context (Next.js, React, Tailwind)

Respond with ONLY valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "What to do",
      "type": "frontend|backend|database|api|test|infrastructure",
      "estimatedEffort": "xs|s|m|l|xl",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
      "dependsOn": [],
      "agentPrompt": "Detailed prompt for AI coding agent..."
    }
  ]
}`;

/**
 * Break down a feature spec into coding-agent-ready tasks.
 *
 * @param {Object} feature — The feature recommendation
 * @param {Object} spec — The feature specification
 * @returns {Promise<Array>} Array of task objects
 */
export async function generateDevTasks(feature, spec) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Break down this feature into development tasks for AI coding agents:

Feature: ${feature.title}
Description: ${feature.description}
Category: ${feature.category}

Specification:
- User Stories: ${JSON.stringify(spec.userStories)}
- UI Changes: ${spec.uiChanges}
- Data Model Changes: ${spec.dataModelChanges}
- Workflow Changes: ${spec.workflowChanges}
- Technical Notes: ${spec.technicalNotes}
- Acceptance Criteria: ${JSON.stringify(spec.acceptanceCriteria)}

Tech Stack: Next.js 14 (App Router), React, Tailwind CSS, Zustand for state management.`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.2 });

  try {
    const parsed = JSON.parse(result);
    return parsed.tasks || [];
  } catch (e) {
    console.error("[TaskBreaker] Failed to parse LLM response:", e.message);
    throw new Error("Failed to parse development tasks");
  }
}
