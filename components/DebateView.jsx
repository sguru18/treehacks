'use client';

import { useState, useEffect } from 'react';
import { DebateTree } from './debate-tree';
import VerdictReport from './VerdictReport';
import ForkRewindPanel from './ForkRewindPanel';

/**
 * @typedef {import('@/lib/types.js').DebateTree} DebateTree
 */

export default function DebateView({ debateId, onBack }) {
  const [debate, setDebate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [currentContent, setCurrentContent] = useState('');

  useEffect(() => {
    loadDebate();
  }, [debateId]);

  const loadDebate = async () => {
    try {
      const response = await fetch(`/api/debate/${debateId}`);
      if (response.ok) {
        const data = await response.json();
        setDebate(data);
      }
    } catch (error) {
      console.error('Error loading debate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async () => {
    setStreaming(true);
    setCurrentContent('');

    try {
      const response = await fetch(`/api/debate/${debateId}/stream`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setStreaming(false);
              await loadDebate();
              return;
            }

            try {
              const event = JSON.parse(data);
              
              if (event.type === 'advocate' || event.type === 'critic') {
                setCurrentContent(event.fullContent || '');
              } else if (event.type === 'node') {
                await loadDebate();
              } else if (event.type === 'verdict') {
                await loadDebate();
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming debate:', error);
      setStreaming(false);
    }
  };

  const handleFork = async (nodeId, label) => {
    try {
      const response = await fetch(`/api/debate/${debateId}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, label }),
      });

      if (response.ok) {
        await loadDebate();
      }
    } catch (error) {
      console.error('Error forking debate:', error);
    }
  };

  const handleRewind = async (nodeId) => {
    try {
      const response = await fetch(`/api/debate/${debateId}/rewind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId }),
      });

      if (response.ok) {
        await loadDebate();
      }
    } catch (error) {
      console.error('Error rewinding debate:', error);
    }
  };

  const handleSwitchBranch = async (branchId) => {
    // Update debate's current branch (this would need an API endpoint or local state)
    // For now, we'll reload and the backend should handle it
    await loadDebate();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading debate...</div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Debate not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{debate.idea}</h1>
          </div>
          <button
            onClick={handleStartRound}
            disabled={streaming}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {streaming ? 'Debating...' : 'Run Debate Round'}
          </button>
        </div>

        {streaming && currentContent && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-2">Streaming...</div>
            <div className="text-gray-800">{currentContent}</div>
          </div>
        )}

        <ForkRewindPanel
          debate={debate}
          onFork={handleFork}
          onRewind={handleRewind}
          onSwitchBranch={handleSwitchBranch}
        />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <DebateTree debate={debate} onFork={(nodeId) => handleFork(nodeId, 'New Fork')} />
        </div>

        {debate.finalVerdict && (
          <VerdictReport verdict={debate.finalVerdict} />
        )}
      </div>
    </div>
  );
}
