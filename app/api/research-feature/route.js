/**
 * POST /api/research-feature
 * Research a feature for market and competitive context.
 */

import { researchFeature } from "@/lib/agents/researcher";

export async function POST(request) {
  try {
    const { feature, productContext } = await request.json();

    if (!feature) {
      return Response.json({ error: "Feature is required" }, { status: 400 });
    }

    const research = await researchFeature(feature, productContext || "");

    return Response.json({ research });
  } catch (error) {
    console.error("[API /research-feature] Error:", error);
    return Response.json(
      { error: error.message || "Research failed" },
      { status: 500 },
    );
  }
}
