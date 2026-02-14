"use client";

import { motion } from "framer-motion";
import useProductStore from "@/store/useProductStore";
import IntegrationLogo from "@/components/IntegrationLogos";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const INTEGRATIONS = [
  { id: "salesforce", name: "Salesforce", color: "#00A1E0", connected: true, records: "12.4k" },
  { id: "zendesk", name: "Zendesk", color: "#03363D", connected: true, records: "8.2k" },
  { id: "intercom", name: "Intercom", color: "#286EFA", connected: true, records: "3.1k" },
  { id: "slack", name: "Slack", color: "#E01E5A", connected: false, records: null },
  { id: "gong", name: "Gong", color: "#7C3AED", connected: false, records: null },
  { id: "hubspot", name: "HubSpot", color: "#FF7A59", connected: false, records: null },
];

export default function Dashboard() {
  const sources = useProductStore((s) => s.sources);
  const insights = useProductStore((s) => s.insights);
  const features = useProductStore((s) => s.features);
  const setView = useProductStore((s) => s.setView);
  const analyzing = useProductStore((s) => s.analyzing);
  const recommending = useProductStore((s) => s.recommending);
  const analyzeSources = useProductStore((s) => s.analyzeSources);
  const recommendFeatures = useProductStore((s) => s.recommendFeatures);

  const hasData = sources.length > 0;
  const hasInsights = insights.length > 0;
  const hasFeatures = features.length > 0;

  const stats = [
    {
      label: "Integrations",
      value: hasData ? 3 : 0,
      sub: "CRMs, support desks & channels",
      accent: "bg-brand-50 text-brand-700 border-brand-200",
      action: () => setView("sources"),
    },
    {
      label: "Insights",
      value: insights.length,
      sub: "Pain points, requests & patterns",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
      action: insights.length > 0 ? () => setView("insights") : null,
    },
    {
      label: "Features",
      value: features.length,
      sub: "Roadmap items ranked by impact",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: features.length > 0 ? () => setView("features") : null,
    },
  ];

  const steps = [
    {
      n: 1,
      title: "Connect Integrations",
      desc: "Link Salesforce, Zendesk, Intercom, Slack, Gong, and more.",
      done: hasData,
      active: !hasData,
      action: () => setView("sources"),
    },
    {
      n: 2,
      title: "Extract Insights",
      desc: "AI finds pain points, feature requests, and patterns across all sources.",
      done: hasInsights,
      active: hasData && !hasInsights,
      action: hasData ? analyzeSources : null,
      loading: analyzing,
    },
    {
      n: 3,
      title: "Build Roadmap",
      desc: "Prioritized features with story points, effort estimates, and sprint assignments.",
      done: hasFeatures,
      active: hasInsights && !hasFeatures,
      action: hasInsights ? recommendFeatures : null,
      loading: recommending,
    },
    {
      n: 4,
      title: "Plan Sprints",
      desc: "Generate specs, dev tasks, and story points ready for your next sprint.",
      done: features.some((f) => f.tasks),
      active: hasFeatures,
      action: hasFeatures ? () => setView("features") : null,
    },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto"
    >
      {/* Hero */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
          What should we build next?
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed max-w-xl">
          Daisy connects to your CRM, support desk, and customer channels —
          then extracts insights, builds your roadmap, and plans sprints
          automatically.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={s.action}
            disabled={!s.action}
            className="card-hover rounded-xl p-5 text-left disabled:cursor-default"
          >
            <p className="text-3xl font-semibold text-gray-900 mb-1 tabular-nums">
              {s.value}
            </p>
            <p className="text-[13px] font-medium text-gray-700">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </motion.div>

      {/* Workflow Steps */}
      <motion.div variants={fadeUp} className="mb-10">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Workflow</h2>
        <div className="grid grid-cols-4 gap-3">
          {steps.map((s) => (
            <button
              key={s.n}
              onClick={s.action}
              disabled={!s.action || s.loading}
              className={`relative card rounded-xl p-4 text-left transition-all duration-200 ${
                s.active ? "ring-2 ring-brand-500 ring-offset-1" : ""
              } ${
                s.action && !s.loading
                  ? "hover:shadow-md hover:border-gray-300 cursor-pointer"
                  : "cursor-default"
              } ${!s.action && !s.done ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    s.done
                      ? "bg-brand-600 text-white"
                      : s.active
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {s.done ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    s.n
                  )}
                </span>
                <h3 className="text-[12px] font-semibold text-gray-800">
                  {s.title}
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {s.desc}
              </p>

              {s.loading && (
                <div className="absolute inset-0 rounded-xl bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    <span className="text-[11px] text-brand-700 font-medium">
                      Daisy is thinking...
                    </span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Connected integrations preview or empty state */}
      {hasData ? (
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Connected Sources</h2>
          <div className="grid grid-cols-6 gap-2">
            {INTEGRATIONS.map((int) => (
              <button
                key={int.name}
                onClick={() => setView("sources")}
                className={`card rounded-xl p-3 text-center hover:shadow-sm transition-all ${int.connected ? '' : 'opacity-40'}`}
              >
                <div className="w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center bg-gray-50 border border-gray-100">
                  <IntegrationLogo id={int.id} size={22} />
                </div>
                <p className="text-[11px] font-medium text-gray-700">{int.name}</p>
                {int.connected ? (
                  <p className="text-[10px] text-brand-600 mt-0.5">{int.records} records</p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-0.5">Not connected</p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          className="card rounded-xl p-10 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
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
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-6.364-6.364L4.5 8.25a4.5 4.5 0 006.364 6.364l4.5-4.5z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Connect your first integration
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Link your CRM, support desk, or customer channels — Daisy
            automatically syncs and analyzes your customer data.
          </p>
          <div className="flex items-center justify-center gap-5 mb-6">
            {INTEGRATIONS.slice(0, 6).map((int) => (
              <div key={int.name} className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <IntegrationLogo id={int.id} size={26} />
                </div>
                <span className="text-[10px] text-gray-400">{int.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setView("sources")}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Connect Integrations
            </button>
            <button
              onClick={() => {
                useProductStore.getState().loadSampleData();
                setView("sources");
              }}
              className="px-5 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Try Sample Data
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
