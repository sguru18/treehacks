/**
 * Fake Zendesk support data — tickets, CSAT responses, agent notes
 */
const ZENDESK_DATA = [
  {
    id: "zd-001",
    name: "Zendesk — Ticket #4521: Calendar Integration (High Priority)",
    type: "support",
    integration: "zendesk",
    content: `Ticket #4521 | Priority: High | Status: Open | CSAT: 2/5
Requester: Alex Turner, Project Lead at BrightPath
Agent: Rachel Kim | Created: 2025-02-05

Subject: Can't connect TaskFlow to our calendar

Customer Message:
"We need to see our TaskFlow deadlines in Google Calendar. Right now I have to manually copy every deadline, which is really tedious and error-prone. I've missed two important deadlines this month because they were only in TaskFlow and I forgot to check. This is a must-have for our team. We've been considering switching to Asana specifically because they have calendar sync."

Follow-up: "Also, the export feature only supports CSV — we need PDF reports for our stakeholders. Every Friday I spend an hour formatting CSV data into a presentable report. PDF export with our company branding would save me hours every week."

Agent Notes: This is the 12th ticket about calendar sync this month. Tagging as feature request + escalating to product. Customer explicitly mentioned competitor (Asana).

Tags: calendar-sync, export, pdf, competitor-mention, churn-risk`,
  },
  {
    id: "zd-002",
    name: "Zendesk — Ticket #4587: Search is broken (Medium Priority)",
    type: "support",
    integration: "zendesk",
    content: `Ticket #4587 | Priority: Medium | Status: Open | CSAT: 3/5
Requester: Lisa Wang, Designer at CreativeOps
Agent: Marcus Johnson | Created: 2025-02-07

Subject: Can't find anything with search

Customer Message:
"The search function is pretty basic — it can't search within task descriptions or comments. I often remember a keyword from a task discussion but can't find it. I end up scrolling through dozens of tasks manually. This is especially painful when I'm trying to find design feedback from weeks ago."

Follow-up: "Also, when I do find results, there's no way to filter by date range or task status. The search results page feels like an afterthought."

Agent Notes: Search improvements are a recurring theme. 8 tickets this month. The core issue is that search only indexes task titles, not descriptions or comments.

Tags: search, ux, productivity`,
  },
  {
    id: "zd-003",
    name: "Zendesk — Ticket #4612: Automation rules are confusing (High Priority)",
    type: "support",
    integration: "zendesk",
    content: `Ticket #4612 | Priority: High | Status: Escalated | CSAT: 1/5
Requester: Tom Bradley, Eng Manager at DevStack
Agent: Rachel Kim | Created: 2025-02-09

Subject: Automation feature is unusable — accidentally moved all tasks to Done

Customer Message:
"The new automation feature is interesting but really confusing. I tried to set up a rule to move tasks automatically when they're marked complete, but the UI for creating rules is really unintuitive. I had to watch a YouTube tutorial to figure it out, and I'm pretty tech-savvy."

"There's no undo button for automations. I accidentally set up a rule that moved all tasks to 'Done' and had to manually fix 50+ tasks. This cost my team 2 hours."

"The conditions and actions are laid out in a way that doesn't match how I think about workflows. It would be much better as a visual flowchart — like 'when THIS happens, do THAT.'"

Agent Notes: CRITICAL — this customer is on Enterprise plan ($96k/yr). The automation UX is generating negative sentiment. Recommending a PM review of the automation builder flow.

Tags: automation, ux, critical, enterprise, data-loss-risk`,
  },
  {
    id: "zd-004",
    name: "Zendesk — Ticket #4650: Mobile app is too slow (Medium Priority)",
    type: "support",
    integration: "zendesk",
    content: `Ticket #4650 | Priority: Medium | Status: Open | CSAT: 2/5
Requester: Nina Patel, Team Lead at RemoteFirst
Agent: Marcus Johnson | Created: 2025-02-11

Subject: Mobile app performance is terrible

Customer Message:
"The mobile app takes 5-10 seconds to load the dashboard. My team is fully remote across 3 time zones and a lot of us check tasks on our phones between meetings. The slow performance means people just stop checking and we miss updates."

"Also, push notifications are unreliable. I've set up notifications for task assignments but they only come through about half the time. The other half I find out from Slack that someone assigned me something."

"We love the desktop experience but the mobile gap is becoming a real problem. We're a 40-person team and about 60% of task updates happen on mobile."

Agent Notes: Mobile performance is our #3 most reported issue. 15 tickets this month. Engineering is aware but no timeline yet.

Tags: mobile, performance, notifications, remote-work`,
  },
];

export default ZENDESK_DATA;
