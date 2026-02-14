'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDebateStore from '@/store/useDebateStore';

export default function Dashboard() {
  const { debates, fetchDebates, createDebate, setCurrentDebate } = useDebateStore();
  const [idea, setIdea] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchDebates();
  }, [fetchDebates]);

  const handleCreate = async () => {
    if (!idea.trim()) return;
    setCreating(true);
    try {
      const debate = await createDebate(idea.trim(), criteria);
      setCurrentDebate(debate.id);
    } catch (e) {
      console.error('Failed to create debate:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim() && criteria.length < 5) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const getStatusConfig = (status) => {
    const configs = {
      idle: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Ready' },
      researching: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Researching' },
      debating: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Debating' },
      judging: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Judging' },
      complete: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Complete' },
    };
    return configs[status] || configs.idle;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            <span className="text-gradient">The Idea Refinery</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            AI agents debate and validate your startup ideas with real-time research, evidence gathering, and multi-step reasoning
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:via-purple-500 hover:to-pink-400 transition-all shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 text-lg"
          >
            + New Debate
          </button>
        </motion.div>

        {/* Debate cards grid */}
        {debates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {debates.map((debate, index) => {
              const statusCfg = getStatusConfig(debate.status);
              return (
                <motion.div
                  key={debate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setCurrentDebate(debate.id)}
                  className="glass-strong rounded-2xl p-6 cursor-pointer hover:bg-white/[0.12] transition-all group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {debate.finalVerdict && (
                      <span className="text-lg font-bold text-gradient">
                        {debate.finalVerdict.score}/100
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {debate.idea}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{debate.nodes?.length || 0} nodes</span>
                    <span>·</span>
                    <span>Round {debate.round || 0}</span>
                    <span>·</span>
                    <span>{debate.branches?.length || 0} branches</span>
                  </div>
                  {debate.finalVerdict && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className={`text-sm font-medium uppercase ${
                        debate.finalVerdict.recommendation === 'pursue' ? 'text-green-400' :
                        debate.finalVerdict.recommendation === 'pivot' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {debate.finalVerdict.recommendation}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {debates.length === 0 && !showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">🧪</div>
            <p className="text-xl text-gray-400 mb-2">No debates yet</p>
            <p className="text-gray-500">Create your first debate to get started</p>
          </motion.div>
        )}

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gradient-blue">AI Agents</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Three specialized agents debate your idea with real-time research and multi-step reasoning
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gradient-purple">Live Research</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Perplexity Sonar and Stagehand validate claims with live web data and real citations
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🌳</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gradient">Visual Tree</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fork and explore different directions like git branches with an interactive debate tree
            </p>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl p-8 md:p-12 max-w-xl w-full border border-white/20 shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-8 text-gradient">New Debate</h2>

              <div className="mb-6">
                <label htmlFor="idea" className="block text-sm font-medium text-gray-300 mb-3">
                  Your Startup Idea
                </label>
                <textarea
                  id="idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., An AI that helps you pack for trips based on your calendar and weather"
                  className="w-full px-6 py-4 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                  rows={3}
                  autoFocus
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Optimization Criteria <span className="text-gray-500">(Optional, max 5)</span>
                </label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCriterion()}
                    placeholder="e.g., Must be feasible in 3 months"
                    className="flex-1 px-6 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                  <button
                    onClick={handleAddCriterion}
                    disabled={!newCriterion.trim() || criteria.length >= 5}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 transition-all shadow-lg shadow-cyan-500/25"
                  >
                    Add
                  </button>
                </div>
                {criteria.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {criteria.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 rounded-full text-sm"
                      >
                        {c}
                        <button onClick={() => handleRemoveCriterion(i)} className="ml-2 text-purple-300 hover:text-white">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating || !idea.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:via-purple-500 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-purple-500/25 text-lg relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {creating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Start Debate →'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-4 glass text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
