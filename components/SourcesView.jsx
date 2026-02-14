"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useProductStore from "@/store/useProductStore";

const SOURCE_TYPES = [
  { value: "interview", label: "Interview", icon: "🎙" },
  { value: "support_ticket", label: "Support Ticket", icon: "🎫" },
  { value: "survey", label: "Survey", icon: "📊" },
  { value: "feedback", label: "Feedback", icon: "💬" },
  { value: "feature_request", label: "Feature Request", icon: "✦" },
  { value: "analytics", label: "Analytics", icon: "📈" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function SourcesView() {
  const sources = useProductStore((s) => s.sources);
  const addSource = useProductStore((s) => s.addSource);
  const removeSource = useProductStore((s) => s.removeSource);
  const loadSampleData = useProductStore((s) => s.loadSampleData);
  const analyzeSources = useProductStore((s) => s.analyzeSources);
  const analyzing = useProductStore((s) => s.analyzing);
  const analyzeError = useProductStore((s) => s.analyzeError);

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("interview");
  const [formContent, setFormContent] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) return;
    addSource({
      name: formName.trim(),
      type: formType,
      content: formContent.trim(),
    });
    setFormName("");
    setFormContent("");
    setFormType("interview");
    setShowForm(false);
  };

  const typeInfo = (type) =>
    SOURCE_TYPES.find((t) => t.value === type) || { icon: "📄", label: type };

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
            Data Sources
          </h1>
          <p className="text-sm text-gray-400">
            Customer interviews, support tickets, and feedback
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sources.length === 0 && (
            <button
              onClick={loadSampleData}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-[13px] font-medium transition-colors"
            >
              Load Samples
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Source
          </button>
        </div>
      </motion.div>

      {/* Add Source Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleSubmit}
            className="card rounded-xl p-5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                New Data Source
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Interview with Sarah"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Content
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Paste the interview transcript, ticket, or feedback here..."
                rows={5}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-y"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formName.trim() || !formContent.trim()}
                className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Source
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {sources.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="card rounded-xl p-12 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            No data sources yet
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
            Add customer interviews, support tickets, or feedback to start.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Source
            </button>
            <button
              onClick={loadSampleData}
              className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Load Samples
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Sources list */}
          <motion.div variants={fadeUp} className="space-y-2 mb-8">
            {sources.map((source) => {
              const info = typeInfo(source.type);
              const isExpanded = expandedId === source.id;

              return (
                <motion.div
                  key={source.id}
                  layout
                  className="card rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : source.id)}
                  >
                    <span className="text-base mt-0.5 leading-none">
                      {info.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-[13px] font-semibold text-gray-800 truncate">
                          {source.name}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 font-medium shrink-0">
                          {info.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400 line-clamp-1">
                        {source.content.substring(0, 120)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSource(source.id);
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                      <svg
                        className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                          <pre className="text-[12px] text-gray-600 whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-56 overflow-y-auto">
                            {source.content}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Analyze */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <button
              onClick={analyzeSources}
              disabled={analyzing}
              className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing {sources.length} sources...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                  Analyze All Sources
                </>
              )}
            </button>
          </motion.div>

          {analyzeError && (
            <motion.div
              variants={fadeUp}
              className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-center"
            >
              <p className="text-sm text-red-600">{analyzeError}</p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
