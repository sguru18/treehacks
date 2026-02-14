/**
 * POST /api/recommend
 * Generates prioritized feature recommendations from insights.
 */

import { recommendFeatures } from "@/lib/agents/recommender";
import { v4 as uuid } from "uuid";

export async function POST(request) {
  try {
    const { insights, productContext } = await request.json();

    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return Response.json(
        { error: "At least one insight is required" },
        { status: 400 },
      );
    }

    const rawFeatures = await recommendFeatures(insights, productContext);

    // Assign IDs and map insight indices to insight IDs
    const features = rawFeatures.map((feature) => {
      const insightIds = (feature.insightIndices || [])
        .map((idx) => insights[idx]?.id)
        .filter(Boolean);

      // Calculate priority score: (impact * confidence) / effort
      const priorityScore =
        ((feature.impact || 5) * (feature.confidence || 5)) /
        Math.max(feature.effort || 5, 1);

      return {
        ...feature,
        id: uuid(),
        insightIds,
        priorityScore: Math.round(priorityScore * 10) / 10,
        status: "recommended",
        spec: null,
        tasks: null,
      };
    });

    // Sort by priority score descending
    features.sort((a, b) => b.priorityScore - a.priorityScore);

    return Response.json({ features });
  } catch (error) {
    console.error("[API /recommend] Error:", error);
    return Response.json(
      { error: error.message || "Recommendation failed" },
      { status: 500 },
    );
  }
}
