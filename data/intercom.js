/**
 * Fake Intercom data — chat transcripts, NPS responses, product tour analytics
 */
const INTERCOM_DATA = [
  {
    id: "ic-001",
    name: "Intercom — NPS Response: Score 7 (Passive)",
    type: "support",
    integration: "intercom",
    content: `NPS Survey Response | Score: 7 (Passive) | Segment: Mid-Market
User: Jordan Miller, PM at GrowthCo | MRR: $4,200 | Account Age: 8 months

Response: "I like TaskFlow overall, especially the board view and the drag-and-drop interface. It's really intuitive for daily task management. But I'd give a higher score if you added better reporting. We need to track team velocity, burndown charts, and cycle time. Right now I export data to Excel and make charts manually — it takes hours and the data is always a day behind."

Follow-up Question ("What would make you a 9 or 10?"):
"Two things: (1) Real-time reporting dashboards with velocity and burndown charts, and (2) calendar sync so I can see deadlines alongside my meetings. Those two would make TaskFlow my complete command center instead of just a task tracker."

Intercom Tags: nps-passive, reporting, calendar, upsell-opportunity`,
  },
  {
    id: "ic-002",
    name: "Intercom — Chat: Onboarding confusion (new user)",
    type: "support",
    integration: "intercom",
    content: `Chat Transcript | User: Chris Park, Developer at NovaTech
Session: New user, Day 1 | Plan: Pro Trial

[14:23] Chris: Hey, I just signed up and I'm a bit lost. Is there a tutorial or something?
[14:24] Bot: Welcome to TaskFlow! 👋 You can check out our getting started guide at docs.taskflow.com/start
[14:26] Chris: I've been clicking around for 10 mins and can't figure out how to create a project. The "New" button seems to only create tasks, not projects.
[14:27] Agent (Amy): Hi Chris! To create a project, click the workspace dropdown in the top-left, then "New Project." I know it's a bit hidden — we're working on improving this!
[14:28] Chris: Oh wow, that's really not intuitive. Took me 15 minutes to find that with help. My team lead wants me to set up our sprint board but I can't figure out how to add sprint cycles either.
[14:30] Agent (Amy): Sprint cycles are under Project Settings > Workflows > Sprint Configuration. I'll send you a walkthrough video!
[14:32] Chris: Thanks Amy. Honestly the product looks powerful but the learning curve is steep. My team lead said he spent a whole afternoon onboarding people last month. An interactive walkthrough inside the app would be really helpful.
[14:33] Agent (Amy): Totally understand — I've passed this feedback along to our product team. A lot of users have been asking for in-app onboarding.

Tags: onboarding, ux, new-user, trial-risk`,
  },
  {
    id: "ic-003",
    name: "Intercom — NPS Response: Score 9 (Promoter)",
    type: "support",
    integration: "intercom",
    content: `NPS Survey Response | Score: 9 (Promoter) | Segment: Startup
User: Emma Rodriguez, Founder at LaunchPad | MRR: $890 | Account Age: 14 months

Response: "TaskFlow is genuinely the best task management tool I've used. The board view is beautiful, templates save us tons of time, and the Git integration is why we chose it over Linear. My dev team lives in it."

Follow-up: "Only thing keeping me from a 10: we need better mobile performance (it's slow on phones) and I wish there was a way to see my team's workload at a glance without clicking into each person. Also — the template library is great but I wish there were more templates for specific use cases like bug triaging and sprint retros."

Intercom Tags: nps-promoter, mobile, workload, templates, git-integration-love`,
  },
  {
    id: "ic-004",
    name: "Intercom — Chat: Feature request from power user",
    type: "support",
    integration: "intercom",
    content: `Chat Transcript | User: Ryan O'Brien, Sr. Engineer at DataPipe
Session: Power user, 11 months | Plan: Enterprise

[09:15] Ryan: Quick question — is there any way to use custom fields in filters? We added "Story Points" and "Sprint Number" as custom fields but they're basically useless because we can't filter or sort by them.
[09:17] Agent (Sam): Hi Ryan! Unfortunately custom fields aren't available in filters yet, but it's on our roadmap. Currently you can only view them on individual task cards.
[09:18] Ryan: That's really frustrating. We have 200+ tasks and I need to see all tasks in Sprint 14 with more than 3 story points. Right now I have to eyeball it by scrolling through everything.
[09:19] Ryan: Also, is there an API we can use? We want to build a custom dashboard that pulls task data and shows sprint velocity over time.
[09:20] Agent (Sam): API access is in our Enterprise plan — I see you're already on it. Let me check... actually, the API is still in private beta. I can add you to the waitlist?
[09:21] Ryan: We're paying enterprise prices and don't have API access? That's a tough sell to my CTO. We chose TaskFlow partly on the promise of API integrations.
[09:23] Agent (Sam): Totally understand your frustration, Ryan. Let me escalate this to our team and get you early access. I'll follow up by EOD.

Tags: custom-fields, api, enterprise, escalation, sprint-management`,
  },
];

export default INTERCOM_DATA;
