'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * @typedef {import('@/lib/types.js').DebateNode} DebateNode
 */

function DebateNode({ data }) {
  const nodeType = data.type || 'advocate';
  const content = data.content || '';
  const score = data.score;
  const citations = data.citations || [];

  const nodeStyles = {
    advocate: 'bg-green-50 border-green-300',
    critic: 'bg-red-50 border-red-300',
    judge: 'bg-blue-50 border-blue-300',
    research: 'bg-purple-50 border-purple-300',
    fork: 'bg-amber-50 border-amber-300',
    verdict: 'bg-indigo-50 border-indigo-300',
  };

  const iconStyles = {
    advocate: 'text-green-600',
    critic: 'text-red-600',
    judge: 'text-blue-600',
    research: 'text-purple-600',
    fork: 'text-amber-600',
    verdict: 'text-indigo-600',
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-md ${nodeStyles[nodeType] || 'bg-gray-50 border-gray-300'}`}
      style={{ minWidth: '250px', maxWidth: '300px' }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center justify-between mb-2">
        <div className={`font-semibold text-sm uppercase ${iconStyles[nodeType] || 'text-gray-600'}`}>
          {nodeType}
        </div>
        {score !== undefined && (
          <div className="text-xs font-medium text-gray-600">
            Score: {score}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-700 mb-2 line-clamp-4">
        {content.substring(0, 200)}
        {content.length > 200 && '...'}
      </div>

      {citations.length > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          {citations.length} citation{citations.length !== 1 ? 's' : ''}
        </div>
      )}

      {data.onFork && (
        <button
          onClick={data.onFork}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Fork from here
        </button>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(DebateNode);
