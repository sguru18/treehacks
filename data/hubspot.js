/**
 * Fake HubSpot data — feedback forms, NPS surveys, deal notes
 */
const HUBSPOT_DATA = [
  {
    id: "hs-001",
    name: "HubSpot — Feedback Form: Q1 Product Survey (Aggregate)",
    type: "crm",
    integration: "hubspot",
    content: `HubSpot Feedback Survey | Q1 2025 Product Satisfaction
Responses: 342 | Avg Score: 7.2/10 | Response Rate: 28%

Top Requested Features (by mention count):
1. Reporting & Analytics — 89 mentions (26%)
   "Need burndown charts" | "Velocity tracking" | "Custom dashboards" | "Export to PDF"

2. Calendar Integration — 67 mentions (20%)
   "Google Calendar sync" | "See deadlines in my calendar" | "Outlook integration"

3. Workload Management — 54 mentions (16%)
   "Team capacity view" | "Resource allocation" | "Workload balancing"

4. Mobile Performance — 48 mentions (14%)
   "App is too slow" | "Takes forever to load" | "Push notifications don't work"

5. API Access — 41 mentions (12%)
   "Need webhook support" | "REST API" | "CI/CD integration"

Top Praised Features:
1. Board View / Drag-and-Drop — 156 mentions (46%)
2. Git Integration — 98 mentions (29%)
3. Templates — 67 mentions (20%)
4. Real-time Collaboration — 54 mentions (16%)

Verbatim Highlights:
- "TaskFlow has the best UX of any PM tool I've used. Just need enterprise features to match."
- "I love the product but I'm spending 3 hours a week on workarounds for missing features."
- "Please add calendar sync. I've asked 4 times now."
- "The Git integration alone keeps us on TaskFlow. Everything else is just OK."`,
  },
  {
    id: "hs-002",
    name: "HubSpot — NPS Campaign: January 2025 Results",
    type: "crm",
    integration: "hubspot",
    content: `HubSpot NPS Campaign | January 2025
Total Responses: 218 | NPS Score: +32
Promoters (9-10): 42% | Passives (7-8): 28% | Detractors (0-6): 30%

Promoter Themes (what they love):
- "Beautiful, intuitive interface" (68% of promoters)
- "Git integration is a killer feature" (45% of promoters)
- "Templates save us hours of setup" (34% of promoters)
- "Best drag-and-drop I've seen" (29% of promoters)

Detractor Themes (what's driving them away):
- "No reporting or analytics" (72% of detractors)
- "Mobile app is painfully slow" (58% of detractors)
- "Missing calendar sync" (51% of detractors)
- "Can't manage team workload" (44% of detractors)
- "No API access despite being on Enterprise plan" (38% of detractors)

Passive → Promoter Opportunity:
Most passives (Score 7-8) said they'd become promoters with just ONE of:
- Reporting dashboards (mentioned by 61%)
- Calendar sync (mentioned by 43%)
- Faster mobile app (mentioned by 38%)

Key Insight: Our promoters love the UX/design. Our detractors want enterprise features. The gap between "beautiful tool" and "complete platform" is where we're losing customers.`,
  },
];

export default HUBSPOT_DATA;
