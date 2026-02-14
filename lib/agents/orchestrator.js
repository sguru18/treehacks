/**
 * Debate Orchestrator - manages debate turns, streaming, and branching
 * @module lib/agents/orchestrator
 */

import { generateArgument, streamArgument } from './advocate.js';
import { generateCounterargument, streamCounterargument } from './critic.js';
import { evaluateRound, scoreArgument } from './judge.js';
import { searchPriorArt, analyzeMarket } from '../research/perplexity.js';

/**
 * @typedef {import('../types.js').DebateTree} DebateTree
 * @typedef {import('../types.js').DebateNode} DebateNode
 * @typedef {import('../types.js').Branch} Branch
 */

// In-memory store for debates (in production, use a database)
const debates = new Map();

/**
 * Start a new debate
 * @param {string} idea - The startup idea
 * @param {string[]} criteria - Optimization criteria
 * @returns {Promise<DebateTree>}
 */
export async function startDebate(idea, criteria = []) {
  const debateId = generateId();
  const now = Date.now();

  // Initial research
  let priorArt = null;
  let marketData = null;
  
  try {
    priorArt = await searchPriorArt(idea);
  } catch (error) {
    console.error('Error in initial prior art search:', error);
  }

  try {
    marketData = await analyzeMarket(idea, criteria);
  } catch (error) {
    console.error('Error in initial market analysis:', error);
  }

  const debate = {
    id: debateId,
    idea,
    criteria,
    nodes: [],
    branches: [],
    currentBranchId: 'main',
    finalVerdict: null,
    createdAt: now,
    updatedAt: now,
  };

  // Add initial research nodes
  if (priorArt) {
    debate.nodes.push({
      id: generateId(),
      parentId: null,
      type: 'research',
      content: `Initial prior art research: ${priorArt.summary.substring(0, 500)}...`,
      citations: priorArt.citations || [],
      timestamp: now,
      metadata: {
        model: 'perplexity-sonar',
        sources: priorArt.citations.map(c => c.url),
        claimsVerified: [],
      },
    });
  }

  if (marketData) {
    debate.nodes.push({
      id: generateId(),
      parentId: null,
      type: 'research',
      content: `Market analysis: ${marketData.summary.substring(0, 500)}...`,
      citations: marketData.citations || [],
      timestamp: now + 1,
      metadata: {
        model: 'perplexity-sonar',
        sources: marketData.citations.map(c => c.url),
        claimsVerified: [],
      },
    });
  }

  debates.set(debateId, debate);
  return debate;
}

/**
 * Run a debate round (Advocate -> Critic -> Judge)
 * @param {string} debateId - Debate ID
 * @param {string} [branchId] - Branch ID (defaults to current branch)
 * @returns {AsyncGenerator<Object>}
 */
export async function* runDebateRound(debateId, branchId = null) {
  const debate = debates.get(debateId);
  if (!debate) {
    throw new Error(`Debate ${debateId} not found`);
  }

  const activeBranchId = branchId || debate.currentBranchId;
  const branch = getBranch(debate, activeBranchId);
  const branchNodes = branch.nodes;

  // Get context from previous nodes
  const context = buildContext(branchNodes);

  // Step 1: Advocate argument
  yield { type: 'status', message: 'Advocate is making an argument...' };
  
  const advocateParentId = branchNodes.length > 0 ? branchNodes[branchNodes.length - 1].id : null;
  let advocateContent = '';
  let advocateClaims = [];
  let advocateCitations = [];

  try {
    const priorArt = await searchPriorArt(debate.idea).catch(() => null);
    const marketData = await analyzeMarket(debate.idea, debate.criteria).catch(() => null);

    const advocateStream = streamArgument(debate.idea, debate.criteria, context, priorArt, marketData);
    
    for await (const chunk of advocateStream) {
      if (typeof chunk === 'string') {
        advocateContent += chunk;
        yield { type: 'advocate', content: chunk, fullContent: advocateContent };
      } else {
        // Final response object
        advocateClaims = chunk.claims || [];
        advocateCitations = chunk.citations || [];
      }
    }
  } catch (error) {
    console.error('Advocate error:', error);
    advocateContent = 'Error generating advocate argument.';
  }

  const advocateNode = {
    id: generateId(),
    parentId: advocateParentId,
    type: 'advocate',
    content: advocateContent,
    citations: advocateCitations,
    timestamp: Date.now(),
    metadata: {
      model: 'gpt-4o',
      sources: advocateCitations.map(c => c.url),
      claimsVerified: [],
    },
  };

  branch.nodes.push(advocateNode);
  debate.updatedAt = Date.now();
  yield { type: 'node', node: advocateNode };

  // Step 2: Critic counterargument
  yield { type: 'status', message: 'Critic is countering...' };

  const criticParentId = advocateNode.id;
  let criticContent = '';
  let criticClaims = [];
  let criticCitations = [];

  try {
    const criticStream = streamCounterargument(debate.idea, advocateContent, context);
    
    for await (const chunk of criticStream) {
      if (typeof chunk === 'string') {
        criticContent += chunk;
        yield { type: 'critic', content: chunk, fullContent: criticContent };
      } else {
        criticClaims = chunk.claims || [];
        criticCitations = chunk.citations || [];
      }
    }
  } catch (error) {
    console.error('Critic error:', error);
    criticContent = 'Error generating critic counterargument.';
  }

  const criticNode = {
    id: generateId(),
    parentId: criticParentId,
    type: 'critic',
    content: criticContent,
    citations: criticCitations,
    timestamp: Date.now(),
    metadata: {
      model: 'gpt-4o',
      sources: criticCitations.map(c => c.url),
      claimsVerified: [],
    },
  };

  branch.nodes.push(criticNode);
  debate.updatedAt = Date.now();
  yield { type: 'node', node: criticNode };

  // Step 3: Judge evaluation
  yield { type: 'status', message: 'Judge is evaluating...' };

  try {
    const evaluation = await evaluateRound(
      debate.idea,
      advocateContent,
      criticContent,
      branchNodes
    );

    const judgeNode = {
      id: generateId(),
      parentId: criticNode.id,
      type: 'judge',
      content: evaluation.reasoning,
      citations: [
        ...(evaluation.sonarVerification?.citations || []),
        ...(evaluation.stagehandValidation?.results?.map(r => ({
          url: r.url,
          title: 'Stagehand Validation',
          source: 'stagehand',
        })) || []),
      ],
      score: evaluation.verdict?.score || 50,
      timestamp: Date.now(),
      metadata: {
        model: 'gpt-4o',
        sources: [],
        claimsVerified: evaluation.vagueClaims.map(claim => ({
          claim,
          verified: true,
          evidence: evaluation.sonarVerification?.summary || '',
        })),
      },
    };

    branch.nodes.push(judgeNode);
    debate.updatedAt = Date.now();
    yield { type: 'node', node: judgeNode };
    yield { type: 'evaluation', evaluation };

    // If this is the final round, generate final verdict
    if (branch.nodes.length >= 9) { // 3 rounds = 9 nodes
      const finalVerdict = evaluation.verdict;
      debate.finalVerdict = finalVerdict;
      yield { type: 'verdict', verdict: finalVerdict };
    }
  } catch (error) {
    console.error('Judge evaluation error:', error);
    yield { type: 'error', message: 'Error in judge evaluation' };
  }
}

