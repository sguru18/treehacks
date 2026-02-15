'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';
import EditableField from '@/components/EditableField';

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
  const generateResearch = useProductStore((s) => s.generateResearch);
  const generateCritic = useProductStore((s) => s.generateCritic);
  const generateRisk = useProductStore((s) => s.generateRisk);
  const generateEstimate = useProductStore((s) => s.generateEstimate);
  const generatingSpec = useProductStore((s) => s.generatingSpec);
  const generatingTasks = useProductStore((s) => s.generatingTasks);
  const generatingResearch = useProductStore((s) => s.generatingResearch);
  const generatingCritic = useProductStore((s) => s.generatingCritic);
  const generatingRisk = useProductStore((s) => s.generatingRisk);
  const generatingEstimate = useProductStore((s) => s.generatingEstimate);
  const addToRoadmap = useProductStore((s) => s.addToRoadmap);
  const roadmapItems = useProductStore((s) => s.roadmapItems);
  const updateSpecSection = useProductStore((s) => s.updateSpecSection);
  const updateTask = useProductStore((s) => s.updateTask);
  const updateFeature = useProductStore((s) => s.updateFeature);

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

  const hasValidation = !!(feature.research || feature.critique || feature.risk || feature.estimate);
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'spec', label: 'Spec', ready: hasSpec },
    { id: 'tasks', label: 'Tasks', count: feature.tasks?.length },
    { id: 'validate', label: 'Validate', ready: hasValidation },
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
            <EditableField
              value={feature.title}
              onSave={(v) => updateFeature(feature.id, { title: v })}
              type="text"
              label="Feature Title"
              context={{ featureTitle: feature.title, sectionName: 'title' }}
            >
              <h1 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h1>
            </EditableField>
            <EditableField
              value={feature.description}
              onSave={(v) => updateFeature(feature.id, { description: v })}
              type="textarea"
              label="Feature Description"
              context={{ featureTitle: feature.title, sectionName: 'description' }}
            >
              <p className="text-[13px] text-gray-500 leading-relaxed mb-2">{feature.description}</p>
            </EditableField>
            <div className="flex items-center gap-4 text-[11px] mb-3">
              <span className="text-gray-400">Impact <span className="font-semibold text-brand-700">{feature.impact}/10</span></span>
              <span className="text-gray-400">Effort <span className="font-semibold text-amber-600">{feature.effort}/10</span></span>
              <span className="text-gray-400">Confidence <span className="font-semibold text-blue-600">{feature.confidence}/10</span></span>
            </div>
            {roadmapItems.some((r) => r.featureId === feature.id) ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-[12px] font-medium text-brand-700 border border-brand-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                On Roadmap
              </span>
            ) : (
              <button
                onClick={() => addToRoadmap(feature.id, 'backlog')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-brand-50 text-[12px] font-medium text-gray-600 hover:text-brand-700 border border-gray-200 hover:border-brand-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add to Roadmap
              </button>
            )}
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
              <EditableField
                value={feature.rationale}
                onSave={(v) => updateFeature(feature.id, { rationale: v })}
                type="textarea"
                label="Rationale"
                context={{ featureTitle: feature.title, sectionName: 'rationale' }}
              >
                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.rationale}</p>
              </EditableField>
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
                  <EditableField
                    value={feature.spec.userStories}
                    onSave={(v) => updateSpecSection(feature.id, 'userStories', v)}
                    type="list"
                    label="User Stories"
                    context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'userStories' }}
                  >
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {feature.spec.userStories?.map((s, i) => (
                        <li key={i} className="text-[12px] text-gray-600 leading-relaxed">{s}</li>
                      ))}
                    </ol>
                  </EditableField>
                </Section>

                <Section icon="V" title="UI Changes">
                  <EditableField
                    value={feature.spec.uiChanges}
                    onSave={(v) => updateSpecSection(feature.id, 'uiChanges', v)}
                    type="textarea"
                    label="UI Changes"
                    context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'uiChanges' }}
                  >
                    <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.uiChanges}</p>
                  </EditableField>
                </Section>

                <Section icon="D" title="Data Model Changes">
                  <EditableField
                    value={feature.spec.dataModelChanges}
                    onSave={(v) => updateSpecSection(feature.id, 'dataModelChanges', v)}
                    type="textarea"
                    label="Data Model Changes"
                    context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'dataModelChanges' }}
                  >
                    <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.dataModelChanges}</p>
                  </EditableField>
                </Section>

                <Section icon="W" title="Workflow Changes">
                  <EditableField
                    value={feature.spec.workflowChanges}
                    onSave={(v) => updateSpecSection(feature.id, 'workflowChanges', v)}
                    type="textarea"
                    label="Workflow Changes"
                    context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'workflowChanges' }}
                  >
                    <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.workflowChanges}</p>
                  </EditableField>
                </Section>

                <Section icon="M" title="Success Metrics">
                  <EditableField
                    value={feature.spec.successMetrics}
                    onSave={(v) => updateSpecSection(feature.id, 'successMetrics', v)}
                    type="list"
                    label="Success Metrics"
                    context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'successMetrics' }}
                  >
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
                  </EditableField>
                </Section>

                {feature.spec.technicalNotes && (
                  <Section icon="T" title="Technical Notes">
                    <EditableField
                      value={feature.spec.technicalNotes}
                      onSave={(v) => updateSpecSection(feature.id, 'technicalNotes', v)}
                      type="textarea"
                      label="Technical Notes"
                      context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'technicalNotes' }}
                    >
                      <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">{feature.spec.technicalNotes}</p>
                    </EditableField>
                  </Section>
                )}

                {feature.spec.acceptanceCriteria?.length > 0 && (
                  <Section icon="A" title="Acceptance Criteria">
                    <EditableField
                      value={feature.spec.acceptanceCriteria}
                      onSave={(v) => updateSpecSection(feature.id, 'acceptanceCriteria', v)}
                      type="list"
                      label="Acceptance Criteria"
                      context={{ featureTitle: feature.title, featureDescription: feature.description, sectionName: 'acceptanceCriteria' }}
                    >
                      <ul className="space-y-1">
                        {feature.spec.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="text-[12px] text-gray-600 flex items-start gap-2">
                            <span className="w-3.5 h-3.5 rounded border border-gray-300 mt-0.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </EditableField>
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
                            <EditableField
                              value={task.title}
                              onSave={(v) => updateTask(feature.id, task.id, { title: v })}
                              type="text"
                              label="Task Title"
                              context={{ featureTitle: feature.title, sectionName: 'taskTitle', taskTitle: task.title }}
                            >
                              <h4 className="text-[13px] font-semibold text-gray-800">{task.title}</h4>
                            </EditableField>
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
                                <EditableField
                                  value={task.description}
                                  onSave={(v) => updateTask(feature.id, task.id, { description: v })}
                                  type="textarea"
                                  label="Task Description"
                                  context={{ featureTitle: feature.title, sectionName: 'taskDescription', taskTitle: task.title }}
                                >
                                  <p className="text-[12px] text-gray-600 leading-relaxed">{task.description}</p>
                                </EditableField>
                              </div>

                              {task.acceptanceCriteria?.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Acceptance Criteria</p>
                                  <EditableField
                                    value={task.acceptanceCriteria}
                                    onSave={(v) => updateTask(feature.id, task.id, { acceptanceCriteria: v })}
                                    type="list"
                                    label="Acceptance Criteria"
                                    context={{ featureTitle: feature.title, sectionName: 'taskAcceptanceCriteria', taskTitle: task.title }}
                                  >
                                    <ul className="space-y-0.5">
                                      {task.acceptanceCriteria.map((ac, i) => (
                                        <li key={i} className="text-[12px] text-gray-600 flex items-start gap-2">
                                          <span className="w-3 h-3 rounded border border-gray-200 mt-0.5 shrink-0" />
                                          {ac}
                                        </li>
                                      ))}
                                    </ul>
                                  </EditableField>
                                </div>
                              )}

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Agent Prompt</p>
                                  <CopyBtn text={task.agentPrompt} label="Copy" />
                                </div>
                                <EditableField
                                  value={task.agentPrompt}
                                  onSave={(v) => updateTask(feature.id, task.id, { agentPrompt: v })}
                                  type="textarea"
                                  label="Agent Prompt"
                                  context={{ featureTitle: feature.title, sectionName: 'agentPrompt', taskTitle: task.title }}
                                >
                                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 max-h-56 overflow-y-auto custom-scrollbar">
                                    <pre className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">{task.agentPrompt}</pre>
                                  </div>
                                </EditableField>
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

        {/* VALIDATE (Research, Critic, Risk, Estimate) */}
        {tab === 'validate' && (
          <motion.div key="val" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <p className="text-[12px] text-gray-500 mb-4">Run these agents to make the feature decision more thorough.</p>

            {/* Research */}
            <Section icon="🔍" title="Market & competitive research">
              {feature.research ? (
                <div className="space-y-2 text-[12px] text-gray-600">
                  <p className="font-medium text-gray-800">{feature.research.summary}</p>
                  {feature.research.priorArt?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mt-2 mb-1">Prior art</p>
                      <ul className="list-disc list-inside space-y-0.5">{feature.research.priorArt.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                  )}
                  {feature.research.competitors?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mt-2 mb-1">Competitors</p>
                      <ul className="list-disc list-inside space-y-0.5">{feature.research.competitors.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  )}
                  {feature.research.marketSignal && <p><span className="font-medium text-gray-500">Market:</span> {feature.research.marketSignal}</p>}
                  {feature.research.buildVsBuy && <p><span className="font-medium text-gray-500">Build vs buy:</span> {feature.research.buildVsBuy}</p>}
                  {feature.research.risks?.length > 0 && <p><span className="font-medium text-gray-500">Risks:</span> {feature.research.risks.join('; ')}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateResearch(feature.id).catch(() => {})}
                    disabled={generatingResearch}
                    className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[12px] font-medium"
                  >
                    {generatingResearch ? 'Researching...' : 'Run research'}
                  </button>
                  <AiBadge />
                </div>
              )}
            </Section>

            {/* Critic */}
            <Section icon="⚖️" title="Critic (why not build this?)">
              {feature.critique ? (
                <div className="space-y-2 text-[12px] text-gray-600">
                  <p className="font-medium text-gray-800">{feature.critique.summary}</p>
                  <p><span className="font-medium text-gray-500">Recommendation:</span> {feature.critique.recommendation}</p>
                  {feature.critique.caveats && <p><span className="font-medium text-gray-500">Caveats:</span> {feature.critique.caveats}</p>}
                  {feature.critique.counterpoints?.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {feature.critique.counterpoints.map((cp, i) => (
                        <li key={i} className="flex gap-2"><span className="font-medium text-gray-500 shrink-0">{cp.concern}:</span> {cp.detail}</li>
                      ))}
                    </ul>
                  )}
                  {feature.critique.alternatives?.length > 0 && <p><span className="font-medium text-gray-500">Alternatives:</span> {feature.critique.alternatives.join('; ')}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateCritic(feature.id).catch(() => {})}
                    disabled={generatingCritic}
                    className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[12px] font-medium"
                  >
                    {generatingCritic ? 'Running critic...' : 'Run critic'}
                  </button>
                  <AiBadge />
                </div>
              )}
            </Section>

            {/* Risk (requires spec) */}
            <Section icon="🛡️" title="Risk (privacy, security, compliance)">
              {feature.risk ? (
                <div className="space-y-2 text-[12px] text-gray-600">
                  <p className="font-medium text-gray-800">{feature.risk.summary}</p>
                  <p><span className="font-medium text-gray-500">Overall severity:</span> {feature.risk.overallSeverity}</p>
                  {feature.risk.findings?.length > 0 && (
                    <ul className="space-y-1.5 mt-2">
                      {feature.risk.findings.map((f, i) => (
                        <li key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className={`font-semibold text-[10px] uppercase ${f.severity === 'critical' || f.severity === 'high' ? 'text-red-600' : 'text-gray-500'}`}>{f.category} / {f.severity}</span>
                          <p>{f.description}</p>
                          {f.mitigation && <p className="text-[11px] text-gray-500 mt-0.5">→ {f.mitigation}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {feature.risk.mustAddressBeforeShip?.length > 0 && (
                    <p className="mt-2 text-amber-700 font-medium">Must address before ship: {feature.risk.mustAddressBeforeShip.join('; ')}</p>
                  )}
                </div>
              ) : hasSpec ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateRisk(feature.id).catch(() => {})}
                    disabled={generatingRisk}
                    className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[12px] font-medium"
                  >
                    {generatingRisk ? 'Assessing risk...' : 'Assess risk'}
                  </button>
                  <AiBadge />
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">Generate a spec first to run risk assessment.</p>
              )}
            </Section>

            {/* Estimate */}
            <Section icon="📐" title="Refined estimate">
              {feature.estimate ? (
                <div className="space-y-2 text-[12px] text-gray-600">
                  <div className="flex gap-4 flex-wrap">
                    <span><strong className="text-gray-700">Story points:</strong> {feature.estimate.totalStoryPoints}</span>
                    <span><strong className="text-gray-700">Eng days:</strong> {feature.estimate.engDays}</span>
                    <span><strong className="text-gray-700">Confidence:</strong> {feature.estimate.confidence}/10</span>
                  </div>
                  {feature.estimate.notes && <p>{feature.estimate.notes}</p>}
                  {feature.estimate.risks?.length > 0 && <p><span className="font-medium text-gray-500">Risks to estimate:</span> {feature.estimate.risks.join('; ')}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateEstimate(feature.id).catch(() => {})}
                    disabled={generatingEstimate}
                    className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg text-[12px] font-medium"
                  >
                    {generatingEstimate ? 'Estimating...' : 'Refine estimate'}
                  </button>
                  <AiBadge />
                </div>
              )}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
