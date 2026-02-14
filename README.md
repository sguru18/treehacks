# The Idea Refinery

AI agents debate and validate your startup ideas through adversarial debate, real-time web research, and visual branching exploration.

## Features

- **Three AI Agents**: Advocate (argues FOR), Critic (argues AGAINST), and Judge (demands evidence)
- **Real-time Research**: Perplexity Sonar API for prior art, market analysis, and counterevidence
- **Web Validation**: Stagehand/Browserbase for scraping competitors, Product Hunt, and GitHub
- **Visual Debate Tree**: React Flow visualization with fork/rewind capabilities
- **Multi-step Reasoning**: Judge agent uses a sophisticated pipeline to evaluate claims

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Debate Tree**: React Flow
- **Agents**: OpenAI GPT-4o
- **Research**: Perplexity Sonar API
- **Web Scraping**: Stagehand + Browserbase
- **Deployment**: Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`):
- `OPENAI_API_KEY`
- `PERPLEXITY_API_KEY`
- `BROWSERBASE_API_KEY`
- `STAGEHAND_API_KEY`

3. Run development server:
```bash
npm run dev
```

4. Deploy to Vercel:
```bash
vercel
```

## Prize Targets

This project targets:
1. **Perplexity Sonar** - Best use of Perplexity Sonar API
2. **Best Agent Reasoning** - Multi-step reasoning pipeline
3. **Stagehand/Browserbase** - AI browser automation
4. **Best AI Web Data Hack** - Comprehensive web data pipeline
5. **Vercel** - Production-ready deployment

## Project Structure

```
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── debate-tree/  # React Flow debate tree
│   └── ...
├── lib/
│   ├── agents/       # AI agents (advocate, critic, judge, orchestrator)
│   ├── research/     # Research integrations (Perplexity, Stagehand)
│   └── types.js      # JSDoc type definitions
└── store/            # State management
```

## License

MIT
