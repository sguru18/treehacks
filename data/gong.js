/**
 * Fake Gong data — sales call transcripts, win/loss signals
 */
const GONG_DATA = [
  {
    id: "gong-001",
    name: "Gong — Sales call: Acme Corp QBR (Sarah Chen)",
    type: "call",
    integration: "gong",
    content: `Call Recording Analysis | Acme Corp Quarterly Business Review
Date: 2025-02-10 | Duration: 42 min | Participants: Sarah Chen (PM), Mike Chen (CSM)
Sentiment: Mixed (62% positive, 38% negative) | Talk Ratio: Customer 65% / Rep 35%

Key Moments:

[05:23] Sarah: "The collaboration features are genuinely great. My team loves the real-time commenting."
→ Sentiment: Positive | Topic: Collaboration

[12:45] Sarah: "But honestly, the task dependency thing is killing us. When someone finishes a task, there's no automatic notification. We've built an entire Slack workflow just to handle handoffs."
→ Sentiment: Negative | Topic: Task Dependencies | Competitor Mention: Slack workaround

[18:30] Sarah: "I spend 30 minutes every single day clicking through profiles to check workloads. That's 2.5 hours a week of my time wasted on something a dashboard could solve."
→ Sentiment: Negative | Topic: Workload Management | Quantified Impact: 2.5 hrs/week

[28:15] Sarah: "We looked at Asana last month. Their calendar sync is really appealing."
→ Sentiment: Negative | Topic: Calendar Sync | Competitor Mention: Asana | Churn Signal: HIGH

[35:40] Sarah: "If you can ship workload management and calendar sync by Q3, we'll stay and probably expand. Otherwise I can't justify the renewal to my VP."
→ Sentiment: Conditional | Topic: Renewal Risk | Revenue at Risk: $48,000/yr

Call Summary: Customer is broadly satisfied with core UX but hitting scaling issues. Three clear feature gaps: task dependencies, workload dashboard, calendar sync. Churn risk is real — competitor evaluation is active.`,
  },
  {
    id: "gong-002",
    name: "Gong — Discovery call: TechVenture (New prospect)",
    type: "call",
    integration: "gong",
    content: `Call Recording Analysis | TechVenture Discovery Call
Date: 2025-02-12 | Duration: 31 min | Participants: Amy Walsh (VP Eng), Jennifer Wu (AE)
Sentiment: 75% positive | Talk Ratio: Customer 55% / Rep 45%

Key Moments:

[03:12] Amy: "We're a 60-person engineering org. Currently using a mix of Notion and Linear. We want to consolidate into one tool."
→ Topic: Prospect Context | Competitors: Notion, Linear

[08:45] Amy: "The board view in your demo looks amazing. Way more intuitive than what we have."
→ Sentiment: Positive | Topic: UX/Design

[14:20] Amy: "Sprint planning is critical for us. We need story points, velocity tracking, and sprint retrospective templates. Do you have that?"
→ Topic: Sprint Management | Priority: Critical

[19:30] Amy: "API access is non-negotiable. We have internal tools that need to read and write task data. Webhooks too."
→ Topic: API | Priority: Non-negotiable

[24:15] Amy: "What about reporting? We need to show our board sprint velocity trends, burndown, and team utilization."
→ Topic: Reporting | Priority: High

[28:00] Amy: "If you have sprint management, API, and reporting, we'd be looking at a 60-seat deployment. That's our entire eng org."
→ Revenue Signal: ~$72,000/yr potential | Conditional on features

Call Summary: Strong prospect with clear budget. Requirements align with our roadmap gaps: sprint management, API access, reporting. If we can demonstrate these capabilities, this is a high-probability close.`,
  },
  {
    id: "gong-003",
    name: "Gong — Churn save call: ScaleUp Inc (Maria Chen)",
    type: "call",
    integration: "gong",
    content: `Call Recording Analysis | ScaleUp Inc — Churn Prevention Call
Date: 2025-02-13 | Duration: 25 min | Participants: Maria Chen (Ops Mgr), David Wong (CSM)
Sentiment: 45% positive, 55% negative | Talk Ratio: Customer 70% / Rep 30%

Key Moments:

[02:10] Maria: "I'll be direct — we're evaluating alternatives. The workload management gap is causing real problems."
→ Sentiment: Negative | Topic: Churn Risk | Priority: Critical

[06:30] Maria: "Three team members quit last quarter. I couldn't spot the uneven workload distribution fast enough. I feel responsible."
→ Sentiment: Highly Negative | Topic: Workload Management | Business Impact: Employee retention

[11:45] Maria: "Capacity planning takes me 30+ minutes every Monday. With 25 team members, I'm clicking into each profile one by one. It's absurd in 2025."
→ Sentiment: Negative | Topic: Workload Management | Quantified Impact: 30+ min/week

[16:20] Maria: "Monday.com showed us their workload view in a demo last week. It does exactly what I need."
→ Competitor Mention: Monday.com | Churn Signal: CRITICAL

[21:00] David: "Maria, I can share that workload management is now our #1 priority for Q2."
Maria: "I appreciate that, but our renewal is in 6 weeks. If I don't see at least a beta by then, I have to make the call."
→ Timeline: 6 weeks | Revenue at Risk: $72,000/yr

Call Summary: CRITICAL churn risk. Customer is actively evaluating Monday.com. Workload management is the single deciding factor. 6-week timeline to renewal. Revenue at risk: $72,000/yr.`,
  },
];

export default GONG_DATA;
