/**
 * Core data types for The Idea Refinery.
 * All shapes defined via JSDoc for JavaScript projects.
 * @module lib/types
 */

/**
 * @typedef {Object} Citation
 * @property {string} url
 * @property {string} title
 * @property {string} [snippet]
 * @property {'perplexity'|'stagehand'|'manual'} source
 */

/**
 * @typedef {Object} ClaimVerification
 * @property {string} claim
 * @property {'verified'|'unverified'|'contradicted'} status
 * @property {string} [evidence]
 * @property {Citation[]} [citations]
 */

/**
 * @typedef {Object} DebateNode
 * @property {string} id
 * @property {string|null} parentId
 * @property {'advocate'|'critic'|'judge'|'research'|'fork'|'verdict'} type
 * @property {string} content
 * @property {Citation[]} citations
 * @property {ClaimVerification[]} [claimVerifications]
 * @property {number} [score]
 * @property {number} timestamp
 * @property {Object} metadata
 * @property {string} metadata.model
 * @property {string[]} metadata.sources
 */

/**
 * @typedef {Object} Verdict
 * @property {'pursue'|'pivot'|'pass'} recommendation
 * @property {number} score  - 0-100
 * @property {string} reasoning
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {string[]} risks
 * @property {string[]} [nextSteps]
 * @property {Citation[]} citations
 */

/**
 * @typedef {Object} Branch
 * @property {string} id
 * @property {string} forkFromNodeId
 * @property {string} label
 * @property {DebateNode[]} nodes
 */

/**
 * @typedef {Object} Debate
 * @property {string} id
 * @property {string} idea
 * @property {string[]} criteria
 * @property {'idle'|'researching'|'debating'|'judging'|'complete'} status
 * @property {DebateNode[]} nodes       - main branch nodes
 * @property {Branch[]} branches
 * @property {string} currentBranchId
 * @property {number} round             - current debate round
 * @property {Verdict|null} finalVerdict
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} ResearchResult
 * @property {string} query
 * @property {string} summary
 * @property {Citation[]} citations
 * @property {Object} [data]
 */

// Export empty object so this file is treated as a module
const _types = {};
export default _types;
