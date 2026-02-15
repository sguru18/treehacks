# Daisy — AI-Powered Product Management Platform

Daisy turns raw customer feedback into prioritized roadmaps and sprint-ready development tasks. It automates the entire product management workflow — from ingesting data sources (CRM, support tickets, surveys) to extracting insights, recommending features, writing specs, and breaking work into developer tasks.

Built at **TreeHacks 2025**.

---

## Features

- **Data Source Integration** — Connect tools like Salesforce, Zendesk, Intercom, Slack, Gong, HubSpot, Jira, Linear, and Amplitude, or upload custom documents (interviews, tickets, surveys).
- **AI-Powered Insight Extraction** — Automatically categorize customer feedback into pain points, feature requests, praise, and confusion with severity scoring, frequency tracking, and direct customer quotes.
- **Feature Recommendations** — Generate prioritized feature suggestions scored by impact, effort, confidence, and overall priority.
- **Spec Generation** — One-click PRD and technical spec creation including user stories, UI changes, data model changes, and success metrics.
- **Task Breakdown** — Convert features into development tasks with effort estimates, acceptance criteria, and task types.
- **Roadmap Management** — Sprint-based roadmap with drag-and-drop assignment, story point tracking, team member assignment, and status tracking.
- **RAG Chatbot (Daisy)** — Context-aware AI assistant with full board knowledge that can answer questions about sources, insights, features, specs, tasks, and the roadmap.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, Framer Motion |
| State | Zustand (with localStorage persistence) |
| Visualization | React Flow |
| LLM | Anthropic Claude / OpenAI / xAI Grok (configurable) |
| Streaming | Server-Sent Events (SSE) |

## Project Structure

```
treehacks/
├── app/
│   ├── api/
│   │   ├── analyze/route.js        # Sources → Insights
│   │   ├── recommend/route.js      # Insights → Feature recommendations
│   │   ├── spec/route.js           # Features → Technical specs
│   │   ├── tasks/route.js          # Features → Development tasks
│   │   ├── chat/route.js           # RAG chatbot endpoint
│   │   └── research/route.js       # Research functionality
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ChatPanel.jsx               # Floating chat interface
│   ├── Dashboard.jsx               # Main dashboard
│   ├── FeatureDetail.jsx           # Feature detail view
│   ├── FeaturesView.jsx            # Feature list
│   ├── InsightsView.jsx            # Insights list
│   ├── IntegrationLogos.jsx        # Integration icons
│   ├── LandingPage.jsx             # Marketing landing page
│   ├── RoadmapView.jsx             # Sprint roadmap
│   ├── Sidebar.jsx                 # Navigation sidebar
│   └── SourcesView.jsx             # Integrations & sources
├── lib/
│   ├── agents/
│   │   ├── analyzer.js             # Insight extraction agent
│   │   ├── recommender.js          # Feature recommendation agent
│   │   ├── specwriter.js           # Spec generation agent
│   │   └── taskbreaker.js          # Task breakdown agent
│   ├── research/
│   │   ├── stagehand.js            # Browser automation research
│   │   ├── perplexity.js           # Perplexity API integration
│   │   └── mock.js                 # Mock research data
│   └── llm.js                      # LLM adapter (multi-provider)
├── store/
│   └── useProductStore.js          # Zustand store
├── data/                           # Sample data & integration mocks
├── package.json
├── tailwind.config.js
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- An API key for one of the supported LLM providers (Anthropic, OpenAI, or xAI)

### Installation

```bash
git clone https://github.com/your-username/treehacks.git
cd treehacks
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# LLM provider: "anthropic", "openai", or "openai-compatible"
LLM_PROVIDER=openai-compatible

# Model name
LLM_MODEL=grok-4-1-fast-reasoning

# Base URL (required for openai-compatible providers)
LLM_BASE_URL=https://api.x.ai/v1

# API key for your chosen provider
LLM_API_KEY=your-api-key-here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Workflow

```
Connect Sources  →  Analyze  →  Recommend  →  Spec  →  Tasks  →  Roadmap
   (CRM, docs)     (insights)   (features)   (PRDs)  (dev work)  (sprints)
```

1. **Connect** integrations or upload documents as sources.
2. **Analyze** sources to extract categorized insights.
3. **Recommend** features based on the insights, scored by impact and effort.
4. **Generate specs** with user stories, technical details, and success metrics.
5. **Break down tasks** with estimates and acceptance criteria.
6. **Plan sprints** on the roadmap with drag-and-drop, assignments, and status tracking.

Use the **Daisy chatbot** at any step to ask questions about your board.

## License

MIT
