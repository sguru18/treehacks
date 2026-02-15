"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import useProductStore, { TEAM_MEMBERS } from "@/store/useProductStore";
import IntegrationLogo from "@/components/IntegrationLogos";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const CURRENT_USER = TEAM_MEMBERS[0]; // Aaditya S.

/* ------------------------------------------------------------------ */
/*  All possible integrations (always shown, connectivity is dynamic)   */
/* ------------------------------------------------------------------ */
const ALL_INTEGRATIONS = [
  { id: "salesforce", name: "Salesforce", recordsPer: "12.4k", syncLabel: "2 min ago" },
  { id: "zendesk", name: "Zendesk", recordsPer: "8.2k", syncLabel: "5 min ago" },
  { id: "intercom", name: "Intercom", recordsPer: "3.1k", syncLabel: "12 min ago" },
  { id: "slack", name: "Slack", recordsPer: "1.8k", syncLabel: null },
  { id: "gong", name: "Gong", recordsPer: "4.5k", syncLabel: null },
  { id: "hubspot", name: "HubSpot", recordsPer: "6.3k", syncLabel: null },
];

/* ------------------------------------------------------------------ */
/*  Derive insight categories from real insight data                    */
/* ------------------------------------------------------------------ */
const CATEGORY_CONFIG = [
  { keywords: ["request", "feature", "need", "want", "add", "wish", "would be", "should"], label: "Feature Requests", color: "bg-brand-500" },
  { keywords: ["pain", "frustrat", "issue", "problem", "annoy", "hard", "difficult", "slow", "broken"], label: "Pain Points", color: "bg-amber-500" },
  { keywords: ["ui", "ux", "interface", "design", "confus", "intuit", "layout", "visual", "click"], label: "UX Issues", color: "bg-rose-500" },
  { keywords: ["performance", "speed", "load", "fast", "latenc", "timeout", "lag"], label: "Performance", color: "bg-blue-500" },
  { keywords: ["integrat", "connect", "sync", "api", "webhook", "import", "export"], label: "Integrations", color: "bg-violet-500" },
];

function categorizeInsights(insights) {
  if (!insights.length) return [];
  const counts = {};
  CATEGORY_CONFIG.forEach((c) => (counts[c.label] = 0));

  insights.forEach((insight) => {
    const text = (insight.title || insight.description || insight.text || JSON.stringify(insight)).toLowerCase();
    let matched = false;
    for (const cat of CATEGORY_CONFIG) {
      if (cat.keywords.some((kw) => text.includes(kw))) {
        counts[cat.label]++;
        matched = true;
        break;
      }
    }
    if (!matched) counts["Feature Requests"]++;
  });

  const total = insights.length || 1;
  return CATEGORY_CONFIG
    .map((c) => ({
      label: c.label,
      count: counts[c.label],
      pct: Math.round((counts[c.label] / total) * 100),
      color: c.color,
    }))
    .filter((c) => c.count > 0);
}

/* ------------------------------------------------------------------ */
/*  Derive feature priority from real feature data                      */
/* ------------------------------------------------------------------ */
function derivePriority(features) {
  if (!features.length) return [];
  const buckets = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  features.forEach((f) => {
    const impact = f.impact ?? f.score ?? 5;
    if (impact >= 9) buckets.Critical++;
    else if (impact >= 7) buckets.High++;
    else if (impact >= 4) buckets.Medium++;
    else buckets.Low++;
  });
  const colors = { Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-amber-400", Low: "bg-gray-300" };
  return Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([label, count]) => ({ label, count, color: colors[label] }));
}

