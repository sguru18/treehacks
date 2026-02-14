/**
 * Fake Slack data — customer feedback channels, feature request threads
 */
const SLACK_DATA = [
  {
    id: "sl-001",
    name: "Slack — #customer-feedback: Reporting requests thread",
    type: "channel",
    integration: "slack",
    content: `Channel: #customer-feedback | Thread: Reporting Feature Requests
Started by: @jessica.huang (CSM) | 47 replies, 23 participants

@jessica.huang: Compiling reporting-related requests from the last month. Thread below 👇

@mark.taylor (AE): Acme Corp (Enterprise, $120k) — they need burndown charts and velocity tracking. PM Sarah Chen said "We export to Excel every week and make charts manually. It takes hours."

@rachel.kim (Support): We've had 34 support tickets about reporting in the last 30 days. Top asks: (1) burndown charts, (2) cycle time analytics, (3) custom dashboards, (4) PDF export.

@david.wong (CSM): CloudNine ($96k) is asking for sprint velocity reports. Their eng lead James wants to track story points completed per sprint over time. He said the custom fields exist but can't be used in reports.

@sarah.peters (PM): Thanks everyone. I'm seeing three themes: (1) time-series analytics (velocity, burndown, cycle time), (2) exportable reports (PDF with branding), (3) custom field support in reports. Adding to our Q2 planning doc.

@jessica.huang: Also worth noting — FinServ Pro ($120k deal) was LOST primarily because of missing reporting. David Park (their CTO) said "TaskFlow's UX is the best but we need enterprise-grade reporting."

@mike.chen (CEO): This keeps coming up. Can we get an estimate on a basic reporting MVP? Even just burndown + velocity would cover 80% of requests.`,
  },
  {
    id: "sl-002",
    name: "Slack — #product-feedback: Mobile app complaints",
    type: "channel",
    integration: "slack",
    content: `Channel: #product-feedback | Thread: Mobile Performance Issues
Started by: @marcus.j (Support Lead) | 28 replies, 15 participants

@marcus.j: Mobile performance is now our #3 most reported issue. 15 tickets this month alone. Compiling the key data points:

@marcus.j: Ticket data summary:
- Average reported load time: 5-10 seconds for dashboard
- 60% of reports come from teams >20 people (more data = slower)
- Push notification reliability reported at ~50%
- 3 enterprise customers have mentioned it as a renewal risk factor

@nina.patel.support: RemoteFirst (40-person team) says 60% of their task updates happen on mobile. The slow performance means people stop checking entirely.

@amy.chen (Support): New trial user Chris from NovaTech couldn't even complete onboarding on mobile. He switched to desktop mid-session.

@kevin.zhao (Eng): I ran some profiling — the main bottleneck is that we're loading the full task graph on app open instead of paginating. Should be fixable in 2-3 sprints. The notification issue is a separate FCM configuration problem, probably a 1-sprint fix.

@sarah.peters (PM): Can we prioritize the notification fix? That's likely a quick win. Dashboard pagination is more complex but has higher impact.`,
  },
  {
    id: "sl-003",
    name: "Slack — #sales-intel: Competitive intelligence roundup",
    type: "channel",
    integration: "slack",
    content: `Channel: #sales-intel | Thread: Competitive Losses — January Roundup
Started by: @jennifer.wu (Sales Director) | 19 replies

@jennifer.wu: We lost 4 deals to competitors in January. Here's the breakdown:

Lost to Monday.com (2 deals, $180k combined):
- Both cited reporting/analytics as the primary gap
- One specifically mentioned calendar sync
- Both said our UX was "best in class" but feature gaps were dealbreakers

Lost to Asana (1 deal, $45k):
- Calendar sync was the #1 reason
- Customer said "Asana's calendar view is exactly what we need"
- They also liked Asana's workload management feature

Lost to Linear (1 deal, $32k):
- Developer-focused team that wanted API-first approach
- Said our API was "nonexistent" (we were still in private beta)
- Liked our Git integration but needed webhooks + full CRUD API

@mark.taylor: Pattern is clear — we're winning on UX/design but losing on: (1) reporting, (2) calendar sync, (3) API access, (4) workload management. Same themes as our support tickets.

@mike.chen (CEO): We need to close these gaps in Q2 or we're going to keep losing enterprise deals. Let's make this the top priority in next week's planning.`,
  },
];

export default SLACK_DATA;
