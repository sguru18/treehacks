"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/*  Team members (shared constant for assignment)                       */
/* ------------------------------------------------------------------ */
export const TEAM_MEMBERS = [
  {
    id: "as",
    name: "Elon M.",
    role: "Admin",
    color: "bg-brand-600",
    initials: "AS",
  },
  {
    id: "ap",
    name: "Sam A.",
    role: "PM",
    color: "bg-violet-500",
    initials: "PM",
  },
  {
    id: "sg",
    name: "Jensen H.",
    role: "Eng Lead",
    color: "bg-blue-500",
    initials: "SG",
  },
  {
    id: "ps",
    name: "Jeffrey E.",
    role: "Designer",
    color: "bg-pink-500",
    initials: "ML",
  },
  {
    id: "sa",
    name: "Sam A.",
    role: "Data",
    color: "bg-amber-500",
    initials: "SA",
  },
];

/* ------------------------------------------------------------------ */
/*  Sample data for demo                                               */
/* ------------------------------------------------------------------ */

const SAMPLE_SOURCES = [
  {
    id: "sample-1",
    name: "Salesforce — Sarah Chen, PM (Gong call transcript)",
    type: "crm",
    integration: "salesforce",
    content: `We've been using TaskFlow for about 6 months now. The collaboration features are great — my team loves being able to comment on tasks in real-time. But honestly, the biggest frustration is that we can't see task dependencies. When someone finishes a task, there's no way to automatically notify the next person in the chain. We end up using Slack for that, which defeats the purpose of having a project management tool.

Also, the mobile app is really slow — it takes 5-10 seconds to load the dashboard. My team is hybrid and a lot of them check tasks on their phones during commutes. The slow performance means they just stop checking.

One more thing — we desperately need a workload view. I spend 30 minutes a day clicking through each team member's profile to see how many tasks they have. A dashboard that shows everyone's workload at a glance would be a game-changer.`,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    name: "Zendesk — Ticket #4521 (Calendar Integration)",
    type: "support",
    integration: "zendesk",
    content: `Title: Can't connect TaskFlow to our calendar
Priority: High

Description: We need to see our TaskFlow deadlines in Google Calendar. Right now I have to manually copy every deadline, which is really tedious and error-prone. I've missed two important deadlines this month because they were only in TaskFlow and I forgot to check.

This is a must-have for our team. We've been considering switching to Asana specifically because they have calendar sync.

Also, the export feature only supports CSV — we need PDF reports for our stakeholders. Every Friday I spend an hour formatting CSV data into a presentable report. PDF export with our company branding would save me hours every week.`,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sample-3",
    name: "Intercom — NPS Survey Response (Score: 7)",
    type: "support",
    integration: "intercom",
    content: `I like TaskFlow overall, especially the board view and the drag-and-drop interface. It's really intuitive for daily task management.

But I'd give a higher score if you added better reporting. We need to track team velocity, burndown charts, and cycle time. Right now I export data to Excel and make charts manually — it takes hours and the data is always a day behind.

Also, the search function is pretty basic — it can't search within task descriptions or comments. I often remember a keyword from a task discussion but can't find it.

The templates are nice though. I found a good project template for sprint planning that saved us a lot of setup time.`,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sample-4",
    name: "Intercom — Chat transcript (Beta feature review)",
    type: "support",
    integration: "intercom",
    content: `The new automation feature is interesting but really confusing. I tried to set up a rule to move tasks automatically when they're marked complete, but the UI for creating rules is really unintuitive. I had to watch a YouTube tutorial to figure it out, and I'm pretty tech-savvy.

The conditions and actions are laid out in a way that doesn't match how I think about workflows. It would be much better as a visual flowchart — like "when THIS happens, do THAT."

The template library is nice though — I found a good workflow template for bug triaging that my team uses daily. More templates like that would be helpful.

Also, there's no undo button for automations. I accidentally set up a rule that moved all tasks to "Done" and had to manually fix 50+ tasks.`,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sample-5",
    name: "Salesforce — James Lee, Eng Lead (Gong call transcript)",
    type: "crm",
    integration: "salesforce",
    content: `What I really need is API access. We want to integrate TaskFlow into our CI/CD pipeline so that when a deployment succeeds, the related tasks automatically get marked as done. Right now my developers have to remember to update TaskFlow manually, and half the time they forget.

Also, we have custom fields on our tasks — like "Sprint Number" and "Story Points" — but there's no way to use them in filters or reports. They're basically just labels that you can see on individual tasks but can't do anything useful with.

The onboarding for new team members is rough. There's no guided tour or tutorial, so I have to personally walk everyone through it. Last month we onboarded 5 new engineers and I spent an entire afternoon just showing them how to use TaskFlow. An interactive onboarding flow would save me so much time.

On the positive side, the Git integration for linking commits to tasks is excellent. My team uses it every day and it's one of the main reasons we chose TaskFlow.`,
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "sample-6",
    name: "Zendesk — Ticket #5102 (Workload Dashboard request)",
    type: "support",
    integration: "zendesk",
    content: `Title: Workload View / Resource Management Dashboard
Submitted by: Maria Chen, Operations Manager
Priority: Critical

Description: We need a way to see how many tasks are assigned to each team member and their capacity so we can balance workload effectively. Currently I have to click into each person's profile one by one to see their task count and due dates.

Use case: Every Monday I do capacity planning for the week. With 25 team members, checking each person's workload individually takes 30+ minutes. A single dashboard showing:
- Tasks per person
- Due dates this week
- Overdue tasks
- Estimated hours vs. available hours

This would save me 2+ hours per week and prevent burnout from uneven task distribution. Three team members quit last quarter partly because of consistently overloaded work assignments that I couldn't spot quickly enough.`,
    uploadedAt: new Date().toISOString(),
  },
];

