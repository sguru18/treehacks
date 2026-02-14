'use client';

import { useState } from 'react';

/**
 * @typedef {import('@/lib/types.js').DebateTree} DebateTree
 * @typedef {import('@/lib/types.js').Branch} Branch
 */

export default function ForkRewindPanel({ debate, onFork, onRewind, onSwitchBranch }) {
  const [showForkModal, setShowForkModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [forkLabel, setForkLabel] = useState('');

  const handleForkClick = (nodeId) => {
    setSelectedNodeId(nodeId);
    setShowForkModal(true);
  };

  const handleForkSubmit = () => {
    if (forkLabel.trim() && selectedNodeId) {
      onFork(selectedNodeId, forkLabel.trim());
      setShowForkModal(false);
      setForkLabel('');
      setSelectedNodeId(null);
    }
  };

  const handleRewind = (nodeId) => {
    if (confirm('Are you sure you want to rewind to this point? All nodes after this will be removed.')) {
      onRewind(nodeId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold text-lg mb-4">Branches & Timeline</h3>

      {/* Branch Selector */}
      {debate.branches.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Switch Branch:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSwitchBranch('main')}
              className={`px-3 py-1 rounded ${
                debate.currentBranchId === 'main'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Main
            </button>
            {debate.branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => onSwitchBranch(branch.id)}
                className={`px-3 py-1 rounded ${
                  debate.currentBranchId === branch.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {branch.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Node Timeline */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeline (click to fork or rewind):
        </label>
        {getCurrentBranchNodes(debate).map((node, index) => (
          <div
            key={node.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">
                {index + 1}. {node.type.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {node.content.substring(0, 60)}...
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleForkClick(node.id)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Fork
              </button>
              {index < getCurrentBranchNodes(debate).length - 1 && (
                <button
                  onClick={() => handleRewind(node.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Rewind
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fork Modal */}
      {showForkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create Fork</h3>
            <input
              type="text"
              value={forkLabel}
              onChange={(e) => setForkLabel(e.target.value)}
              placeholder="e.g., What if we targeted enterprise instead?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleForkSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleForkSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Fork
              </button>
              <button
                onClick={() => {
                  setShowForkModal(false);
                  setForkLabel('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get nodes from current branch
 * @param {DebateTree} debate
 * @returns {Array}
 */
function getCurrentBranchNodes(debate) {
  if (debate.currentBranchId === 'main') {
    return debate.nodes;
  }

  const branch = debate.branches.find(b => b.id === debate.currentBranchId);
  return branch ? branch.nodes : [];
}
