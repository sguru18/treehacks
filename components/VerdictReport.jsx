'use client';

/**
 * @typedef {import('@/lib/types.js').Verdict} Verdict
 */

export default function VerdictReport({ verdict }) {
  if (!verdict) return null;

  const recommendationColors = {
    pursue: 'bg-green-100 text-green-800 border-green-300',
    pivot: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    pass: 'bg-red-100 text-red-800 border-red-300',
  };

  const recommendationIcons = {
    pursue: '✅',
    pivot: '🔄',
    pass: '❌',
  };

  const scoreColor = verdict.score >= 70 ? 'text-green-600' : verdict.score >= 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Final Verdict</h2>

      {/* Recommendation */}
      <div className={`mb-6 p-6 rounded-lg border-2 ${recommendationColors[verdict.recommendation] || recommendationColors.pivot}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{recommendationIcons[verdict.recommendation] || '🔄'}</span>
          <div>
            <div className="text-2xl font-bold">
              {verdict.recommendation.toUpperCase()}
            </div>
            <div className={`text-4xl font-bold ${scoreColor}`}>
              Score: {verdict.score}/100
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Reasoning</h3>
        <p className="text-gray-700 leading-relaxed">{verdict.reasoning}</p>
      </div>

      {/* Strengths */}
      {verdict.strengths && verdict.strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-green-700">Strengths</h3>
          <ul className="list-disc list-inside space-y-2">
            {verdict.strengths.map((strength, index) => (
              <li key={index} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {verdict.weaknesses && verdict.weaknesses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-700">Weaknesses</h3>
          <ul className="list-disc list-inside space-y-2">
            {verdict.weaknesses.map((weakness, index) => (
              <li key={index} className="text-gray-700">{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {verdict.risks && verdict.risks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-red-700">Risks</h3>
          <ul className="list-disc list-inside space-y-2">
            {verdict.risks.map((risk, index) => (
              <li key={index} className="text-gray-700">{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations */}
      {verdict.citations && verdict.citations.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-xl font-semibold mb-3">Evidence & Citations</h3>
          <div className="space-y-2">
            {verdict.citations.map((citation, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {citation.title || citation.url}
                </a>
                {citation.snippet && (
                  <p className="text-sm text-gray-600 mt-1">{citation.snippet}</p>
                )}
                <span className="text-xs text-gray-500 ml-2">
                  ({citation.source || 'unknown'})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
