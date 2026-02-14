# The Idea Refinery

> AI agents debate and validate your startup ideas with real-time research, evidence gathering, and multi-step reasoning.

## What It Does

You enter a startup idea. Three AI agents debate it:

1. **Advocate** — builds the strongest case FOR the idea using market research and prior art
2. **Critic** — stress-tests the idea with counterevidence, failed precedents, and risk analysis
3. **Judge** — runs a multi-step reasoning pipeline to verify claims, scrape the web for evidence, and deliver a verdict

The entire debate is visualized as an interactive tree (React Flow). You can **fork** the debate at any node to explore "what if?" scenarios, and **rewind** to re-run from any point.

## Features

- **Multi-debate dashboard** — spin up and manage multiple debates
- **Real-time streaming** — SSE streaming of all agent outputs
- **Judge reasoning pipeline** — 6-step process: extract claims → classify → verify via Perplexity → scrape via Stagehand → reflect → verdict
- **Perplexity Sonar integration** — grounded web search with real citations (prior art, market analysis, counterevidence, claim verification)
- **Stagehand/Browserbase integration** — real browser automation to scrape Product Hunt, GitHub, and competitor sites
- **Fork & rewind** — explore alternative debate directions like git branches
- **Interactive debate tree** — React Flow visualization with color-coded nodes and animated edges
- **Graceful degradation** — mock data fallback when API keys are missing
- **Model-agnostic LLM adapter** — swap between OpenAI, Anthropic, or any OpenAI-compatible endpoint with one env var

## Architecture

```
Frontend (Next.js 14)         API Layer                Agent Layer             Research Layer
─────────────────────         ─────────                ───────────             ──────────────
Dashboard ──────────→ POST /api/debates ─────→ Orchestrator ──────→ Perplexity Sonar
Debate View ────────→ GET  /api/debates/:id/stream   ├─→ Advocate      (sonar-pro)
  ├── Stream Panel         (SSE)                     ├─→ Critic      Stagehand/Browserbase
  ├── React Flow Tree  POST /api/debates/:id/fork    └─→ Judge         (page.extract)
  ├── Fork/Rewind      POST /api/debates/:id/rewind       ↓            Mock Fallback
  └── Verdict Report   POST /api/research           LLM Adapter
                                                    (OpenAI/Anthropic/any)
```

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 App Router |
| Language | JavaScript + JSDoc |
| Styling | Tailwind CSS + custom glass/gradient utilities |
| Tree Viz | @xyflow/react (React Flow) |
| Animations | Framer Motion |
| State (client) | Zustand |
| State (server) | In-memory Map |
| LLM | Model-agnostic adapter (OpenAI, Anthropic, etc.) |
| Research | Perplexity Sonar API (sonar, sonar-pro) |
| Scraping | @browserbasehq/stagehand + Browserbase |
| Deployment | Vercel |

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your keys
cp .env.example .env

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | No | `openai` (default), `anthropic`, or `openai-compatible` |
| `OPENAI_API_KEY` | Yes* | OpenAI API key (required if using OpenAI provider) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (if using Claude) |
| `LLM_BASE_URL` | No | Custom OpenAI-compatible endpoint |
| `LLM_MODEL` | No | Override default model name |
| `PERPLEXITY_API_KEY` | No | Perplexity Sonar for grounded research (falls back to mock) |
| `BROWSERBASE_API_KEY` | No | Browserbase for Stagehand scraping (falls back to mock) |
| `BROWSERBASE_PROJECT_ID` | No | Browserbase project ID |

*At minimum, you need one LLM provider key (OpenAI or Anthropic).

## File Structure

```
app/
  layout.js                      # Root layout
  globals.css                    # Tailwind + glass/gradient utilities
  page.js                        # Dashboard / debate router
  debate/[id]/page.js            # Direct debate link
  api/
    debates/
      route.js                   # POST create, GET list
      [id]/
        route.js                 # GET single debate
        stream/route.js          # GET SSE stream
        fork/route.js            # POST fork
        rewind/route.js          # POST rewind
    research/route.js            # POST unified research endpoint
lib/
  llm.js                         # Model-agnostic LLM adapter
  store.js                       # Server-side in-memory debate store
  types.js                       # JSDoc type definitions
  agents/
    advocate.js                  # Advocate agent
    critic.js                    # Critic agent
    judge.js                     # Judge agent (multi-step reasoning)
    orchestrator.js              # Debate orchestrator
  research/
    perplexity.js                # Perplexity Sonar integration
    stagehand.js                 # Stagehand/Browserbase SDK
    mock.js                      # Mock fallback for demo
components/
  Dashboard.jsx                  # Debate list + create modal
  DebateView.jsx                 # Main debate view (split layout)
  StreamPanel.jsx                # Live streaming with agent avatars
  ForkRewindPanel.jsx            # Branch/timeline controls
  VerdictReport.jsx              # Final verdict display
  debate-tree/
    DebateTree.jsx               # React Flow wrapper
    DebateNode.jsx               # Custom node component
    index.js
store/
  useDebateStore.js              # Zustand client store
```

## Prize Strategy

| Prize | How We Win |
|-------|------------|
| **Best agent reasoning** | Judge's 6-step reasoning loop: extract → classify → verify (Perplexity) → scrape (Stagehand) → reflect → verdict. Loops can demand more evidence. |
| **Stagehand/Browserbase** | Real `@browserbasehq/stagehand` SDK usage with `page.extract()` on Product Hunt, GitHub, and competitor sites. |
| **Best AI Web Data Hack** | Perplexity Sonar (sonar-pro) for grounded search + Stagehand for live scraping = most comprehensive web data pipeline. |
| **Best Vercel usage** | Next.js 14 App Router, SSE streaming, `output: 'standalone'`, clean Vercel deployment. |
| **Perplexity Sonar** | Deep integration: prior art, market analysis, counterevidence, and claim verification all via sonar-pro with real citations. |
