/**
 * Chunk the board into embeddable text segments for RAG.
 * Each chunk is self-contained so retrieval makes sense.
 *
 * @module lib/rag/chunk
 */

const MAX_CHUNK_CHARS = 3500; // Safe for Pinecone metadata + enough context

function truncate(s, max = MAX_CHUNK_CHARS) {
  if (!s || typeof s !== 'string') return '';
  return s.length <= max ? s : s.slice(0, max - 3) + '...';
}

/**
 * @param {Object} board — { sources, insights, features, roadmapItems }
 * @returns {Array<{ id: string, text: string, type: string }>}
 */
export function chunkBoard(board) {
  const chunks = [];

  // Sources
  if (board.sources?.length) {
    board.sources.forEach((s, i) => {
      const text = `[DATA SOURCE] ${s.name} (${s.type})\n\n${truncate(s.content)}`;
      chunks.push({ id: `source_${i}`, text, type: 'source' });
    });
  }

  // Insights
  if (board.insights?.length) {
    board.insights.forEach((ins, i) => {
      let text = `[INSIGHT] ${ins.type?.toUpperCase() || 'INSIGHT'}: ${ins.title}\n\n${ins.description}`;
      if (ins.severity != null) text += `\nSeverity: ${ins.severity}/5`;
      if (ins.frequency != null) text += ` | Frequency: ${ins.frequency} sources`;
      if (ins.tags?.length) text += `\nTags: ${ins.tags.join(', ')}`;
      if (ins.quotes?.length) {
        text += '\nQuotes: ' + ins.quotes.map((q) => `"${q.text}"`).join('; ');
      }
      chunks.push({ id: `insight_${i}`, text: truncate(text), type: 'insight' });
    });
  }

  // Features (title, description, rationale, spec summary, tasks summary, validation)
  if (board.features?.length) {
    board.features.forEach((f, i) => {
      let text = `[FEATURE] ${f.title} (priority ${f.priorityScore?.toFixed?.(1) ?? '?'})\n\n${f.description}\n\nRationale: ${f.rationale || 'N/A'}`;
      text += `\nImpact: ${f.impact}/10 | Effort: ${f.effort}/10 | Confidence: ${f.confidence}/10 | Category: ${f.category}`;
      if (f.insightIds?.length) text += ` | Backed by ${f.insightIds.length} insight(s)`;

      if (f.spec) {
        if (f.spec.userStories?.length) text += '\n\nUser stories: ' + f.spec.userStories.join(' | ');
        if (f.spec.uiChanges) text += '\nUI: ' + truncate(f.spec.uiChanges, 600);
        if (f.spec.dataModelChanges) text += '\nData: ' + truncate(f.spec.dataModelChanges, 600);
      }
      if (f.tasks?.length) {
        text += `\n\nTasks (${f.tasks.length}): ` + f.tasks.map((t) => `[${t.type}] ${t.title}`).join('; ');
      }
      if (f.research) text += '\nResearch: ' + (f.research.summary || '');
      if (f.critique) text += '\nCritic: ' + (f.critique.summary || '') + ' | ' + (f.critique.recommendation || '');
      if (f.risk) text += '\nRisk: ' + (f.risk.summary || '');
      if (f.estimate) text += `\nEstimate: ${f.estimate.totalStoryPoints ?? '?'} SP, ${f.estimate.engDays ?? '?'} eng days`;
      chunks.push({ id: `feature_${i}`, text: truncate(text), type: 'feature' });
    });
  }

  // Roadmap (one chunk, human-readable)
  if (board.roadmapItems?.length && board.features?.length) {
    const sprintLabel = (s) => (s === 'backlog' ? 'Backlog' : s.replace(/^sprint-(\d+)$/i, 'Sprint $1'));
    const bySprint = {};
    board.roadmapItems.forEach((r) => {
      const s = r.sprint || 'backlog';
      if (!bySprint[s]) bySprint[s] = [];
      const feature = board.features.find((f) => f.id === r.featureId);
      const title = feature?.title || r.featureId;
      const points = r.storyPoints != null ? ` (${r.storyPoints} points)` : '';
      bySprint[s].push(title + points);
    });
    const order = ['backlog', 'sprint-1', 'sprint-2', 'sprint-3'];
    const lines = [];
    order.forEach((sprintId) => {
      const items = bySprint[sprintId];
      if (!items?.length) return;
      lines.push(sprintLabel(sprintId) + ':');
      items.forEach((line) => lines.push('- ' + line));
    });
    const text = '[ROADMAP]\n\n' + lines.join('\n');
    chunks.push({ id: 'roadmap_0', text: truncate(text), type: 'roadmap' });
  }

  return chunks;
}
