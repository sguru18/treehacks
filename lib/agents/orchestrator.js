/**
 * Debate Orchestrator.
 * Manages debate rounds, streaming events, branching, and state.
 *
 * @module lib/agents/orchestrator
 */

import { v4 as uuidv4 } from 'uuid';
import { streamArgument } from './advocate.js';
import { streamCounterargument } from './critic.js';
import { evaluateRound } from './judge.js';
import { searchPriorArt, analyzeMarket } from '../research/perplexity.js';
import { getMockPriorArt, getMockMarketAnalysis } from '../research/mock.js';
import * as store from '../store.js';

/**
 * Create and initialize a new debate.
 * Does initial research before returning.
 *
 * @param {string} idea
 * @param {string[]} criteria
 * @returns {Promise<import('../types.js').Debate>}
 */
export async function createDebate(idea, criteria = []) {
  const id = uuidv4();
  const now = Date.now();

  const debate = store.createDebate({
    id,
    idea,
    criteria,
    status: 'researching',
    nodes: [],
    branches: [],
    currentBranchId: 'main',
    round: 0,
    finalVerdict: null,
    createdAt: now,
    updatedAt: now,
  });

  // Do initial research in the background -- add as research nodes
  try {
    const hasPplx = !!process.env.PERPLEXITY_API_KEY;

    const [priorArt, market] = await Promise.allSettled([
      hasPplx ? searchPriorArt(idea) : Promise.resolve(getMockPriorArt(idea)),
      hasPplx ? analyzeMarket(idea, criteria) : Promise.resolve(getMockMarketAnalysis(idea)),
    ]);

    if (priorArt.status === 'fulfilled' && priorArt.value?.summary) {
      store.addNode(id, {
        id: uuidv4(),
        parentId: null,
        type: 'research',
        content: priorArt.value.summary.substring(0, 2000),
        citations: priorArt.value.citations || [],
        timestamp: Date.now(),
        metadata: { model: 'sonar-pro', sources: (priorArt.value.citations || []).map(c => c.url) },
      });
    }

    if (market.status === 'fulfilled' && market.value?.summary) {
      const parentId = store.getCurrentNodes(id)?.[0]?.id || null;
      store.addNode(id, {
        id: uuidv4(),
        parentId,
        type: 'research',
        content: market.value.summary.substring(0, 2000),
        citations: market.value.citations || [],
        timestamp: Date.now(),
        metadata: { model: 'sonar-pro', sources: (market.value.citations || []).map(c => c.url) },
      });
    }
  } catch (e) {
    console.error('[Orchestrator] Initial research error:', e.message);
  }

  store.updateDebate(id, { status: 'idle' });
  return store.getDebate(id);
}

/**
 * Run one debate round: Advocate -> Critic -> Judge.
 * Yields SSE-friendly events.
 *
 * @param {string} debateId
 * @returns {AsyncGenerator<Object>}
 */
export async function* runRound(debateId) {
  const debate = store.getDebate(debateId);
  if (!debate) throw new Error(`Debate ${debateId} not found`);

  store.updateDebate(debateId, { status: 'debating', round: debate.round + 1 });

  const currentNodes = store.getCurrentNodes(debateId);
  const context = buildContext(currentNodes);
  const lastNodeId = currentNodes.length > 0 ? currentNodes[currentNodes.length - 1].id : null;

  // ========== ADVOCATE ==========
  yield { type: 'status', agent: 'advocate', message: 'Advocate is researching and building their case...' };

  let advocateContent = '';
  let advocateCitations = [];

  try {
    const gen = streamArgument({
      idea: debate.idea,
      criteria: debate.criteria,
      context,
    });

    for await (const chunk of gen) {
      advocateContent += chunk;
      yield { type: 'stream', agent: 'advocate', chunk, fullContent: advocateContent };
    }
  } catch (e) {
    console.error('[Orchestrator] Advocate error:', e.message);
    advocateContent = `[Error generating advocate argument: ${e.message}]`;
  }

  const advocateNode = {
    id: uuidv4(),
    parentId: lastNodeId,
    type: 'advocate',
    content: advocateContent,
    citations: advocateCitations,
    timestamp: Date.now(),
    metadata: { model: 'llm', sources: [] },
  };
  store.addNode(debateId, advocateNode);
  yield { type: 'node', node: advocateNode };

  // ========== CRITIC ==========
  yield { type: 'status', agent: 'critic', message: 'Critic is finding counterevidence...' };

  let criticContent = '';
  let criticCitations = [];

  try {
    const gen = streamCounterargument({
      idea: debate.idea,
      advocateArgument: advocateContent,
      context,
    });

    for await (const chunk of gen) {
      criticContent += chunk;
      yield { type: 'stream', agent: 'critic', chunk, fullContent: criticContent };
    }
  } catch (e) {
    console.error('[Orchestrator] Critic error:', e.message);
    criticContent = `[Error generating critic argument: ${e.message}]`;
  }

  const criticNode = {
    id: uuidv4(),
    parentId: advocateNode.id,
    type: 'critic',
    content: criticContent,
    citations: criticCitations,
    timestamp: Date.now(),
    metadata: { model: 'llm', sources: [] },
  };
  store.addNode(debateId, criticNode);
  yield { type: 'node', node: criticNode };

  // ========== JUDGE ==========
  store.updateDebate(debateId, { status: 'judging' });
  yield { type: 'status', agent: 'judge', message: 'Judge is evaluating claims and gathering evidence...' };

  let judgeReasoning = '';
  let verdict = null;

  try {
    const judgeGen = evaluateRound({
      idea: debate.idea,
      advocateArgument: advocateContent,
      criticArgument: criticContent,
      context,
    });

    for await (const event of judgeGen) {
      yield { type: 'judge_step', ...event };

      if (event.step === 'reflect_done') {
        judgeReasoning = event.reflection;
      }
      if (event.step === 'verdict_done') {
        verdict = event.verdict;
      }
    }
  } catch (e) {
    console.error('[Orchestrator] Judge error:', e.message);
    judgeReasoning = `[Error in judge evaluation: ${e.message}]`;
  }

  const judgeNode = {
    id: uuidv4(),
    parentId: criticNode.id,
    type: 'judge',
    content: judgeReasoning || 'Evaluation complete.',
    citations: verdict?.citations || [],
    score: verdict?.score || 50,
    claimVerifications: [],
    timestamp: Date.now(),
    metadata: { model: 'llm', sources: [] },
  };
  store.addNode(debateId, judgeNode);
  yield { type: 'node', node: judgeNode };

  // Check if we should produce a final verdict
  const updatedNodes = store.getCurrentNodes(debateId);
  const judgeNodes = updatedNodes.filter(n => n.type === 'judge');

  if (verdict && (judgeNodes.length >= 2 || debate.round >= 2)) {
    store.updateDebate(debateId, { finalVerdict: verdict, status: 'complete' });
    yield { type: 'verdict', verdict };
  } else if (verdict) {
    // Intermediate verdict -- pass it along but don't finalize
    yield { type: 'evaluation', verdict };
    store.updateDebate(debateId, { status: 'idle' });
  } else {
    store.updateDebate(debateId, { status: 'idle' });
  }

  yield { type: 'round_complete', round: debate.round + 1 };
}

/**
 * Build context string from recent nodes.
 * @param {import('../types.js').DebateNode[]} nodes
 * @returns {string}
 */
function buildContext(nodes) {
  if (!nodes || nodes.length === 0) return '';

  return nodes
    .slice(-4)
    .map(n => `[${n.type.toUpperCase()}]: ${n.content.substring(0, 300)}`)
    .join('\n\n');
}
