'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import useDebateStore from '@/store/useDebateStore';
import { DebateTree } from './debate-tree';
import StreamPanel from './StreamPanel';
import ForkRewindPanel from './ForkRewindPanel';
import VerdictReport from './VerdictReport';

export default function DebateView() {
  const {
    currentDebate,
    currentDebateId,
    streaming,
    startRound,
    fetchDebate,
    clearCurrent,
    fork,
  } = useDebateStore();

  useEffect(() => {
    if (currentDebateId) {
      fetchDebate(currentDebateId);
    }
  }, [currentDebateId, fetchDebate]);

  if (!currentDebate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl text-gray-400">Loading debate...</div>
        </div>
      </div>
    );
  }

  const handleFork = (nodeId) => {
    const label = prompt('Enter a label for this fork (e.g., "What if we targeted enterprise?")');
    if (label?.trim()) {
      fork(nodeId, label.trim());
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div>
              <button
                onClick={clearCurrent}
                className="text-gray-400 hover:text-white mb-2 flex items-center gap-2 transition group text-sm"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-1">{currentDebate.idea}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Round {currentDebate.round || 0}</span>
                <span>·</span>
                <span>{currentDebate.nodes?.length || 0} nodes</span>
                <span>·</span>
                <span className="capitalize">{currentDebate.status}</span>
              </div>
            </div>
            <button
              onClick={startRound}
              disabled={streaming}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 shrink-0"
            >
              {streaming ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Debating...
                </span>
              ) : (
                'Run Debate Round →'
              )}
            </button>
          </motion.div>

          {/* Main layout: two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stream + Tree (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stream Panel */}
              <StreamPanel />

              {/* Debate Tree */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-gradient-blue">Debate Tree</h3>
                <DebateTree debate={currentDebate} onFork={handleFork} />
              </div>

              {/* Verdict */}
              {currentDebate.finalVerdict && (
                <VerdictReport verdict={currentDebate.finalVerdict} />
              )}
            </div>

            {/* Right: Fork/Rewind Panel (1 col) */}
            <div>
              <ForkRewindPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