/* ------------------------------------------------------------------ */
/*  Store with persistence                                              */
/* ------------------------------------------------------------------ */

const useProductStore = create(
  persist(
    (set, get) => ({
      /* ---- Hydration flag (SSR-safe) ---- */
      _hasHydrated: false,

      /* ---- App state ---- */
      showApp: false,
      enterApp: () => set({ showApp: true, view: "dashboard" }),

      /* ---- Navigation ---- */
      view: "dashboard",
      setView: (view) => set({ view, selectedFeatureId: null }),

      /* ---- Sources ---- */
      sources: [],
      addSource: (source) =>
        set((state) => ({
          sources: [
            ...state.sources,
            {
              ...source,
              id:
                source.id ||
                `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              uploadedAt: new Date().toISOString(),
            },
          ],
        })),
      removeSource: (id) =>
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
        })),
      removeSourcesByIntegration: (integrationId) =>
        set((state) => ({
          sources: state.sources.filter((s) => s.integration !== integrationId),
        })),
      loadSampleData: () =>
        set({
          sources: SAMPLE_SOURCES,
          insights: [],
          features: [],
          selectedFeatureId: null,
        }),

      /* ---- Insights ---- */
      insights: [],
      analyzing: false,
      analyzeError: null,

      analyzeSources: async () => {
        const { sources } = get();
        if (sources.length === 0) return;

        set({ analyzing: true, analyzeError: null });
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sources }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Analysis failed");

          set({
            insights: data.insights,
            analyzing: false,
            view: "insights",
          });
        } catch (error) {
          set({ analyzing: false, analyzeError: error.message });
        }
      },

      /* ---- Features ---- */
      features: [],
      recommending: false,
      recommendError: null,
      selectedFeatureId: null,

      recommendFeatures: async () => {
        const { insights, sources } = get();
        if (insights.length === 0) return;

        set({ recommending: true, recommendError: null });
        try {
          const productContext = sources.map((s) => s.name).join(", ");
          const res = await fetch("/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ insights, productContext }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Recommendation failed");

          set({
            features: data.features,
            recommending: false,
            view: "features",
          });
        } catch (error) {
          set({ recommending: false, recommendError: error.message });
        }
      },

      selectFeature: (id) =>
        set({ selectedFeatureId: id, view: "feature-detail" }),

      addFeature: (featureData) => {
        const id = `feat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const impact = featureData.impact || 5;
        const effort = featureData.effort || 5;
        const confidence = featureData.confidence || 5;
        const priorityScore =
          Math.round(((impact * confidence) / Math.max(effort, 1)) * 10) / 10;

        set((state) => ({
          features: [
            ...state.features,
            {
              ...featureData,
              id,
              priorityScore,
              status: "recommended",
              spec: null,
              tasks: null,
            },
          ],
        }));
      },

      removeFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== id),
          roadmapItems: state.roadmapItems.filter((r) => r.featureId !== id),
        })),

      /* ---- Spec generation ---- */
      generatingSpec: false,
      specError: null,

      generateSpec: async (featureId) => {
        const { features, insights } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature) return;

        set({ generatingSpec: true, specError: null });
        try {
          const relatedInsights = insights.filter((i) =>
            feature.insightIds?.includes(i.id),
          );
          const res = await fetch("/api/spec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature, insights: relatedInsights }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Spec generation failed");

          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, spec: data.spec } : f,
            ),
            generatingSpec: false,
          }));
        } catch (error) {
          set({ generatingSpec: false, specError: error.message });
        }
      },

      /* ---- Task generation ---- */
      generatingTasks: false,
      tasksError: null,

      generateTasks: async (featureId) => {
        const { features } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature || !feature.spec) return;

        set({ generatingTasks: true, tasksError: null });
        try {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature, spec: feature.spec }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Task generation failed");

          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, tasks: data.tasks } : f,
            ),
            generatingTasks: false,
          }));
        } catch (error) {
          set({ generatingTasks: false, tasksError: error.message });
        }
      },

      /* ---- Research / Critic / Risk / Estimate (validation agents) ---- */
      generatingResearch: false,
      generatingCritic: false,
      generatingRisk: false,
      generatingEstimate: false,

      generateResearch: async (featureId) => {
        const { features, sources } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature) return;
        set({ generatingResearch: true });
        try {
          const productContext = sources.map((s) => s.name).join(", ");
          const res = await fetch("/api/research-feature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature, productContext }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Research failed");
          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, research: data.research } : f,
            ),
            generatingResearch: false,
          }));
        } catch (error) {
          set({ generatingResearch: false });
          throw error;
        }
      },

      generateCritic: async (featureId) => {
        const { features, insights } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature) return;
        set({ generatingCritic: true });
        try {
          const relatedInsights = insights.filter((i) =>
            feature.insightIds?.includes(i.id),
          );
          const res = await fetch("/api/critic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature, insights: relatedInsights }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Critic failed");
          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, critique: data.critique } : f,
            ),
            generatingCritic: false,
          }));
        } catch (error) {
          set({ generatingCritic: false });
          throw error;
        }
      },

      generateRisk: async (featureId) => {
        const { features } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature?.spec) return;
        set({ generatingRisk: true });
        try {
          const res = await fetch("/api/risk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spec: feature.spec,
              featureTitle: feature.title,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Risk assessment failed");
          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, risk: data.risk } : f,
            ),
            generatingRisk: false,
          }));
        } catch (error) {
          set({ generatingRisk: false });
          throw error;
        }
      },

      generateEstimate: async (featureId) => {
        const { features } = get();
        const feature = features.find((f) => f.id === featureId);
        if (!feature) return;
        set({ generatingEstimate: true });
        try {
          const res = await fetch("/api/estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              feature,
              spec: feature.spec || null,
              tasks: feature.tasks || [],
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Estimate failed");
          set((state) => ({
            features: state.features.map((f) =>
              f.id === featureId ? { ...f, estimate: data.estimate } : f,
            ),
            generatingEstimate: false,
          }));
        } catch (error) {
          set({ generatingEstimate: false });
          throw error;
        }
      },

      /* ---- Granular updates (human-in-the-loop editing) ---- */
      updateInsight: (id, updates) =>
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id ? { ...i, ...updates } : i,
          ),
        })),

      updateFeature: (id, updates) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ...updates,
                  // Recalculate priority score if impact/effort/confidence changed
                  priorityScore:
                    updates.impact !== undefined ||
                    updates.effort !== undefined ||
                    updates.confidence !== undefined
                      ? Math.round(
                          ((((updates.impact ?? f.impact) || 5) *
                            ((updates.confidence ?? f.confidence) || 5)) /
                            Math.max((updates.effort ?? f.effort) || 5, 1)) *
                            10,
                        ) / 10
                      : f.priorityScore,
                }
              : f,
          ),
        })),

      updateSpecSection: (featureId, sectionKey, value) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === featureId && f.spec
              ? { ...f, spec: { ...f.spec, [sectionKey]: value } }
              : f,
          ),
        })),

      updateTask: (featureId, taskId, updates) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === featureId && f.tasks
              ? {
                  ...f,
                  tasks: f.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updates } : t,
                  ),
                }
              : f,
          ),
        })),

      /* ---- Roadmap ---- */
      roadmapItems: [],

      addToRoadmap: (featureId, sprint = "backlog") => {
        const { features, roadmapItems } = get();
        if (roadmapItems.some((r) => r.featureId === featureId)) return;
        const feature = features.find((f) => f.id === featureId);
        if (!feature) return;
        set({
          roadmapItems: [
            ...roadmapItems,
            {
              id: `rm-${Date.now()}`,
              featureId,
              sprint,
              pinned: false,
              assigneeId: null,
              storyPoints: feature.effort || 0,
              engDays: null,
              status: "planned", // planned | in-progress | done
              addedAt: new Date().toISOString(),
            },
          ],
        });
      },

      removeFromRoadmap: (featureId) =>
        set((state) => ({
          roadmapItems: state.roadmapItems.filter(
            (r) => r.featureId !== featureId,
          ),
        })),

      moveRoadmapItem: (featureId, newSprint) =>
        set((state) => ({
          roadmapItems: state.roadmapItems.map((r) =>
            r.featureId === featureId ? { ...r, sprint: newSprint } : r,
          ),
        })),

      togglePinRoadmapItem: (featureId) =>
        set((state) => ({
          roadmapItems: state.roadmapItems.map((r) =>
            r.featureId === featureId ? { ...r, pinned: !r.pinned } : r,
          ),
        })),

      updateRoadmapItem: (featureId, updates) =>
        set((state) => ({
          roadmapItems: state.roadmapItems.map((r) =>
            r.featureId === featureId ? { ...r, ...updates } : r,
          ),
        })),

      addAllToRoadmap: () => {
        const { features, roadmapItems } = get();
        const existing = new Set(roadmapItems.map((r) => r.featureId));
        const newItems = features
          .filter((f) => !existing.has(f.id))
          .map((f, i) => ({
            id: `rm-${Date.now()}-${i}`,
            featureId: f.id,
            sprint: i < 3 ? "sprint-1" : i < 5 ? "sprint-2" : "sprint-3",
            pinned: false,
            assigneeId: null,
            storyPoints: f.effort || 0,
            engDays: null,
            status: "planned",
            addedAt: new Date().toISOString(),
          }));
        set({ roadmapItems: [...roadmapItems, ...newItems] });
      },

      /* ---- Reset ---- */
      resetAll: () =>
        set({
          view: "dashboard",
          sources: [],
          insights: [],
          features: [],
          roadmapItems: [],
          selectedFeatureId: null,
          analyzing: false,
          recommending: false,
          generatingSpec: false,
          generatingTasks: false,
          generatingResearch: false,
          generatingCritic: false,
          generatingRisk: false,
          generatingEstimate: false,
          analyzeError: null,
          recommendError: null,
          specError: null,
          tasksError: null,
        }),
    }),
    {
      name: "daisy-store",
      partialize: (state) => ({
        view: state.view,
        selectedFeatureId: state.selectedFeatureId,
        sources: state.sources,
        insights: state.insights,
        features: state.features,
        roadmapItems: state.roadmapItems,
      }),
      onRehydrateStorage: () => () => {
        useProductStore.setState({ _hasHydrated: true });
      },
    },
  ),
);

export default useProductStore;
