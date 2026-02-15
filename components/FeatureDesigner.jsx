'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';

/* ---- Mode configuration ---- */
const MODES = [
  { id: 'fast', label: 'Fast', desc: 'Quick responses' },
  { id: 'think', label: 'Think', desc: 'Balanced analysis' },
  { id: 'deep', label: 'Deep Think', desc: 'Thorough reasoning' },
];

/* ---- Style maps ---- */
const CATEGORY_LABELS = {
  ui: 'UI', backend: 'Backend', data: 'Data', workflow: 'Workflow',
  integration: 'Integration', infrastructure: 'Infra',
};
const CATEGORY_STYLES = {
  ui: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  backend: 'bg-violet-50 text-violet-700 border-violet-200',
  data: 'bg-amber-50 text-amber-700 border-amber-200',
  workflow: 'bg-blue-50 text-blue-700 border-blue-200',
  integration: 'bg-brand-50 text-brand-700 border-brand-200',
  infrastructure: 'bg-gray-50 text-gray-600 border-gray-200',
};
const TYPE_DOT = {
  pain_point: 'bg-red-400', feature_request: 'bg-blue-400',
  praise: 'bg-brand-500', confusion: 'bg-amber-400',
};

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-500 tabular-nums w-4 text-right">{value}</span>
    </div>
  );
}

export default function FeatureDesigner() {
  const insights = useProductStore((s) => s.insights);
  const features = useProductStore((s) => s.features);
  const addFeature = useProductStore((s) => s.addFeature);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposedFeature, setProposedFeature] = useState(null);
  const [selectedInsightIds, setSelectedInsightIds] = useState(new Set());
  const [mode, setMode] = useState('think');
  const [modeOpen, setModeOpen] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const modeRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (modeRef.current && !modeRef.current.contains(e.target)) setModeOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleInsight = (id) => {
    setSelectedInsightIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const relevantInsights = selectedInsightIds.size > 0
        ? insights.filter((ins) => selectedInsightIds.has(ins.id))
        : insights;

      const res = await fetch('/api/design-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          insights: relevantInsights,
          existingFeatures: features,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);

      if (data.feature) {
        const relevantList = selectedInsightIds.size > 0
          ? insights.filter((ins) => selectedInsightIds.has(ins.id))
          : insights;
        const insightIds = (data.feature.insightIndices || [])
          .map((idx) => relevantList[idx]?.id)
          .filter(Boolean);
        setProposedFeature({ ...data.feature, insightIds });
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const acceptFeature = () => {
    if (!proposedFeature) return;
    addFeature(proposedFeature);
    setMessages([]);
    setProposedFeature(null);
    setInput('');
    setSelectedInsightIds(new Set());
  };

  const startOver = () => {
    setMessages([]);
    setProposedFeature(null);
    setInput('');
  };

  const currentMode = MODES.find((m) => m.id === mode) || MODES[1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-5 shadow-sm">

      {/* ---- Top bar ---- */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-[13px] font-semibold text-gray-700">Feature Designer</span>
          </div>
          <span className="w-px h-4 bg-gray-200" />

          {/* Mode dropdown */}
          <div className="relative" ref={modeRef}>
            <button
              onClick={() => setModeOpen(!modeOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[11px] font-medium text-gray-600"
            >
              {currentMode.label}
              <svg className={`w-3 h-3 text-gray-400 transition-transform ${modeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {modeOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setModeOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between transition-colors ${
                      mode === m.id ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{m.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={startOver} className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ---- Body: 3-column layout ---- */}
      <div className="flex" style={{ height: 320 }}>

        {/* Left: Insight context sidebar */}
        {insights.length > 0 && (
          <div className="w-52 border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Insight Context</p>
              <p className="text-[9px] text-gray-400 mt-0.5">
                {selectedInsightIds.size > 0 ? `${selectedInsightIds.size} selected` : 'All insights used'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
              {insights.map((ins) => {
                const selected = selectedInsightIds.has(ins.id);
                const dot = TYPE_DOT[ins.type] || 'bg-gray-400';
                return (
                  <button
                    key={ins.id}
                    onClick={() => toggleInsight(ins.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-[10px] leading-snug transition-colors flex items-start gap-1.5 ${
                      selected ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${selected ? 'bg-brand-500' : dot}`} />
                    <span className="line-clamp-2">{ins.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Center: Conversation */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-2.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-[12px] text-gray-500 font-medium mb-1">Describe what you want to build</p>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-3 max-w-xs">
                  Reference specific insights, describe user problems, or share a product vision. Daisy will help you shape it into a feature.
                </p>
                {insights.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {['Address the top pain points', 'Quick win for this sprint', 'Most requested capability'].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-[10px] text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 mr-1.5">
                    <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-700 border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 mr-1.5">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{currentMode.label}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Describe what you want to build..."
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-[12px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="h-[34px] px-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-white rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Feature preview */}
        <div className={`border-l border-gray-100 shrink-0 flex flex-col transition-all ${proposedFeature ? 'w-64' : 'w-0 overflow-hidden'}`}>
          {proposedFeature && (
            <div className="w-64 flex flex-col h-full">
              <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Proposed</p>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${CATEGORY_STYLES[proposedFeature.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {CATEGORY_LABELS[proposedFeature.category] || proposedFeature.category}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 leading-snug mb-1">{proposedFeature.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{proposedFeature.description}</p>
                </div>

                {proposedFeature.rationale && (
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Rationale</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{proposedFeature.rationale}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <ScoreBar label="Impact" value={proposedFeature.impact || 5} color="bg-brand-500" />
                  <ScoreBar label="Effort" value={proposedFeature.effort || 5} color="bg-amber-400" />
                  <ScoreBar label="Confidence" value={proposedFeature.confidence || 5} color="bg-blue-400" />
                </div>

                <div className="text-[10px] text-gray-400">
                  Priority score: <span className="font-semibold text-gray-600 tabular-nums">
                    {(((proposedFeature.impact || 5) * (proposedFeature.confidence || 5)) / Math.max(proposedFeature.effort || 5, 1)).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={acceptFeature}
                  className="w-full h-8 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Feature
                </button>
                <p className="text-[9px] text-gray-400 text-center mt-1.5">or keep refining with conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
