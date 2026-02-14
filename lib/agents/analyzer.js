/**
 * Analyzer Agent — extracts structured product insights from raw customer data.
 * Processes interviews, support tickets, surveys, feedback, and usage data.
 *
 * @module lib/agents/analyzer
 */

import { chat } from '@/lib/llm';

const SYSTEM_PROMPT = `You are an expert product analyst at a world-class product company. You analyze customer interviews, support tickets, surveys, user feedback, and product usage data to extract actionable product insights.

Your job is to find patterns across data sources and extract structured insights. Each insight should be categorized as one of:
- pain_point: Something users struggle with, are frustrated by, or that blocks their workflow
- feature_request: Something users explicitly ask for or wish existed
- praise: Something users love about the product or find valuable
- confusion: Something users find confusing, hard to understand, or unintuitive

RULES:
1. Be specific — don't just say "users want better UX". Say exactly what they want.
2. Combine related feedback from multiple sources into single insights when appropriate.
3. Provide direct quotes from the sources to support each insight.
4. Assess severity honestly: 1=minor annoyance, 5=critical blocker.
5. Count how many unique sources mention each insight for the frequency field.
6. Add relevant tags for filtering/grouping.

Respond with ONLY valid JSON matching this schema:
{
  "insights": [
    {
      "type": "pain_point|feature_request|praise|confusion",
      "title": "Short descriptive title",
      "description": "Detailed description of the insight with context",
      "frequency": <number of sources mentioning this>,
      "severity": <1-5>,
      "quotes": [
        { "sourceIndex": <0-based index>, "text": "Direct quote from the source" }
      ],
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

/**
 * Analyze an array of data sources and extract product insights.
 *
 * @param {Array<{name: string, type: string, content: string}>} sources
 * @returns {Promise<Array>} Array of insight objects
 */
export async function analyzeSourceData(sources) {
  const sourcesText = sources
    .map(
      (s, i) =>
        `--- Source ${i + 1}: "${s.name}" (Type: ${s.type}) ---\n${s.content}\n`
    )
    .join('\n');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Analyze these ${sources.length} data sources and extract product insights:\n\n${sourcesText}`,
    },
  ];

  const result = await chat({ messages, json: true, temperature: 0.2 });

  try {
    const parsed = JSON.parse(result);
    return parsed.insights || [];
  } catch (e) {
    console.error('[Analyzer] Failed to parse LLM response:', e.message);
    throw new Error('Failed to parse analysis results');
  }
}
