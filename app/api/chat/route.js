/**
 * POST /api/chat
 * RAG chatbot — when Pinecone + sessionId are set, retrieves relevant board chunks
 * and uses them as context. Otherwise falls back to full board context.
 */

import { chatStream } from '@/lib/llm';
import { retrieve, isPineconeConfigured } from '@/lib/rag/pinecone';

const SYSTEM_PROMPT = `You are Daisy, an expert AI product management assistant. You have complete knowledge of the user's product board — every data source, customer insight, feature recommendation, specification, development task, and roadmap item.

RULES:
1. Answer questions using ONLY the board context provided below. If something isn't in the context, say so honestly.
2. Be concise but thorough. Use bullet points for lists.
3. When referencing insights or features, mention them by name so the user can find them.
4. You can synthesize across data — e.g. "3 of your 6 sources mention this pain point".
5. If the user asks what to build, reference the prioritized feature list and explain the reasoning.
6. You can suggest new ideas but clearly label them as your suggestion vs. what the data says.
7. Use a friendly, professional tone. You're a smart PM colleague, not a corporate robot.
8. Format responses in markdown when helpful (bold, lists, headers).

BOARD CONTEXT:
`;

/**
 * Build a text representation of the full board state.
 */
function buildContext(board) {
  const parts = [];

  // Sources
  if (board.sources?.length) {
    parts.push('## DATA SOURCES (' + board.sources.length + ')\n');
    board.sources.forEach((s, i) => {
      parts.push(`### Source ${i + 1}: ${s.name} (${s.type})`);
      parts.push(s.content);
      parts.push('');
    });
  }

  // Insights
  if (board.insights?.length) {
    parts.push('\n## INSIGHTS (' + board.insights.length + ')\n');
    board.insights.forEach((ins, i) => {
      parts.push(`### ${i + 1}. [${ins.type?.toUpperCase()}] ${ins.title}`);
      parts.push(`Description: ${ins.description}`);
      parts.push(`Severity: ${ins.severity}/5 | Frequency: ${ins.frequency} sources`);
      if (ins.tags?.length) parts.push(`Tags: ${ins.tags.join(', ')}`);
      if (ins.quotes?.length) {
        parts.push('Quotes:');
        ins.quotes.forEach((q) => parts.push(`  - "${q.text}" — ${q.sourceName || 'source'}`));
      }
      parts.push('');
    });
  }

  // Features
  if (board.features?.length) {
    parts.push('\n## RECOMMENDED FEATURES (' + board.features.length + ')\n');
    board.features.forEach((f, i) => {
      parts.push(`### ${i + 1}. ${f.title} (priority ${f.priorityScore?.toFixed?.(1) ?? '?'})`);
      parts.push(`Description: ${f.description}`);
      parts.push(`Rationale: ${f.rationale}`);
      parts.push(`Impact: ${f.impact}/10 | Effort: ${f.effort}/10 | Confidence: ${f.confidence}/10 | Category: ${f.category}`);
      if (f.insightIds?.length) parts.push(`Backed by ${f.insightIds.length} insight(s)`);

      // Spec
      if (f.spec) {
        parts.push('SPEC:');
        if (f.spec.userStories?.length)
          parts.push('  User Stories: ' + f.spec.userStories.join(' | '));
        if (f.spec.uiChanges) parts.push('  UI Changes: ' + f.spec.uiChanges.substring(0, 500));
        if (f.spec.dataModelChanges) parts.push('  Data Model: ' + f.spec.dataModelChanges.substring(0, 500));
        if (f.spec.successMetrics?.length)
          parts.push('  Metrics: ' + f.spec.successMetrics.join(' | '));
      }

      // Tasks
      if (f.tasks?.length) {
        parts.push(`TASKS (${f.tasks.length}):`);
        f.tasks.forEach((t, j) => {
          parts.push(`  ${j + 1}. [${t.type}] ${t.title} — ${t.estimatedEffort}`);
        });
      }
      // Validation agents
      if (f.research) parts.push('RESEARCH: ' + (f.research.summary || '') + (f.research.buildVsBuy ? ' | ' + f.research.buildVsBuy : ''));
      if (f.critique) parts.push('CRITIC: ' + (f.critique.summary || '') + ' | Recommendation: ' + (f.critique.recommendation || ''));
      if (f.risk) parts.push('RISK: ' + (f.risk.summary || '') + ' | Severity: ' + (f.risk.overallSeverity || ''));
      if (f.estimate) parts.push('ESTIMATE: ' + (f.estimate.totalStoryPoints || '?') + ' SP, ' + (f.estimate.engDays || '?') + ' eng days');
      parts.push('');
    });
  }

  // Roadmap (group by sprint, human-readable)
  if (board.roadmapItems?.length) {
    const sprintLabel = (s) => (s === 'backlog' ? 'Backlog' : s.replace(/^sprint-(\d+)$/i, 'Sprint $1'));
    const bySprint = {};
    board.roadmapItems.forEach((r) => {
      const s = r.sprint || 'backlog';
      if (!bySprint[s]) bySprint[s] = [];
      const feature = board.features?.find((f) => f.id === r.featureId);
      const title = feature?.title || r.featureId;
      const points = r.storyPoints != null ? ` (${r.storyPoints} points)` : '';
      bySprint[s].push(title + points);
    });
    const order = ['backlog', 'sprint-1', 'sprint-2', 'sprint-3'];
    parts.push('\n## ROADMAP\n');
    order.forEach((sprintId) => {
      const items = bySprint[sprintId];
      if (!items?.length) return;
      parts.push('**' + sprintLabel(sprintId) + '**');
      items.forEach((line) => parts.push('- ' + line));
      parts.push('');
    });
  }

  return parts.join('\n');
}

export async function POST(request) {
  try {
    const { messages, board, sessionId } = await request.json();

    if (!messages?.length) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }

    let context = '';

    if (isPineconeConfigured() && sessionId) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      const queryText = lastUserMessage?.content || messages[messages.length - 1]?.content || '';
      try {
        const chunks = await retrieve(sessionId, queryText);
        if (chunks.length > 0) {
          context = chunks.join('\n\n---\n\n');
        }
      } catch (err) {
        console.warn('[API /chat] RAG retrieve failed, falling back to full board:', err.message);
      }
    }

    if (!context && board) {
      context = buildContext(board);
    }

    if (!context) {
      context = '(No board data indexed or provided. Ask the user to add sources and run indexing, or send the board with the request.)';
    }

    const systemMessage = SYSTEM_PROMPT + context;

    const llmMessages = [
      { role: 'system', content: systemMessage },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Stream via SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream({ messages: llmMessages, temperature: 0.4 })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
