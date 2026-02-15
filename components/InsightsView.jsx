"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useProductStore from "@/store/useProductStore";
import EditableField from "@/components/EditableField";

const TYPE_CONFIG = {
  pain_point: {
    label: "Pain Point",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  feature_request: {
    label: "Feature Request",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  praise: {
    label: "Praise",
    color: "text-brand-700",
    bg: "bg-brand-50",
    border: "border-brand-200",
    dot: "bg-brand-500",
  },
  confusion: {
    label: "Confusion",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
};

const SEVERITY = ["", "Minor", "Low", "Medium", "High", "Critical"];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.035 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function InsightsView() {
  const insights = useProductStore((s) => s.insights);
  const setView = useProductStore((s) => s.setView);
  const features = useProductStore((s) => s.features);
  const updateInsight = useProductStore((s) => s.updateInsight);

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered =
    filter === "all" ? insights : insights.filter((i) => i.type === filter);

  const typeCounts = insights.reduce((acc, ins) => {
    acc[ins.type] = (acc[ins.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">
            Insights
          </h1>
          <p className="text-sm text-gray-400">
            {insights.length} insights from your data
          </p>
        </div>
        <button
          onClick={() => setView("features")}
          disabled={insights.length === 0}
          className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          Design Features
          {features.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 rounded-full">{features.length}</span>
          )}
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-1.5 mb-5 flex-wrap"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            filter === "all"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          All ({insights.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const count = typeCounts[type] || 0;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                filter === type
                  ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </motion.div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((insight) => {
          const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.pain_point;
          const isExpanded = expandedId === insight.id;

          return (
            <motion.div
              key={insight.id}
              variants={fadeUp}
              layout
              className="card rounded-xl overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : insight.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    {insight.frequency > 1 && (
                      <span className="text-gray-400">
                        {insight.frequency} sources
                      </span>
                    )}
                    {insight.severity >= 3 && (
                      <span
                        className={
                          insight.severity >= 4
                            ? "text-red-500 font-medium"
                            : "text-amber-500 font-medium"
                        }
                      >
                        {SEVERITY[insight.severity]}
                      </span>
                    )}
                  </div>
                </div>

                <EditableField
                  value={insight.title}
                  onSave={(v) => updateInsight(insight.id, { title: v })}
                  type="text"
                  label="Insight Title"
                  context={{ sectionName: 'insightTitle', insightType: insight.type }}
                >
                  <h3 className="text-[13px] font-semibold text-gray-800 mb-1">
                    {insight.title}
                  </h3>
                </EditableField>
                <EditableField
                  value={insight.description}
                  onSave={(v) => updateInsight(insight.id, { description: v })}
                  type="textarea"
                  label="Insight Description"
                  context={{ sectionName: 'insightDescription', insightType: insight.type, insightTitle: insight.title }}
                >
                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                    {insight.description}
                  </p>
                </EditableField>

                {insight.tags?.length > 0 && (
                  <EditableField
                    value={insight.tags}
                    onSave={(v) => updateInsight(insight.id, { tags: v })}
                    type="list"
                    label="Tags"
                    context={{ sectionName: 'insightTags', insightTitle: insight.title }}
                  >
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </EditableField>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && insight.quotes?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-2">
                      {/* Editable severity */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Severity</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={(e) => { e.stopPropagation(); updateInsight(insight.id, { severity: level }); }}
                              className={`w-5 h-5 rounded text-[10px] font-bold transition-colors ${
                                level <= insight.severity
                                  ? level >= 4 ? 'bg-red-100 text-red-600' : level >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-600'
                                  : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">{SEVERITY[insight.severity]}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Quotes
                      </p>
                      {insight.quotes.map((q, i) => (
                        <div
                          key={i}
                          className="pl-3 border-l-2 border-brand-200"
                        >
                          <p className="text-[12px] text-gray-600 italic leading-relaxed">
                            &ldquo;{q.text}&rdquo;
                          </p>
                          {q.sourceName && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              — {q.sourceName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            No insights match this filter.
          </p>
        </div>
      )}
    </motion.div>
  );
}
