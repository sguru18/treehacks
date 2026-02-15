/**
 * Risk Agent — flags privacy, security, and compliance concerns in a feature spec.
 * Helps ship with fewer surprises.
 *
 * @module lib/agents/risk
 */

import { chat } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a product security and compliance advisor. You review feature specifications and flag privacy, security, and compliance risks before implementation.

For each spec, identify:
1. Privacy: PII collection, retention, consent, cross-border data, or unclear data use.
2. Security: Auth, access control, injection, sensitive data exposure, or missing security controls.
3. Compliance: GDPR, CCPA, HIPAA, SOC2, or other regulatory implications.
4. Technical debt / ops: Things that could cause outages, data loss, or audit failures.

For each finding provide: category, severity (low|medium|high|critical), short description, and suggested mitigation. Only include real issues—do not invent risks that don't apply.

Respond with ONLY valid JSON matching this schema:
{
  "summary": "1-2 sentence overall risk level and focus areas",
  "findings": [
    {
      "category": "privacy|security|compliance|ops",
      "severity": "low|medium|high|critical",
      "description": "What the risk is",
      "mitigation": "What to do about it"
    }
  ],
  "overallSeverity": "low|medium|high|critical",
  "mustAddressBeforeShip": ["Summary of critical/high items that must be addressed"]
}`;

/**
 * Assess a feature spec for privacy, security, and compliance risks.
 *
 * @param {Object} spec — Feature spec (userStories, dataModelChanges, technicalNotes, etc.)
 * @param {string} featureTitle — Feature name for context
 * @returns {Promise<Object>} Risk assessment object
 */
export async function assessSpecRisks(spec, featureTitle = "") {
  const specText = [
    spec.userStories?.length && `User stories: ${JSON.stringify(spec.userStories)}`,
    spec.dataModelChanges && `Data model: ${spec.dataModelChanges}`,
    spec.workflowChanges && `Workflow: ${spec.workflowChanges}`,
    spec.technicalNotes && `Technical notes: ${spec.technicalNotes}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Assess this feature spec for privacy, security, and compliance risks.\n\nFeature: ${featureTitle}\n\n${specText}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.2 });

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("[Risk] Failed to parse response:", e.message);
    throw new Error("Failed to parse risk assessment");
  }
}