/* ------------------------------------------------------------------ */
/*  Build team activity feed from actual store state                    */
/* ------------------------------------------------------------------ */
function buildActivity(sources, insights, features, roadmapItems) {
  const items = [];

  if (roadmapItems.length > 0) {
    const sprints = new Set(roadmapItems.filter((r) => r.sprint !== "backlog").map((r) => r.sprint));
    items.push({
      user: TEAM_MEMBERS[2],
      action: `organized ${roadmapItems.length} features across ${sprints.size || 1} sprint${sprints.size !== 1 ? "s" : ""}`,
      time: "just now",
      icon: "roadmap",
    });
  }

  if (features.length > 0) {
    const withTasks = features.filter((f) => f.tasks?.length);
    if (withTasks.length > 0) {
      const taskCount = withTasks.reduce((a, f) => a + f.tasks.length, 0);
      items.push({
        user: TEAM_MEMBERS[2],
        action: `generated ${taskCount} dev tasks across ${withTasks.length} feature${withTasks.length !== 1 ? "s" : ""}`,
        time: "recently",
        icon: "spec",
      });
    }
    items.push({
      user: TEAM_MEMBERS[1],
      action: `recommended ${features.length} features ranked by impact`,
      time: items.length === 0 ? "just now" : "earlier",
      icon: "insight",
    });
  }

  if (insights.length > 0) {
    items.push({
      user: TEAM_MEMBERS[4],
      action: `extracted ${insights.length} insight${insights.length !== 1 ? "s" : ""} from customer data`,
      time: items.length === 0 ? "just now" : "earlier",
      icon: "data",
    });
  }

  if (sources.length > 0) {
    const integrations = [...new Set(sources.map((s) => s.integration).filter(Boolean))];
    const names = integrations
      .map((id) => ALL_INTEGRATIONS.find((i) => i.id === id)?.name || id)
      .join(", ");
    items.push({
      user: TEAM_MEMBERS[0],
      action: `connected ${integrations.length} integration${integrations.length !== 1 ? "s" : ""} — ${names}`,
      time: items.length === 0 ? "just now" : "a moment ago",
      icon: "insight",
    });
  }

  return items;
}

/* ------------------------------------------------------------------ */
/*  Activity icon helper                                               */
/* ------------------------------------------------------------------ */
function ActivityIcon({ type }) {
  const base = "w-7 h-7 rounded-lg flex items-center justify-center shrink-0";
  const icons = {
    insight: (
      <div className={`${base} bg-amber-50`}>
        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      </div>
    ),
    roadmap: (
      <div className={`${base} bg-brand-50`}>
        <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0116.5 19.875V4.125z" />
        </svg>
      </div>
    ),
    design: (
      <div className={`${base} bg-pink-50`}>
        <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      </div>
    ),
    data: (
      <div className={`${base} bg-blue-50`}>
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
        </svg>
      </div>
    ),
    spec: (
      <div className={`${base} bg-violet-50`}>
        <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
    ),
  };
  return icons[type] || icons.insight;
}

/* ------------------------------------------------------------------ */
/*  TaskFlow logo (the demo company product)                            */
/* ------------------------------------------------------------------ */
function TaskFlowLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#4F46E5" />
      <path d="M9 16.5l4 4 10-10" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M9 23h14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Greeting helper                                                     */
/* ------------------------------------------------------------------ */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ================================================================== */
/*  Dashboard Component                                                */
/* ================================================================== */

