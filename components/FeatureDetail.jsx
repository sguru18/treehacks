'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';

const TASK_TYPE = {
  frontend: { label: 'Frontend', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  backend: { label: 'Backend', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  database: { label: 'Database', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  api: { label: 'API', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  test: { label: 'Test', color: 'text-brand-700', bg: 'bg-brand-50', border: 'border-brand-200' },
  infrastructure: { label: 'Infra', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const EFFORT = {
  xs: { label: 'XS', desc: '< 30 min', color: 'text-brand-700' },
  s: { label: 'S', desc: '30 min – 2 hr', color: 'text-brand-600' },
  m: { label: 'M', desc: '2 – 4 hr', color: 'text-amber-600' },
  l: { label: 'L', desc: '4 – 8 hr', color: 'text-orange-600' },
  xl: { label: 'XL', desc: '1 – 2 days', color: 'text-red-600' },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ---------- AI badge ---------- */
function AiBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-gray-400 ${className}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
      Daisy AI
    </span>
  );
}

/* ---------- Tiny copy button ---------- */
function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handle = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };
  return (
    <button
      onClick={handle}
      className="px-2 py-1 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          {label}
        </>
      )}
    </button>
  );
}

/* ---------- Section card helper ---------- */
function Section({ icon, title, children }) {
  return (
    <div className="card rounded-xl p-5">
      <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-brand-50 flex items-center justify-center text-brand-700 text-[10px] font-bold">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ====================================================================
   Main component
   ==================================================================== */

export default function FeatureDetail() {
  const features = useProductStore((s) => s.features);
  const insights = useProductStore((s) => s.insights);
  const selectedFeatureId = useProductStore((s) => s.selectedFeatureId);
  const setView = useProductStore((s) => s.setView);
  const generateSpec = useProductStore((s) => s.generateSpec);
  const generateTasks = useProductStore((s) => s.generateTasks);
  const generatingSpec = useProductStore((s) => s.generatingSpec);
  const generatingTasks = useProductStore((s) => s.generatingTasks);

  const [tab, setTab] = useState('overview');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const feature = features.find((f) => f.id === selectedFeatureId);
  if (!feature) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Feature not found.</p>
        <button onClick={() => setView('features')} className="mt-3 text-brand-600 text-sm hover:underline">
          Back to features
        </button>
      </div>
    );
  }

  const related = insights.filter((i) => feature.insightIds?.includes(i.id));
  const hasSpec = !!feature.spec;
  const hasTasks = !!feature.tasks?.length;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'spec', label: 'Spec', ready: hasSpec },
    { id: 'tasks', label: 'Tasks', count: feature.tasks?.length },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto">
      {/* Back */}
      <motion.button
        variants={fadeUp}
        onClick={() => setView('features')}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-[13px] mb-5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Features
      </motion.button>

      {/* Header card */}
      <motion.div variants={fadeUp} className="card rounded-xl p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-brand-800 tabular-nums">
              {(feature.priorityScore || 0).toFixed(1)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h1>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-2">{feature.description}</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-gray-400">Impact <span className="font-semibold text-brand-700">{feature.impact}/10</span></span>
              <span className="text-gray-400">Effort <span className="font-semibold text-amber-600">{feature.effort}/10</span></span>
              <span className="text-gray-400">Confidence <span className="font-semibold text-blue-600">{feature.confidence}/10</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-0.5 mb-5 bg-gray-100 rounded-lg p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5 ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && <span className="bg-brand-50 text-brand-700 text-[10px] font-semibold px-1.5 rounded-full">{t.count}</span>}
            {t.ready && (
              <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        ))}
      </motion.div>

      {/* ---- TAB CONTENT ---- */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <Section icon="R" title="Rationale">
              <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.rationale}</p>
            </Section>

            {related.length > 0 && (
              <Section icon="I" title={`Supporting Insights (${related.length})`}>
                <div className="space-y-2">
                  {related.map((ins) => (
                    <div key={ins.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                      <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        ins.type === 'pain_point' ? 'bg-red-400' : ins.type === 'feature_request' ? 'bg-blue-400' : ins.type === 'praise' ? 'bg-brand-500' : 'bg-amber-400'
                      }`} />
                      <div>
                        <p className="text-[12px] font-medium text-gray-700">{ins.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{ins.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {!hasSpec && (
              <div className="text-center pt-2">
                <button
                  onClick={() => { generateSpec(feature.id); setTab('spec'); }}
                  disabled={generatingSpec}
                  className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium transition-colors inline-flex items-center gap-2"
                >
                  {generatingSpec ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                      Generate Spec
                    </>
                  )}
                </button>
                <AiBadge className="mt-2 justify-center" />
              </div>
            )}
          </motion.div>
        )}

        {/* SPEC */}
        {tab === 'spec' && (
          <motion.div key="sp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
            {generatingSpec && (
              <div className="card rounded-xl p-12 text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-3">
                  <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-700">Daisy is writing the spec...</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Analyzing feature requirements — 15–30 seconds</p>
                <AiBadge className="mt-3 justify-center" />
              </div>
            )}

            {hasSpec && (
              <>
                <Section icon="U" title="User Stories">
                  <ol className="space-y-1.5 list-decimal list-inside">
                    {feature.spec.userStories?.map((s, i) => (
                      <li key={i} className="text-[12px] text-gray-600 leading-relaxed">{s}</li>
                    ))}
                  </ol>
                </Section>

                <Section icon="V" title="UI Changes">
                  <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.uiChanges}</p>
                </Section>

                <Section icon="D" title="Data Model Changes">
                  <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.dataModelChanges}</p>
                </Section>

                <Section icon="W" title="Workflow Changes">
                  <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.workflowChanges}</p>
                </Section>

                <Section icon="M" title="Success Metrics">
                  <ul className="space-y-1">
                    {feature.spec.successMetrics?.map((m, i) => (
                      <li key={i} className="text-[12px] text-gray-600 flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {m}
                      </li>
                    ))}
                  </ul>
                </Section>

                {feature.spec.technicalNotes && (
                  <Section icon="T" title="Technical Notes">
                    <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.technicalNotes}</p>
                  </Section>
                )}

                {feature.spec.acceptanceCriteria?.length > 0 && (
                  <Section icon="A" title="Acceptance Criteria">
                    <ul className="space-y-1">
                      {feature.spec.acceptanceCriteria.map((c, i) => (
                        <li key={i} className="text-[12px] text-gray-600 flex items-start gap-2">
                          <span className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {!hasTasks && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => { generateTasks(feature.id); setTab('tasks'); }}
                      disabled={generatingTasks}
                      className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium transition-colors inline-flex items-center gap-2"
                    >
                      {generatingTasks ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
                          Generate Dev Tasks
                        </>
                      )}
                    </button>
                    <AiBadge className="mt-2 justify-center" />
                  </div>
                )}
              </>
            )}

            {!hasSpec && !generatingSpec && (
              <div className="card rounded-xl p-12 text-center">
                <p className="text-gray-400 text-sm mb-3">No specification yet.</p>
                <button onClick={() => generateSpec(feature.id)} className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors">
                  Generate Specification
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* TASKS */}
        {tab === 'tasks' && (
          <motion.div key="tk" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-2">
            {generatingTasks && (
              <div className="card rounded-xl p-12 text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-3">
                  <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-700">Daisy is breaking down tasks...</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Generating agent-ready prompts with story points</p>
                <AiBadge className="mt-3 justify-center" />
              </div>
            )}

            {hasTasks && (
              <>
                <p className="text-[11px] text-gray-400 mb-1">{feature.tasks.length} tasks ready for your coding agent</p>

                {feature.tasks.map((task, idx) => {
                  const tc = TASK_TYPE[task.type] || TASK_TYPE.frontend;
                  const ef = EFFORT[task.estimatedEffort] || EFFORT.m;
                  const open = expandedTaskId === task.id;
                  const deps = task.dependsOn?.length ? task.dependsOn.map((d) => `#${d + 1}`).join(', ') : null;

                  return (
                    <motion.div key={task.id} variants={fadeUp} className="card rounded-xl overflow-hidden">
                      <div className="p-4 cursor-pointer hover:bg-gray-50/60 transition-colors" onClick={() => setExpandedTaskId(open ? null : task.id)}>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 tabular-nums shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tc.bg} ${tc.color}`}>{tc.label}</span>
                              <span className={`text-[10px] font-medium ${ef.color}`}>{ef.label} · {ef.desc}</span>
                              {deps && <span className="text-[10px] text-gray-400">needs {deps}</span>}
                            </div>
                            <h4 className="text-[13px] font-semibold text-gray-800">{task.title}</h4>
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <CopyBtn text={task.agentPrompt} label="Copy Prompt" />
                            <svg className={`w-4 h-4 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Description</p>
                                <p className="text-[12px] text-gray-600 leading-relaxed">{task.description}</p>
                              </div>

                              {task.acceptanceCriteria?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Acceptance Criteria</p>
                                  <ul className="space-y-0.5">
                                    {task.acceptanceCriteria.map((ac, i) => (
                                      <li key={i} className="text-[12px] text-gray-600 flex items-start gap-2">
                                        <span className="w-3 h-3 rounded border border-gray-200 mt-0.5 shrink-0" />
                                        {ac}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Agent Prompt</p>
                                  <CopyBtn text={task.agentPrompt} label="Copy" />
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 max-h-56 overflow-y-auto custom-scrollbar">
                                  <pre className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">{task.agentPrompt}</pre>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </>
            )}

            {!hasTasks && !generatingTasks && (
              <div className="card rounded-xl p-12 text-center">
                {hasSpec ? (
                  <>
                    <p className="text-gray-400 text-sm mb-3">No tasks generated yet.</p>
                    <button onClick={() => generateTasks(feature.id)} className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors">
                      Generate Dev Tasks
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Generate a spec first, then break it into tasks.</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
