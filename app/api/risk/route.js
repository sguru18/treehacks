/**
 * POST /api/risk
 * Assess a feature spec for privacy, security, and compliance risks.
 */

import { assessSpecRisks } from "@/lib/agents/risk";

export async function POST(request) {
  try {
    const { spec, featureTitle } = await request.json();

    if (!spec) {
      return Response.json({ error: "Spec is required" }, { status: 400 });
    }

    const risk = await assessSpecRisks(spec, featureTitle || "");

    return Response.json({ risk });
  } catch (error) {
    console.error("[API /risk] Error:", error);
    return Response.json(
      { error: error.message || "Risk assessment failed" },
      { status: 500 },
    );
  }
}
