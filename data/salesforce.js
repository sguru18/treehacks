/**
 * Fake Salesforce CRM data — customer notes, opportunity logs, case records
 */
const SALESFORCE_DATA = [
  {
    id: "sf-001",
    name: "Salesforce — Sarah Chen, PM at Acme Corp (Account Note)",
    type: "crm",
    integration: "salesforce",
    content: `Account: Acme Corp | Contact: Sarah Chen, Product Manager | Deal Size: $48,000/yr
Last Activity: 2025-02-10 | Health Score: 72 (At Risk)

CSM Notes:
Sarah expressed frustration with task dependencies during our QBR. Her team has grown from 8 to 22 in 6 months and they're hitting scalability issues. Key pain points:

- "We can't see task dependencies. When someone finishes a task, there's no way to automatically notify the next person in the chain. We end up using Slack for that, which defeats the purpose of having a project management tool."
- "I spend 30 minutes a day clicking through each team member's profile to see how many tasks they have. A workload dashboard would be a game-changer."
- The mobile app performance is a blocker — her hybrid team checks tasks during commutes and the 5-10 second load time means they just stop checking.

Renewal Risk: Medium-High. Competitor Asana came up in conversation. Sarah mentioned calendar sync as a specific feature gap.`,
  },
  {
    id: "sf-002",
    name: "Salesforce — James Lee, Eng Lead at CloudNine (Opportunity Note)",
    type: "crm",
    integration: "salesforce",
    content: `Account: CloudNine | Contact: James Lee, Engineering Lead | Deal Size: $96,000/yr
Last Activity: 2025-02-08 | Health Score: 85 (Healthy)

Expansion Opportunity Notes:
James wants to roll out TaskFlow to 3 additional engineering teams (50+ seats). Blocker: API access for CI/CD integration.

- "We want to integrate TaskFlow into our CI/CD pipeline so that when a deployment succeeds, the related tasks automatically get marked as done."
- Custom fields ("Sprint Number", "Story Points") exist but can't be used in filters or reports — this is frustrating his team leads.
- Onboarding is a pain point: "Last month we onboarded 5 new engineers and I spent an entire afternoon just showing them how to use TaskFlow."

Positive: Git integration for linking commits to tasks is "excellent" — one of the main reasons they chose TaskFlow. This is a strong retention hook.

Next Steps: Demo API access beta, send custom fields roadmap update.`,
  },
  {
    id: "sf-003",
    name: "Salesforce — Maria Chen, Ops Manager at ScaleUp Inc (Case #8834)",
    type: "crm",
    integration: "salesforce",
    content: `Account: ScaleUp Inc | Contact: Maria Chen, Operations Manager | Deal Size: $72,000/yr
Last Activity: 2025-02-12 | Health Score: 58 (At Risk)

Escalated Case — Workload Management:
Maria submitted a critical feature request for a workload dashboard. This is now tagged as a churn risk item.

Customer Quote: "Every Monday I do capacity planning for the week. With 25 team members, checking each person's workload individually takes 30+ minutes. Three team members quit last quarter partly because of consistently overloaded work assignments that I couldn't spot quickly enough."

Requirements from the customer:
- Tasks per person
- Due dates this week
- Overdue tasks
- Estimated hours vs. available hours

Impact: Maria estimates this would save her 2+ hours per week. The team retention angle makes this high-impact from a customer success perspective.

AE Note: ScaleUp's contract renews in 6 weeks. This could be the deciding factor.`,
  },
  {
    id: "sf-004",
    name: "Salesforce — David Park, CTO at FinServ Pro (Lost Deal Debrief)",
    type: "crm",
    integration: "salesforce",
    content: `Account: FinServ Pro (LOST) | Contact: David Park, CTO | Proposed Deal: $120,000/yr
Close Date: 2025-01-28 | Loss Reason: Missing Features

Lost Deal Debrief:
David's team evaluated TaskFlow against Monday.com and Asana. They chose Monday.com primarily because of:

1. Better reporting — burndown charts, velocity tracking, and cycle time analytics out of the box
2. Calendar sync with Google Calendar and Outlook
3. More robust API with webhook support
4. Workload management / capacity planning view

David's feedback: "TaskFlow's UX is the best of the three, honestly. The board view and drag-and-drop are really polished. But we need enterprise-grade reporting and integrations. If you add those, we'd reconsider."

Win-back opportunity in Q3 if reporting and calendar sync ship.`,
  },
];

export default SALESFORCE_DATA;
