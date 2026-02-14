'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const NODE_CONFIG = {
  advocate: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    icon: '💚',
    glow: 'shadow-lg shadow-cyan-500/20',
  },
  critic: {
    bg: 'bg-gradient-to-br from-pink-500/20 to-red-600/20',
    border: 'border-pink-500/40',
    text: 'text-pink-300',
    icon: '💔',
    glow: 'shadow-lg shadow-pink-500/20',
  },
  judge: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    icon: '⚖️',
    glow: 'shadow-lg shadow-purple-500/20',
  },
  research: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    icon: '🔍',
    glow: 'shadow-lg shadow-blue-500/20',
  },
  fork: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: '🌳',
    glow: 'shadow-lg shadow-amber-500/20',
  },
  verdict: {
    bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20',
    border: 'border-indigo-500/40',
    text: 'text-indigo-300',
    icon: '📊',
    glow: 'shadow-lg shadow-indigo-500/20',
  },
};

function DebateNodeComponent({ data }) {
  const nodeType = data.type || 'advocate';
  const content = data.content || '';
  const score = data.score;
  const citations = data.citations || [];
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG.advocate;

  return (
    <div
      className={`glass-strong rounded-xl p-4 border-2 ${config.border} ${config.glow} backdrop-blur-xl`}
      style={{ minWidth: '260px', maxWidth: '300px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-400 !border-2 !border-cyan-300 !w-3 !h-3"
      />

      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 font-bold text-xs uppercase ${config.text}`}>
          <span>{config.icon}</span>
          <span>{nodeType}</span>
        </div>
        {score !== undefined && score !== null && (
          <div className={`text-xs font-bold px-2 py-1 rounded-lg ${config.bg} ${config.text} border ${config.border}`}>
            {score}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-300 mb-3 line-clamp-4 leading-relaxed">
        {content.substring(0, 200)}
        {content.length > 200 && '...'}
      </div>

      {citations.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>🔗</span>
          <span>{citations.length} citation{citations.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {data.onFork && (
        <button
          onClick={(e) => { e.stopPropagation(); data.onFork(); }}
          className="mt-2 text-xs px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/20 transition-all"
        >
          Fork from here →
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-400 !border-2 !border-cyan-300 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(DebateNodeComponent);