/**
 * Fork the debate at a specific node
 * @param {string} debateId - Debate ID
 * @param {string} nodeId - Node ID to fork from
 * @param {string} label - Label for the new branch
 * @returns {Promise<Branch>}
 */
export async function forkDebate(debateId, nodeId, label) {
  const debate = debates.get(debateId);
  if (!debate) {
    throw new Error(`Debate ${debateId} not found`);
  }

  // Find the node to fork from
  const forkNode = findNodeInBranches(debate, nodeId);
  if (!forkNode) {
    throw new Error(`Node ${nodeId} not found`);
  }

  // Get all nodes up to the fork point
  const nodesUpToFork = getNodesUpTo(debate, nodeId);

  // Create new branch
  const branchId = generateId();
  const newBranch = {
    id: branchId,
    forkFromNodeId: nodeId,
    label,
    nodes: [...nodesUpToFork],
  };

  debate.branches.push(newBranch);
  debate.currentBranchId = branchId;
  debate.updatedAt = Date.now();

  return newBranch;
}

/**
 * Rewind to a specific node
 * @param {string} debateId - Debate ID
 * @param {string} nodeId - Node ID to rewind to
 * @returns {Promise<DebateTree>}
 */
export async function rewindDebate(debateId, nodeId) {
  const debate = debates.get(debateId);
  if (!debate) {
    throw new Error(`Debate ${debateId} not found`);
  }

  const branch = getBranch(debate, debate.currentBranchId);
  
  // Remove all nodes after the target node
  const nodeIndex = branch.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    throw new Error(`Node ${nodeId} not found in current branch`);
  }

  branch.nodes = branch.nodes.slice(0, nodeIndex + 1);
  debate.updatedAt = Date.now();

  return debate;
}

/**
 * Get a debate by ID
 * @param {string} debateId
 * @returns {DebateTree|null}
 */
export function getDebate(debateId) {
  return debates.get(debateId) || null;
}

/**
 * Get branch by ID
 * @param {DebateTree} debate
 * @param {string} branchId
 * @returns {Branch}
 */
function getBranch(debate, branchId) {
  if (branchId === 'main') {
    // Main branch is stored in debate.nodes
    return {
      id: 'main',
      forkFromNodeId: null,
      label: 'Main',
      nodes: debate.nodes.filter(n => !debate.branches.some(b => b.forkFromNodeId === n.id)),
    };
  }

  const branch = debate.branches.find(b => b.id === branchId);
  if (!branch) {
    throw new Error(`Branch ${branchId} not found`);
  }

  return branch;
}

/**
 * Find a node across all branches
 * @param {DebateTree} debate
 * @param {string} nodeId
 * @returns {DebateNode|null}
 */
function findNodeInBranches(debate, nodeId) {
  // Check main branch
  const mainNode = debate.nodes.find(n => n.id === nodeId);
  if (mainNode) return mainNode;

  // Check all branches
  for (const branch of debate.branches) {
    const node = branch.nodes.find(n => n.id === nodeId);
    if (node) return node;
  }

  return null;
}

/**
 * Get all nodes up to a specific node
 * @param {DebateTree} debate
 * @param {string} nodeId
 * @returns {DebateNode[]}
 */
function getNodesUpTo(debate, nodeId) {
  const allNodes = [...debate.nodes];
  for (const branch of debate.branches) {
    allNodes.push(...branch.nodes);
  }

  const targetNode = allNodes.find(n => n.id === nodeId);
  if (!targetNode) return [];

  // Build path from root to target
  const path = [];
  let current = targetNode;

  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = allNodes.find(n => n.id === current.parentId);
  }

  return path;
}

/**
 * Build context string from nodes
 * @param {DebateNode[]} nodes
 * @returns {string}
 */
function buildContext(nodes) {
  if (nodes.length === 0) return '';

  return nodes
    .slice(-3) // Last 3 nodes for context
    .map(n => `${n.type.toUpperCase()}: ${n.content.substring(0, 200)}`)
    .join('\n\n');
}

/**
 * Generate a unique ID
 * @returns {string}
 */
function generateId() {
  return `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