export default function Dashboard() {
  const sources = useProductStore((s) => s.sources);
  const insights = useProductStore((s) => s.insights);
  const features = useProductStore((s) => s.features);
  const roadmapItems = useProductStore((s) => s.roadmapItems);
  const setView = useProductStore((s) => s.setView);
  const analyzing = useProductStore((s) => s.analyzing);
  const recommending = useProductStore((s) => s.recommending);
  const analyzeSources = useProductStore((s) => s.analyzeSources);
  const recommendFeatures = useProductStore((s) => s.recommendFeatures);

  const hasData = sources.length > 0;
  const hasInsights = insights.length > 0;
  const hasFeatures = features.length > 0;

  /* ---- Derived metrics (all from real store state) ---- */
  const connectedIntegrations = useMemo(
    () => [...new Set(sources.map((s) => s.integration).filter(Boolean))],
    [sources],
  );
  const connectedCount = connectedIntegrations.length;

  // Estimate records from source content
  const recordEstimate = useMemo(() => {
    if (!sources.length) return "0";
    // Each source roughly maps to a batch of records; use content word count as proxy
    const totalWords = sources.reduce((a, s) => a + (s.content?.split(/\s+/).length || 0), 0);
    const estimate = Math.round(totalWords * 8.2); // ~8 records per word cluster for demo
    if (estimate > 1000) return `${(estimate / 1000).toFixed(1)}k`;
    return String(estimate);
  }, [sources]);

  const insightCount = insights.length;
  const featureCount = features.length;
  const tasksGenerated = features.reduce((a, f) => a + (f.tasks?.length || 0), 0);
  const specsGenerated = features.filter((f) => f.spec).length;

  const sprintVelocity = useMemo(() => {
    if (!roadmapItems.length) return 0;
    const sprintSet = new Set(roadmapItems.filter((r) => r.sprint !== "backlog").map((r) => r.sprint));
    const sprintCount = Math.max(1, sprintSet.size);
    return Math.round(roadmapItems.reduce((a, r) => a + (r.storyPoints || 0), 0) / sprintCount);
  }, [roadmapItems]);

  /* ---- Derived analytics ---- */
  const insightCategories = useMemo(() => categorizeInsights(insights), [insights]);
  const priorityBreakdown = useMemo(() => derivePriority(features), [features]);
  const teamActivity = useMemo(
    () => buildActivity(sources, insights, features, roadmapItems),
    [sources, insights, features, roadmapItems],
  );

  /* ---- Integration connection status (derived from store) ---- */
  const integrations = useMemo(
    () =>
      ALL_INTEGRATIONS.map((int) => ({
        ...int,
        connected: connectedIntegrations.includes(int.id),
        sourceCount: sources.filter((s) => s.integration === int.id).length,
      })),
    [connectedIntegrations, sources],
  );

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto"
    >
      {/* ---- Header with greeting + company ---- */}
      <motion.div variants={fadeUp} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
            {getGreeting()}, {CURRENT_USER.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 text-sm">
            {hasData
              ? "Here\u2019s what\u2019s happening with your product today."
              : "Connect your first integration to get started."}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <TaskFlowLogo size={28} />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">TaskFlow</p>
            <p className="text-[11px] text-gray-400 leading-tight">Product workspace</p>
          </div>
        </div>
      </motion.div>

      {/* ---- Key Metrics ---- */}
      <motion.div variants={fadeUp} className="grid grid-cols-5 gap-3 mb-8">
        {[
          {
            label: "Records Synced",
            value: recordEstimate,
            change: hasData ? `from ${sources.length} sources` : "No data yet",
            trend: hasData ? "up" : "neutral",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
              </svg>
            ),
            onClick: () => setView("sources"),
          },
          {
            label: "Integrations",
            value: connectedCount,
            change: connectedCount > 0 ? `${connectedCount} of 6 active` : "0 connected",
            trend: connectedCount > 0 ? "up" : "neutral",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-6.364-6.364L4.5 8.25a4.5 4.5 0 006.364 6.364l4.5-4.5z" />
              </svg>
            ),
            onClick: () => setView("sources"),
          },
          {
            label: "Insights",
            value: insightCount,
            change: hasInsights ? `${insightCount} extracted` : hasData ? "Ready to extract" : "--",
            trend: hasInsights ? "up" : "neutral",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            ),
            onClick: hasInsights ? () => setView("insights") : null,
          },
          {
            label: "Features",
            value: featureCount,
            change: hasFeatures
              ? `${specsGenerated} spec${specsGenerated !== 1 ? "s" : ""}, ${tasksGenerated} task${tasksGenerated !== 1 ? "s" : ""}`
              : hasInsights ? "Ready to build" : "--",
            trend: hasFeatures ? "up" : "neutral",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            ),
            onClick: hasFeatures ? () => setView("features") : null,
          },
          {
            label: "Sprint Velocity",
            value: sprintVelocity > 0 ? sprintVelocity : "--",
            change: sprintVelocity > 0 ? "pts / sprint avg" : roadmapItems.length > 0 ? `${roadmapItems.length} items` : "No sprints yet",
            trend: sprintVelocity > 0 ? "up" : "neutral",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            ),
            onClick: roadmapItems.length > 0 ? () => setView("roadmap") : null,
          },
        ].map((m) => (
          <button
            key={m.label}
            onClick={m.onClick}
            disabled={!m.onClick}
            className="card-hover rounded-xl p-4 text-left disabled:cursor-default group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 group-hover:text-gray-500 transition-colors">{m.icon}</span>
              {m.trend === "up" && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums leading-none mb-1">{m.value}</p>
            <p className="text-[11px] font-medium text-gray-500">{m.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{m.change}</p>
          </button>
        ))}
      </motion.div>

      {/* ---- Two-column: Integrations + Analytics ---- */}
      <div className="grid grid-cols-5 gap-5 mb-8">
        {/* Integration Status */}
        <motion.div variants={fadeUp} className="col-span-3 card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Integration Status</h2>
            <button
              onClick={() => setView("sources")}
              className="text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2">
            {integrations.map((int) => (
              <div
                key={int.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  int.connected ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-100 shrink-0 ${int.connected ? "" : "opacity-40"}`}>
                  <IntegrationLogo id={int.id} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium ${int.connected ? "text-gray-800" : "text-gray-400"}`}>{int.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {int.connected
                      ? `${int.sourceCount} source${int.sourceCount !== 1 ? "s" : ""} \u00b7 ${int.recordsPer} records`
                      : "Not connected"}
                  </p>
                </div>
                {int.connected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{int.syncLabel || "synced"}</span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setView("sources")}
                    className="text-[10px] font-medium text-gray-400 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-2.5 py-1 rounded-full transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insight Analytics */}
        <motion.div variants={fadeUp} className="col-span-2 card rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Insight Breakdown</h2>
          {insightCategories.length > 0 ? (
            <div className="space-y-3">
              {insightCategories.map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-600">{cat.label}</span>
                    <span className="text-[11px] font-medium text-gray-500 tabular-nums">{cat.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${cat.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <p className="text-[12px] text-gray-400 mb-1">No insights yet</p>
              <p className="text-[11px] text-gray-300">
                {hasData ? "Extract insights to see analytics" : "Connect integrations first"}
              </p>
            </div>
          )}

          {/* Priority Distribution */}
          {priorityBreakdown.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Feature Priority</h3>
              <div className="flex gap-1.5 h-3 rounded-full overflow-hidden">
                {priorityBreakdown.map((p) => (
                  <motion.div
                    key={p.label}
                    className={`${p.color} rounded-sm`}
                    initial={{ flex: 0 }}
                    animate={{ flex: p.count }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    title={`${p.label}: ${p.count}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                {priorityBreakdown.map((p) => (
                  <div key={p.label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-sm ${p.color}`} />
                    <span className="text-[10px] text-gray-400">{p.label} ({p.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ---- Bottom row: Team Activity + Quick Actions ---- */}
      <div className="grid grid-cols-5 gap-5 mb-6">
        {/* Team Activity Feed */}
        <motion.div variants={fadeUp} className="col-span-3 card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Team Activity</h2>
            <span className="text-[10px] text-gray-400">Today</span>
          </div>

          {teamActivity.length > 0 ? (
            <div className="space-y-1">
              {teamActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <ActivityIcon type={act.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">{act.user.name}</span>{" "}
                      {act.action}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[12px] text-gray-400 mb-1">No activity yet</p>
              <p className="text-[11px] text-gray-300">Activity will appear as you work through the pipeline</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions + Workflow progress */}
        <motion.div variants={fadeUp} className="col-span-2 space-y-5">
          {/* Quick Actions */}
          <div className="card rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {!hasData && (
                <button
                  onClick={() => {
                    useProductStore.getState().loadSampleData();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-100 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-brand-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-brand-800">Load Demo Data</p>
                    <p className="text-[10px] text-brand-600">Try with sample customer feedback</p>
                  </div>
                </button>
              )}
              <button
                onClick={() => setView("sources")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-800">Add Integration</p>
                  <p className="text-[10px] text-gray-400">Connect a new data source</p>
                </div>
              </button>
              {hasData && !hasInsights && (
                <button
                  onClick={analyzeSources}
                  disabled={analyzing}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 border border-amber-100 bg-amber-50/50 transition-colors text-left disabled:opacity-60"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    {analyzing ? (
                      <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-amber-900">{analyzing ? "Analyzing..." : "Extract Insights"}</p>
                    <p className="text-[10px] text-amber-600">AI analyzes all {sources.length} connected sources</p>
                  </div>
                </button>
              )}
              {hasInsights && !hasFeatures && (
                <button
                  onClick={recommendFeatures}
                  disabled={recommending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 border border-emerald-100 bg-emerald-50/50 transition-colors text-left disabled:opacity-60"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    {recommending ? (
                      <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-emerald-900">{recommending ? "Building..." : "Build Roadmap"}</p>
                    <p className="text-[10px] text-emerald-600">Prioritize from {insightCount} insights</p>
                  </div>
                </button>
              )}
              {hasFeatures && (
                <button
                  onClick={() => setView("roadmap")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-50 border border-violet-100 bg-violet-50/50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-violet-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0116.5 19.875V4.125z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-violet-900">View Roadmap</p>
                    <p className="text-[10px] text-violet-600">{roadmapItems.length > 0 ? `${roadmapItems.length} items planned` : `${featureCount} features ready`}</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="card rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Pipeline Progress</h2>
            <div className="space-y-3">
              {[
                { label: "Connect Sources", done: hasData, active: !hasData },
                { label: "Extract Insights", done: hasInsights, active: hasData && !hasInsights },
                { label: "Build Features", done: hasFeatures, active: hasInsights && !hasFeatures },
                { label: "Plan Sprints", done: roadmapItems.length > 0, active: hasFeatures && roadmapItems.length === 0 },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    step.done
                      ? "bg-brand-600 text-white"
                      : step.active
                        ? "bg-brand-50 text-brand-700 border-2 border-brand-200"
                        : "bg-gray-100 text-gray-400"
                  }`}>
                    {step.done ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[12px] font-medium ${step.done ? "text-brand-700" : step.active ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                  </div>
                  {step.done && (
                    <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {step.active && !step.done && (
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
