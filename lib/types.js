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
 * @property {boolean} verified
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
 * @property {number} [score]         - Judge's score for this argument
 * @property {number} timestamp
 * @property {Object} metadata
 * @property {string} metadata.model        - Which model generated this
 * @property {string[]} metadata.sources    - Perplexity citations, Stagehand URLs
 * @property {ClaimVerification[]} metadata.claimsVerified
 */

/**
 * @typedef {Object} Verdict
 * @property {'pursue'|'pivot'|'pass'} recommendation
 * @property {number} score              - Overall score (0-100)
 * @property {string} reasoning
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {string[]} risks
 * @property {Citation[]} citations
 */

/**
 * @typedef {Object} Branch
 * @property {string} id
 * @property {string} forkFromNodeId
 * @property {string} label           - "What if we targeted enterprise instead?"
 * @property {DebateNode[]} nodes
 */

/**
 * @typedef {Object} DebateTree
 * @property {string} id
 * @property {string} idea
 * @property {string[]} criteria      - User's optimization criteria
 * @property {DebateNode[]} nodes
 * @property {Branch[]} branches      - Fork points
 * @property {string} currentBranchId
 * @property {Verdict} [finalVerdict]
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} ResearchResult
 * @property {string} query
 * @property {string} summary
 * @property {Citation[]} citations
 * @property {Object} [data]          - Structured data from research
 */

/**
 * @typedef {Object} AgentResponse
 * @property {string} content
 * @property {string[]} claims        - Extracted claims from the response
 * @property {Citation[]} [citations]
 * @property {Object} [metadata]
 */
