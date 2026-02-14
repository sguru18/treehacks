'use client';

import { motion, AnimatePresence } from 'framer-motion';
import useDebateStore from '@/store/useDebateStore';

const AGENT_CONFIG = {
  advocate: {
    name: 'Advocate',
    icon: '💚',
    gradient: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    dot: 'bg-cyan-500',
  },
  critic: {
    name: 'Critic',
    icon: '💔',
    gradient: 'from-pink-500/20 to-red-600/20',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    dot: 'bg-pink-500',
  },
  judge: {
    name: 'Judge',
    icon: '⚖️',
    gradient: 'from-purple-500/20 to-indigo-600/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    dot: 'bg-purple-500',
  },
};

export default function StreamPanel() {
  const { streaming, streamAgent, streamContent, judgeSteps } = useDebateStore();

  if (!streaming && judgeSteps.length === 0) return null;

  const config = AGENT_CONFIG[streamAgent] || AGENT_CONFIG.judge;

  return (
    <div className="space-y-4">
      {/* Current stream */}
      <AnimatePresence>
        {streaming && streamContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`glass-strong rounded-2xl p-6 border ${config.border}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${config.dot} animate-pulse`} />
              <span className="text-lg">{config.icon}</span>
              <span className={`font-bold ${config.text}`}>{config.name}</span>
              <span className="text-xs text-gray-500">streaming...</span>
            </div>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm custom-scrollbar max-h-[300px] overflow-y-auto">
              {streamContent}
              <span className="inline-block w-2 h-4 bg-white/50 ml-1 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Judge reasoning steps */}
      <AnimatePresence>
        {judgeSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">⚖️</span>
              <span className="font-bold text-purple-300">Judge Reasoning Pipeline</span>
            </div>
            <div className="space-y-2">
              {judgeSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <StepIcon step={step.step} />
                  <span className="text-gray-300">
                    {step.message || step.step.replace(/_/g, ' ')}
                  </span>
                  {step.step?.endsWith('_done') && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                  {step.step?.endsWith('_error') && (
                    <span className="text-red-400 text-xs">✗</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIcon({ step }) {
  const icons = {
    extract: '📋',
    extract_done: '📋',
    classify: '🏷️',
    classify_done: '🏷️',
    verify: '✅',
    verify_done: '✅',
    verify_error: '❌',
    scrape: '🌐',
    scrape_done: '🌐',
    scrape_error: '❌',
    reflect: '🤔',
    reflect_done: '🤔',
    verdict: '📊',
    verdict_done: '📊',
  };

  return <span>{icons[step] || '•'}</span>;
}
