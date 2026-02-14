"use client";

import { motion } from "framer-motion";
import useProductStore from "@/store/useProductStore";

const CATEGORY = {
  ui: { label: "UI", color: "text-cyan-700", bg: "bg-cyan-50" },
  backend: { label: "Backend", color: "text-violet-700", bg: "bg-violet-50" },
  data: { label: "Data", color: "text-amber-700", bg: "bg-amber-50" },
  workflow: { label: "Workflow", color: "text-blue-700", bg: "bg-blue-50" },
  integration: {
    label: "Integration",
    color: "text-brand-700",
    bg: "bg-brand-50",
  },
  infrastructure: { label: "Infra", color: "text-gray-600", bg: "bg-gray-100" },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function Bar({ value, max = 10, color }) {
  return (
    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

export default function FeaturesView() {
  const features = useProductStore((s) => s.features);
  const insights = useProductStore((s) => s.insights);
  const selectFeature = useProductStore((s) => s.selectFeature);
  const addToRoadmap = useProductStore((s) => s.addToRoadmap);
  const addAllToRoadmap = useProductStore((s) => s.addAllToRoadmap);
  const roadmapItems = useProductStore((s) => s.roadmapItems);
  const setView = useProductStore((s) => s.setView);

  const onRoadmap = new Set(roadmapItems.map((r) => r.featureId));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">
            Recommended Features
          </h1>
          <p className="text-sm text-gray-400">
            {features.length} features from {insights.length} insights, ranked by
            priority
          </p>
        </div>
        {features.length > 0 && (
          <div className="flex items-center gap-2">
            {onRoadmap.size < features.length && (
              <button
                onClick={addAllToRoadmap}
                className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Add All to Roadmap
              </button>
            )}
            {onRoadmap.size > 0 && (
              <button
                onClick={() => setView("roadmap")}
                className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-[13px] font-medium transition-colors"
              >
                View Roadmap ({onRoadmap.size})
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* List */}
      <div className="space-y-2">
        {features.map((feature, index) => {
          const cat = CATEGORY[feature.category] || CATEGORY.ui;
          const evidence = feature.insightIds?.length || 0;

          return (
            <motion.button
              key={feature.id}
              variants={fadeUp}
              onClick={() => selectFeature(feature.id)}
              className="w-full card-hover rounded-xl p-5 text-left group"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-brand-800 tabular-nums">
                    {(feature.priorityScore || 0).toFixed(1)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-gray-400 font-medium tabular-nums">
                      #{index + 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${cat.bg} ${cat.color}`}
                    >
                      {cat.label}
                    </span>
                    {feature.tasks && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700">
                        {feature.tasks.length} tasks
                      </span>
                    )}
                  </div>

                  <h3 className="text-[14px] font-semibold text-gray-800 group-hover:text-gray-900 transition-colors mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 mb-3">
                    {feature.description}
                  </p>

                  {/* Metric bars */}
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14 shrink-0">
                        Impact
                      </span>
                      <Bar value={feature.impact || 0} color="bg-brand-500" />
                      <span className="text-[10px] text-gray-500 tabular-nums w-3">
                        {feature.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14 shrink-0">
                        Effort
                      </span>
                      <Bar value={feature.effort || 0} color="bg-amber-400" />
                      <span className="text-[10px] text-gray-500 tabular-nums w-3">
                        {feature.effort}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14 shrink-0">
                        Confidence
                      </span>
                      <Bar
                        value={feature.confidence || 0}
                        color="bg-blue-400"
                      />
                      <span className="text-[10px] text-gray-500 tabular-nums w-3">
                        {feature.confidence}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                  {evidence > 0 && (
                    <span className="text-[10px] text-gray-400">
                      {evidence} insight{evidence !== 1 ? "s" : ""}
                    </span>
                  )}
                  {onRoadmap.has(feature.id) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-50 text-[10px] font-medium text-brand-700">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      On Roadmap
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToRoadmap(feature.id, "backlog"); }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-brand-50 text-[10px] font-medium text-gray-500 hover:text-brand-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add to Roadmap
                    </button>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {features.length === 0 && (
        <div className="card rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">
            No features yet. Analyze your data first.
          </p>
        </div>
      )}
    </motion.div>
  );
}
