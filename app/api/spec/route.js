/**
 * POST /api/spec
 * Generates a detailed feature specification.
 */

import { generateFeatureSpec } from "@/lib/agents/specwriter";

export async function POST(request) {
  try {
    const { feature, insights } = await request.json();

    if (!feature) {
      return Response.json({ error: "Feature is required" }, { status: 400 });
    }

    const spec = await generateFeatureSpec(feature, insights || []);

    return Response.json({ spec });
  } catch (error) {
    console.error("[API /spec] Error:", error);
    return Response.json(
      { error: error.message || "Spec generation failed" },
      { status: 500 },
    );
  }
}
