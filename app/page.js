'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DebateView from '@/components/DebateView';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [debateId, setDebateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartDebate = async () => {
    if (!idea.trim()) {
      alert('Please enter an idea');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, criteria }),
      });

      if (!response.ok) {
        throw new Error('Failed to start debate');
      }

      const debate = await response.json();
      setDebateId(debate.id);
    } catch (error) {
      console.error('Error starting debate:', error);
      alert('Failed to start debate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim() && !criteria.includes(newCriterion.trim())) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  if (debateId) {
    return <DebateView debateId={debateId} onBack={() => setDebateId(null)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            The Idea Refinery
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            AI agents debate and validate your startup ideas
          </p>
          <p className="text-gray-500">
            Watch AI agents argue for and against your idea, with real-time research and validation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
              Your Startup Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., An AI that helps you pack for trips based on your calendar and weather"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Criteria (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCriterion()}
                placeholder="e.g., Must be technically feasible in 3 months"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCriterion}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {criteria.map((criterion, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {criterion}
                    <button
                      onClick={() => handleRemoveCriterion(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleStartDebate}
            disabled={loading || !idea.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Starting Debate...' : 'Start Debate'}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">🤖 AI Agents</h3>
            <p className="text-gray-600 text-sm">
              Three specialized agents debate your idea with real-time research
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">🔍 Real Research</h3>
            <p className="text-gray-600 text-sm">
              Perplexity Sonar and Stagehand validate claims with live web data
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">🌳 Visual Tree</h3>
            <p className="text-gray-600 text-sm">
              Fork and explore different directions like git branches
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
