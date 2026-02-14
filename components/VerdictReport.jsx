'use client';

import { motion } from 'framer-motion';

const RECOMMENDATION_CONFIG = {
  pursue: {
    bg: 'bg-gradient-to-br from-green-500/20 to-emerald-600/20',
    border: 'border-green-500/40',
    text: 'text-green-300',
    icon: '✅',
    glow: 'shadow-lg shadow-green-500/25',
  },
  pivot: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: '🔄',
    glow: 'shadow-lg shadow-amber-500/25',
  },
  pass: {
    bg: 'bg-gradient-to-br from-red-500/20 to-pink-600/20',
    border: 'border-red-500/40',
    text: 'text-red-300',
    icon: '❌',
    glow: 'shadow-lg shadow-red-500/25',
  },
};

export default function VerdictReport({ verdict }) {
  if (!verdict) return null;

  const config = RECOMMENDATION_CONFIG[verdict.recommendation] || RECOMMENDATION_CONFIG.pivot;
  const scoreColor = verdict.score >= 70 ? 'text-green-400' : verdict.score >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-8 border border-white/10"
    >
      <h2 className="text-4xl font-bold mb-8 text-gradient">Final Verdict</h2>

      {/* Recommendation */}
      <div className={`mb-8 p-8 rounded-2xl border-2 ${config.border} ${config.bg} ${config.glow} backdrop-blur-xl`}>
        <div className="flex items-center gap-6">
          <span className="text-6xl">{config.icon}</span>
          <div>
            <div className={`text-3xl font-bold uppercase ${config.text} mb-2`}>
              {verdict.recommendation}
            </div>
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {verdict.score}/100
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-gradient-blue">Reasoning</h3>
        <p className="text-gray-300 leading-relaxed text-lg">{verdict.reasoning}</p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {verdict.strengths?.length > 0 && (
          <div className="glass rounded-xl p-6 border border-green-500/20">
            <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
              <span>💚</span> Strengths
            </h3>
            <ul className="space-y-3">
              {verdict.strengths.map((s, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verdict.weaknesses?.length > 0 && (
          <div className="glass rounded-xl p-6 border border-amber-500/20">
            <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
              <span>⚠️</span> Weaknesses
            </h3>
            <ul className="space-y-3">
              {verdict.weaknesses.map((w, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verdict.risks?.length > 0 && (
          <div className="glass rounded-xl p-6 border border-red-500/20">
            <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
              <span>🚨</span> Risks
            </h3>
            <ul className="space-y-3">
              {verdict.risks.map((r, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next Steps */}
      {verdict.nextSteps?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gradient-purple">Next Steps</h3>
          <div className="space-y-3">
            {verdict.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl p-4 border border-purple-500/10">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-sm font-bold text-purple-300">
                  {i + 1}
                </span>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {verdict.citations?.length > 0 && (
        <div className="pt-8 border-t border-white/10">
          <h3 className="text-2xl font-bold mb-6 text-gradient-purple">Evidence & Citations</h3>
          <div className="space-y-3">
            {verdict.citations.map((c, i) => (
              <div key={i} className="glass rounded-xl p-4 hover:bg-white/10 transition-all">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2"
                >
                  <span>🔗</span>
                  <span>{c.title || c.url}</span>
                  <span className="text-xs text-gray-500">↗</span>
                </a>
                {c.snippet && <p className="text-sm text-gray-400 mt-2 ml-6">{c.snippet}</p>}
                <span className="text-xs text-gray-500 ml-6 mt-1 inline-block">({c.source})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
