/**
 * POST /api/analyze
 * Analyzes data sources and extracts product insights.
 */

import { analyzeSourceData } from "@/lib/agents/analyzer";
import { v4 as uuid } from "uuid";

export async function POST(request) {
  try {
    const { sources } = await request.json();

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return Response.json(
        { error: "At least one data source is required" },
        { status: 400 },
      );
    }

    const rawInsights = await analyzeSourceData(sources);

    // Assign IDs and map source indices to source metadata
    const insights = rawInsights.map((insight) => ({
      ...insight,
      id: uuid(),
      quotes: (insight.quotes || []).map((q) => ({
        ...q,
        sourceName:
          sources[q.sourceIndex]?.name || `Source ${q.sourceIndex + 1}`,
        sourceId: sources[q.sourceIndex]?.id || null,
      })),
    }));

    return Response.json({ insights });
  } catch (error) {
    console.error("[API /analyze] Error:", error);
    return Response.json(
      { error: error.message || "Analysis failed" },
      { status: 500 },
    );
  }
}
