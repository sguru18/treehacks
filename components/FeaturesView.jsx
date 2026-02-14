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

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">
          Recommended Features
        </h1>
        <p className="text-sm text-gray-400">
          {features.length} features from {insights.length} insights, ranked by
          priority
        </p>
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
