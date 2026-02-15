/**
 * POST /api/estimate
 * Refine effort and story points for a feature.
 */

import { estimateFeature } from "@/lib/agents/estimator";

export async function POST(request) {
  try {
    const { feature, spec, tasks } = await request.json();

    if (!feature) {
      return Response.json({ error: "Feature is required" }, { status: 400 });
    }

    const estimate = await estimateFeature(
      feature,
      spec || null,
      tasks || [],
    );

    return Response.json({ estimate });
  } catch (error) {
    console.error("[API /estimate] Error:", error);
    return Response.json(
      { error: error.message || "Estimate failed" },
      { status: 500 },
    );
  }
}
