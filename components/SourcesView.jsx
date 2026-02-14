"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useProductStore from "@/store/useProductStore";
import IntegrationLogo from "@/components/IntegrationLogos";
import { getIntegrationData } from "@/data";

/* ------------------------------------------------------------------ */
/*  Integration catalog                                                */
/* ------------------------------------------------------------------ */
const CATALOG = [
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    desc: "Sync contacts, opportunities, cases, and customer notes.",
    color: "#00A1E0",
    records: "12.4k",
    authLabel: "Sign in with Salesforce",
    scopes: ["Contacts", "Opportunities", "Cases", "Notes"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    category: "Support",
    desc: "Pull support tickets, CSAT scores, and agent conversations.",
    color: "#03363D",
    records: "8.2k",
    authLabel: "Connect Zendesk Account",
    scopes: ["Tickets", "CSAT", "Agent Notes", "Tags"],
  },
  {
    id: "intercom",
    name: "Intercom",
    category: "Support",
    desc: "Import chat transcripts, NPS responses, and product tour data.",
    color: "#286EFA",
    records: "3.1k",
    authLabel: "Authorize Intercom",
    scopes: ["Conversations", "NPS", "Product Tours", "Users"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "Channels",
    desc: "Monitor feedback channels, feature request threads, and mentions.",
    color: "#E01E5A",
    records: "5.7k",
    authLabel: "Add to Slack",
    scopes: ["Channels", "Threads", "Messages", "Reactions"],
  },
  {
    id: "gong",
    name: "Gong",
    category: "Calls",
    desc: "Analyze sales call transcripts, objections, and win/loss signals.",
    color: "#7C3AED",
    records: "1.9k",
    authLabel: "Connect Gong",
    scopes: ["Calls", "Transcripts", "Trackers", "Deals"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    desc: "Sync deals, feedback forms, NPS surveys, and customer timelines.",
    color: "#FF7A59",
    records: "6.8k",
    authLabel: "Sign in with HubSpot",
    scopes: ["Deals", "Contacts", "Forms", "Surveys"],
  },
  {
    id: "jira",
    name: "Jira",
    category: "Project",
    desc: "Import bug reports, feature requests, and user-reported issues.",
    color: "#0052CC",
    records: "4.3k",
    authLabel: "Connect Jira Cloud",
    scopes: ["Issues", "Projects", "Comments", "Labels"],
  },
  {
    id: "linear",
    name: "Linear",
    category: "Project",
    desc: "Sync issues, project updates, and customer-facing bug reports.",
    color: "#5E6AD2",
    records: "2.1k",
    authLabel: "Authorize Linear",
    scopes: ["Issues", "Projects", "Labels", "Cycles"],
  },
  {
    id: "amplitude",
    name: "Amplitude",
    category: "Analytics",
    desc: "Pull user behavior data, funnel drop-offs, and feature adoption.",
    color: "#1D2026",
    records: "24.6k",
    authLabel: "Connect Amplitude",
    scopes: ["Events", "Funnels", "Cohorts", "Charts"],
  },
];

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

/* ------------------------------------------------------------------ */
/*  Connection Modal                                                    */
/* ------------------------------------------------------------------ */
function ConnectModal({ integration, onClose, onConnected }) {
  const [step, setStep] = useState("auth"); // auth | scopes | syncing | done
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);

  useEffect(() => {
    if (step === "syncing") {
      const total = parseInt(integration.records.replace(/[^0-9]/g, "")) * 100;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setSyncProgress(100);
          setSyncedCount(total);
          setTimeout(() => setStep("done"), 500);
        } else {
          setSyncProgress(Math.min(progress, 99));
          setSyncedCount(Math.floor((progress / 100) * total));
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step, integration.records]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100">
                <IntegrationLogo id={integration.id} size={28} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">
                  {integration.name}
                </h3>
                <p className="text-[12px] text-gray-400">{integration.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {step === "auth" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                  Connect your {integration.name} account to automatically sync
                  customer data into Daisy.
                </p>

                {/* Fake OAuth button */}
                <button
                  onClick={() => setStep("scopes")}
                  className="w-full py-3 rounded-xl text-[14px] font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2.5 mb-4"
                  style={{ backgroundColor: integration.color }}
                >
                  <IntegrationLogo id={integration.id} size={20} />
                  {integration.authLabel}
                </button>

                <div className="flex items-center gap-2 justify-center">
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[11px] text-gray-300">Secured with OAuth 2.0 &middot; Read-only access</span>
                </div>
              </motion.div>
            )}

            {step === "scopes" && (
              <motion.div
                key="scopes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-brand-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-brand-700">Authenticated successfully</span>
                </div>

                <p className="text-[13px] text-gray-500 mb-4">
                  Daisy will sync the following data from {integration.name}:
                </p>

                <div className="space-y-2 mb-5">
                  {integration.scopes.map((scope) => (
                    <div
                      key={scope}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50"
                    >
                      <svg className="w-4 h-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-[13px] text-gray-700">{scope}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep("syncing")}
                  className="w-full py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-medium transition-colors"
                >
                  Start Sync
                </button>
              </motion.div>
            )}

            {step === "syncing" && (
              <motion.div
                key="syncing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="py-4"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                    Syncing from {integration.name}
                  </h4>
                  <p className="text-[12px] text-gray-400">
                    {syncedCount.toLocaleString()} records synced...
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-brand-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${syncProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Importing records...</span>
                  <span>{Math.round(syncProgress)}%</span>
                </div>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="py-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h4 className="text-[15px] font-semibold text-gray-900 mb-1">
                  {integration.name} connected!
                </h4>
                <p className="text-[12px] text-gray-400 mb-5">
                  {integration.records} records synced. Daisy will keep this data up to date automatically.
                </p>
                <button
                  onClick={() => {
                    onConnected(integration);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-[13px] font-medium transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom upload form                                                  */
/* ------------------------------------------------------------------ */
function UploadForm({ onClose }) {
  const addSource = useProductStore((s) => s.addSource);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("interview");
  const [formContent, setFormContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) return;
    addSource({
      name: formName.trim(),
      type: formType,
      content: formContent.trim(),
    });
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      onSubmit={handleSubmit}
      className="card rounded-xl p-5 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Upload Custom Document
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formName.trim() || !formContent.trim()}
          className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add Document
        </button>
      </div>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main View                                                           */
/* ------------------------------------------------------------------ */
export default function SourcesView() {
  const sources = useProductStore((s) => s.sources);
  const addSource = useProductStore((s) => s.addSource);
  const loadSampleData = useProductStore((s) => s.loadSampleData);
  const analyzeSources = useProductStore((s) => s.analyzeSources);
  const analyzing = useProductStore((s) => s.analyzing);
  const analyzeError = useProductStore((s) => s.analyzeError);

  const [connected, setConnected] = useState([]);
  const [modalIntegration, setModalIntegration] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  /* Sync connected state when sources exist (e.g. from sample data) */
  useEffect(() => {
    if (sources.length > 0 && connected.length === 0) {
      setConnected(["salesforce", "zendesk", "intercom"]);
    }
  }, [sources.length, connected.length]);

  const handleConnected = (integration) => {
    if (connected.includes(integration.id)) return;
    setConnected((prev) => [...prev, integration.id]);

    // Load the fake data for this integration
    const data = getIntegrationData(integration.id);
    data.forEach((item) => {
      addSource({
        name: item.name,
        type: item.type,
        content: item.content,
        integration: item.integration,
      });
    });
  };

  const handleDisconnect = (integrationId) => {
    setConnected((prev) => prev.filter((id) => id !== integrationId));
  };

  const handleLoadSample = () => {
    loadSampleData();
    setConnected(["salesforce", "zendesk", "intercom"]);
  };

  const connectedIntegrations = CATALOG.filter((i) => connected.includes(i.id));
  const availableIntegrations = CATALOG.filter((i) => !connected.includes(i.id));

  // Count custom uploads (sources without an integration field)
  const customSources = sources.filter((s) => !s.integration);

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
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-0.5">
            Integrations
          </h1>
          <p className="text-sm text-gray-400">
            Connect your tools or upload custom documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload
          </button>
          {(connectedIntegrations.length > 0 || sources.length > 0) && (
            <button
              onClick={analyzeSources}
              disabled={analyzing || sources.length === 0}
              className="px-3.5 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5"
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Analyze All
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {analyzeError && (
        <motion.div variants={fadeUp} className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{analyzeError}</p>
        </motion.div>
      )}

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <UploadForm onClose={() => setShowUploadForm(false)} />
        )}
      </AnimatePresence>

      {/* Connected integrations */}
      {connectedIntegrations.length > 0 && (
        <motion.div variants={fadeUp} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Connected ({connectedIntegrations.length})
          </h2>
          <div className="space-y-2">
            {connectedIntegrations.map((integration) => {
              const sourceCount = sources.filter(
                (s) => s.integration === integration.id,
              ).length;
              return (
                <div
                  key={integration.id}
                  className="card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <IntegrationLogo id={integration.id} size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] font-semibold text-gray-800">
                        {integration.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 font-medium">
                        {integration.category}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-50 text-[10px] text-brand-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400">
                      {integration.records} records &middot;{" "}
                      {sourceCount > 0
                        ? `${sourceCount} documents synced`
                        : "Syncing..."}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    Disconnect
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Custom uploads section */}
      {customSources.length > 0 && (
        <motion.div variants={fadeUp} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Custom Documents ({customSources.length})
          </h2>
          <div className="space-y-1.5">
            {customSources.map((source) => (
              <div
                key={source.id}
                className="card rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <span className="text-base">📄</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-medium text-gray-700 truncate">
                    {source.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate">
                    {source.content.substring(0, 80)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available integrations grid */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          {connectedIntegrations.length > 0
            ? "Add More Integrations"
            : "Connect an Integration to Get Started"}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {availableIntegrations.map((integration) => (
            <motion.button
              key={integration.id}
              variants={fadeUp}
              onClick={() => setModalIntegration(integration)}
              className="card rounded-xl p-4 text-left hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <IntegrationLogo id={integration.id} size={22} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-800 group-hover:text-gray-900">
                    {integration.name}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {integration.category}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                {integration.desc}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-700">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Connect
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sample data shortcut */}
      {connectedIntegrations.length === 0 && sources.length === 0 && (
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <p className="text-[12px] text-gray-300 mb-2">Just exploring?</p>
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-500 rounded-lg text-[12px] font-medium transition-colors"
          >
            Load Demo with Salesforce, Zendesk & Intercom
          </button>
        </motion.div>
      )}

      {/* Connection modal */}
      <AnimatePresence>
        {modalIntegration && (
          <ConnectModal
            integration={modalIntegration}
            onClose={() => setModalIntegration(null)}
            onConnected={handleConnected}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
