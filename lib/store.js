/**
 * Server-side in-memory debate store.
 * In production, swap for Redis or a database.
 *
 * @module lib/store
 */

/** @type {Map<string, import('./types.js').Debate>} */
const debates = new Map();

/**
 * Create a new debate.
 * @param {import('./types.js').Debate} debate
 * @returns {import('./types.js').Debate}
 */
export function createDebate(debate) {
  debates.set(debate.id, debate);
  return debate;
}

/**
 * Get a debate by ID.
 * @param {string} id
 * @returns {import('./types.js').Debate|null}
 */
export function getDebate(id) {
  return debates.get(id) || null;
}

/**
 * Update a debate.
 * @param {string} id
 * @param {Partial<import('./types.js').Debate>} updates
 * @returns {import('./types.js').Debate|null}
 */
export function updateDebate(id, updates) {
  const debate = debates.get(id);
  if (!debate) return null;

  Object.assign(debate, updates, { updatedAt: Date.now() });
  debates.set(id, debate);
  return debate;
}

/**
 * Add a node to the current branch.
 * @param {string} debateId
 * @param {import('./types.js').DebateNode} node
 * @returns {import('./types.js').Debate|null}
 */
export function addNode(debateId, node) {
  const debate = debates.get(debateId);
  if (!debate) return null;

  if (debate.currentBranchId === 'main') {
    debate.nodes.push(node);
  } else {
    const branch = debate.branches.find(b => b.id === debate.currentBranchId);
    if (branch) {
      branch.nodes.push(node);
    }
  }

  debate.updatedAt = Date.now();
  return debate;
}

/**
 * Get all nodes for the current branch.
 * @param {string} debateId
 * @returns {import('./types.js').DebateNode[]}
 */
export function getCurrentNodes(debateId) {
  const debate = debates.get(debateId);
  if (!debate) return [];

  if (debate.currentBranchId === 'main') {
    return debate.nodes;
  }

  const branch = debate.branches.find(b => b.id === debate.currentBranchId);
  return branch ? branch.nodes : [];
}

/**
 * List all debates (most recent first).
 * @returns {import('./types.js').Debate[]}
 */
export function listDebates() {
  return Array.from(debates.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Fork a debate at a specific node.
 * @param {string} debateId
 * @param {string} nodeId
 * @param {string} label
 * @param {string} branchId
 * @returns {import('./types.js').Branch|null}
 */
export function forkDebate(debateId, nodeId, label, branchId) {
  const debate = debates.get(debateId);
  if (!debate) return null;

  // Collect all nodes up to the fork point from the current branch
  const currentNodes = getCurrentNodes(debateId);
  const forkIndex = currentNodes.findIndex(n => n.id === nodeId);
  if (forkIndex === -1) return null;

  const nodesUpToFork = currentNodes.slice(0, forkIndex + 1).map(n => ({ ...n }));

  const newBranch = {
    id: branchId,
    forkFromNodeId: nodeId,
    label,
    nodes: nodesUpToFork,
  };

  debate.branches.push(newBranch);
  debate.currentBranchId = branchId;
  debate.updatedAt = Date.now();

  return newBranch;
}

/**
 * Rewind to a specific node in the current branch.
 * @param {string} debateId
 * @param {string} nodeId
 * @returns {import('./types.js').Debate|null}
 */
export function rewindDebate(debateId, nodeId) {
  const debate = debates.get(debateId);
  if (!debate) return null;

  if (debate.currentBranchId === 'main') {
    const idx = debate.nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) return null;
    debate.nodes = debate.nodes.slice(0, idx + 1);
  } else {
    const branch = debate.branches.find(b => b.id === debate.currentBranchId);
    if (!branch) return null;
    const idx = branch.nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) return null;
    branch.nodes = branch.nodes.slice(0, idx + 1);
  }

  debate.finalVerdict = null;
  debate.updatedAt = Date.now();
  return debate;
}

/**
 * Switch the active branch.
 * @param {string} debateId
 * @param {string} branchId
 * @returns {import('./types.js').Debate|null}
 */
export function switchBranch(debateId, branchId) {
  const debate = debates.get(debateId);
  if (!debate) return null;

  if (branchId !== 'main' && !debate.branches.find(b => b.id === branchId)) {
    return null;
  }

  debate.currentBranchId = branchId;
  debate.updatedAt = Date.now();
  return debate;
}
