/**
 * POST /api/refine
 * Refines a single section of AI-generated content based on user instructions.
 * Supports both string and string[] (list) content types.
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are Daisy, an expert AI product management assistant. The user is a PM collaborating with you to refine a section of a product document.

You will be given:
1. The current content of a section
2. The user's instructions for how to change it
3. Context about which section and feature this belongs to

Your job is to apply the user's requested changes while:
- Preserving the overall structure and format
- Keeping content that the user didn't ask to change
- Maintaining professional PM-quality writing
- Being specific and actionable (no vague language)

IMPORTANT FORMATTING RULES:
- If the content type is "list", respond with a JSON array of strings
- If the content type is "text", respond with a single string
- Respond with ONLY valid JSON matching: { "refined": <string or string[]> }
- The type of "refined" MUST match the input content type`;

export async function POST(request) {
  try {
    const { content, instructions, context } = await request.json();

    if (!instructions) {
      return Response.json(
        { error: "Instructions are required" },
        { status: 400 },
      );
    }

    if (content === undefined || content === null) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const isListContent = Array.isArray(content);
    const contentStr = isListContent
      ? content.map((item, i) => `${i + 1}. ${item}`).join("\n")
      : content;

    const contextStr = [
      context?.featureTitle && `Feature: ${context.featureTitle}`,
      context?.featureDescription &&
        `Description: ${context.featureDescription}`,
      context?.sectionLabel && `Section: ${context.sectionLabel}`,
    ]
      .filter(Boolean)
      .join("\n");

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${contextStr ? `Context:\n${contextStr}\n\n` : ""}Current content (type: ${isListContent ? "list" : "text"}):\n${contentStr}\n\nMy instructions:\n${instructions}`,
      },
    ];

    const result = await chat({ messages, json: true, temperature: 0.3 });

    try {
      const parsed = JSON.parse(result);
      const refined = parsed.refined;

      // Type-check: ensure the output matches the input type
      if (isListContent && !Array.isArray(refined)) {
        // LLM returned a string for a list — split by newlines
        return Response.json({
          refined: String(refined)
            .split("\n")
            .map((s) => s.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean),
        });
      }

      if (!isListContent && Array.isArray(refined)) {
        // LLM returned a list for a string — join
        return Response.json({ refined: refined.join("\n") });
      }

      return Response.json({ refined });
    } catch (e) {
      console.error("[API /refine] Failed to parse LLM response:", e.message);
      return Response.json(
        { error: "Failed to parse refinement result" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[API /refine] Error:", error);
    return Response.json(
      { error: error.message || "Refinement failed" },
      { status: 500 },
    );
  }
}
