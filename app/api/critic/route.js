/**
 * POST /api/critic
 * Stress-test a feature recommendation with counterpoints.
 */

import { critiqueFeature } from "@/lib/agents/critic";

export async function POST(request) {
  try {
    const { feature, insights } = await request.json();

    if (!feature) {
      return Response.json({ error: "Feature is required" }, { status: 400 });
    }

    const critique = await critiqueFeature(feature, insights || []);

    return Response.json({ critique });
  } catch (error) {
    console.error("[API /critic] Error:", error);
    return Response.json(
      { error: error.message || "Critic analysis failed" },
      { status: 500 },
    );
  }
}
