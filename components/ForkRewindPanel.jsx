'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDebateStore from '@/store/useDebateStore';

const NODE_ICONS = {
  advocate: '💚',
  critic: '💔',
  judge: '⚖️',
  research: '🔍',
  fork: '🌳',
  verdict: '📊',
};

const NODE_COLORS = {
  advocate: 'border-cyan-500/30 text-cyan-300',
  critic: 'border-pink-500/30 text-pink-300',
  judge: 'border-purple-500/30 text-purple-300',
  research: 'border-blue-500/30 text-blue-300',
  fork: 'border-amber-500/30 text-amber-300',
  verdict: 'border-indigo-500/30 text-indigo-300',
};

export default function ForkRewindPanel() {
  const { currentDebate, fork, rewind } = useDebateStore();
  const [showForkModal, setShowForkModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [forkLabel, setForkLabel] = useState('');

  if (!currentDebate) return null;

  const nodes = getCurrentBranchNodes(currentDebate);

  const handleFork = (nodeId) => {
    setSelectedNodeId(nodeId);
    setShowForkModal(true);
  };

  const handleForkSubmit = () => {
    if (forkLabel.trim() && selectedNodeId) {
      fork(selectedNodeId, forkLabel.trim());
      setShowForkModal(false);
      setForkLabel('');
      setSelectedNodeId(null);
    }
  };

  const handleRewind = (nodeId) => {
    if (confirm('Rewind to this point? All later nodes will be removed.')) {
      rewind(nodeId);
    }
  };

  return (
    <>
      <div className="glass-strong rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 text-gradient">Branches & Timeline</h3>

        {/* Branch selector */}
        {currentDebate.branches?.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">Active Branch:</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentDebate.currentBranchId === 'main'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'glass text-gray-300 hover:bg-white/10'
                }`}
              >
                Main
              </button>
              {currentDebate.branches.map((branch) => (
                <button
                  key={branch.id}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentDebate.currentBranchId === branch.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                      : 'glass text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {branch.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {nodes.length > 0 && (
          <div className="space-y-2">
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`glass rounded-xl p-4 hover:bg-white/10 transition-all border-l-2 ${NODE_COLORS[node.type] || 'border-gray-500/30 text-gray-300'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{NODE_ICONS[node.type] || '•'}</span>
                      <span className="text-xs font-bold uppercase text-gray-400">
                        #{index + 1} {node.type}
                      </span>
                      {node.score !== undefined && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5">
                          {node.score}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {node.content?.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => handleFork(node.id)}
                      className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-medium"
                    >
                      Fork
                    </button>
                    {index < nodes.length - 1 && (
                      <button
                        onClick={() => handleRewind(node.id)}
                        className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 text-pink-300 rounded-lg hover:bg-pink-500/20 transition-all text-xs font-medium"
                      >
                        Rewind
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {nodes.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No debate nodes yet. Run a round to start.</p>
        )}
      </div>

      {/* Fork modal */}
      <AnimatePresence>
        {showForkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 text-gradient">Create Fork</h3>
              <input
                type="text"
                value={forkLabel}
                onChange={(e) => setForkLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleForkSubmit()}
                placeholder="e.g., What if we targeted enterprise instead?"
                className="w-full px-6 py-4 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleForkSubmit}
                  disabled={!forkLabel.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 transition-all shadow-lg"
                >
                  Create Fork
                </button>
                <button
                  onClick={() => { setShowForkModal(false); setForkLabel(''); }}
                  className="flex-1 px-6 py-3 glass text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getCurrentBranchNodes(debate) {
  if (!debate) return [];
  if (debate.currentBranchId === 'main') return debate.nodes || [];
  const branch = debate.branches?.find(b => b.id === debate.currentBranchId);
  return branch?.nodes || [];
}
