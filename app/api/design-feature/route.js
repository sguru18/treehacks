/**
 * POST /api/design-feature
 * Conversational feature design endpoint. The PM collaborates with Daisy
 * to iteratively shape a single feature, one message at a time.
 *
 * Each response includes a structured feature proposal that the PM can
 * accept, refine through further conversation, or edit directly.
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are Daisy, an expert AI product manager. You help PMs design features through conversation. You are collaborative, not prescriptive — you propose ideas and the PM steers.

You are given:
1. A set of customer insights (pain points, feature requests, etc.)
2. A conversation history with the PM
3. Any existing features already designed

Your job is to help the PM think through and design ONE feature at a time.

CONVERSATION STYLE:
- Be concise and professional (2-4 sentences of commentary)
- Ask clarifying questions when the PM's intent is vague
- Reference specific insights by name when relevant
- Suggest trade-offs ("this would increase effort but improve confidence")
- When the PM gives enough direction, propose a complete feature

EVERY response must include BOTH:
1. "message" — your conversational response (2-4 sentences)
2. "feature" — your current best proposal for the feature based on the conversation so far. Update this with each turn. If the PM hasn't given enough direction yet, propose your best guess based on the insights discussed.

Respond with ONLY valid JSON:
{
  "message": "Your conversational response here...",
  "feature": {
    "title": "Clear feature name",
    "description": "What this feature does (2-3 sentences)",
    "rationale": "Why to build this, citing specific insights",
    "impact": <1-10>,
    "effort": <1-10>,
    "confidence": <1-10>,
    "category": "ui|backend|data|workflow|integration|infrastructure",
    "insightIndices": [0, 2]
  }
}

The "insightIndices" array should reference 0-based indices into the insights list provided.`;

const MODE_CONFIG = {
  fast: {
    temperature: 0.2,
    preamble: "\n\nMODE: Fast — be very concise. 1-2 sentences of commentary. Propose a feature quickly based on available signals.",
  },
  think: {
    temperature: 0.4,
    preamble: "",
  },
  deep: {
    temperature: 0.6,
    preamble: "\n\nMODE: Deep Think — take your time. Reason through trade-offs carefully. Consider second-order effects, market context, and implementation risks. Provide thorough analysis in 4-6 sentences before proposing.",
  },
};

export async function POST(request) {
  try {
    const { messages, insights, existingFeatures, mode } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "At least one message is required" },
        { status: 400 },
      );
    }

    const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG.think;

    // Build insights context
    const insightsContext =
      insights?.length > 0
        ? `\n\nAvailable customer insights:\n${insights
            .map(
              (ins, i) =>
                `${i}. [${ins.type?.toUpperCase()}] "${ins.title}" — ${ins.description} (severity: ${ins.severity}/5, ${ins.frequency} sources)`,
            )
            .join("\n")}`
        : "\n\n(No insights available yet.)";

    // Build existing features context
    const featuresContext =
      existingFeatures?.length > 0
        ? `\n\nFeatures already designed (avoid duplicating):\n${existingFeatures
            .map((f) => `- "${f.title}": ${f.description}`)
            .join("\n")}`
        : "";

    const llmMessages = [
      {
        role: "system",
        content: SYSTEM_PROMPT + modeConfig.preamble + insightsContext + featuresContext,
      },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const result = await chat({
      messages: llmMessages,
      json: true,
      temperature: modeConfig.temperature,
    });

    try {
      const parsed = JSON.parse(result);
      return Response.json({
        message: parsed.message || "Here's what I'm thinking...",
        feature: parsed.feature || null,
      });
    } catch (e) {
      console.error(
        "[API /design-feature] Failed to parse LLM response:",
        e.message,
      );
      // If JSON parsing fails, treat the whole thing as a message
      return Response.json({
        message: result,
        feature: null,
      });
    }
  } catch (error) {
    console.error("[API /design-feature] Error:", error);
    return Response.json(
      { error: error.message || "Feature design failed" },
      { status: 500 },
    );
  }
}
