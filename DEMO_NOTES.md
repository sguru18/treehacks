# Demo Notes for Judges

## Quick Reference

### Prize Alignment

1. **Perplexity Sonar** ✅
   - Every research call uses Sonar API
   - Citations shown in debate tree
   - Deep reasoning for final verdict

2. **Best Agent Reasoning** ✅
   - Judge agent: 5-step pipeline
   - Evaluate → Demand Evidence → Sonar Verify → Stagehand Validate → Synthesize
   - Reasoning visible in tree

3. **Stagehand/Browserbase** ✅
   - Judge triggers Stagehand for validation
   - Scrapes Product Hunt, GitHub, competitor sites
   - Results shown in debate nodes

4. **Best AI Web Data Hack** ✅
   - Sonar (structured research) + Stagehand (live scraping)
   - Every claim backed by web data
   - Citations aggregated in final report

5. **Vercel** ✅
   - Deployed on Vercel
   - Streaming with SSE
   - Edge runtime where possible
   - Production-ready

## Architecture Highlights

- **Frontend**: Next.js 14 App Router, React Flow, Tailwind
- **Backend**: Next.js API routes, streaming with SSE
- **Agents**: OpenAI GPT-4o for debate, Perplexity Sonar for research
- **Automation**: Stagehand + Browserbase for web scraping
- **State**: In-memory (hackathon), easily upgradeable to DB

## Code Locations

- Agents: `lib/agents/`
- Research: `lib/research/`
- API Routes: `app/api/`
- UI Components: `components/`
- Debate Tree: `components/debate-tree/`

## Environment Variables Needed

- OPENAI_API_KEY
- PERPLEXITY_API_KEY
- BROWSERBASE_API_KEY
- STAGEHAND_API_KEY

## Potential Questions

**Q: How does the multi-step reasoning work?**
A: Judge agent runs a 5-step pipeline: (1) evaluates claim quality, (2) identifies vague claims, (3) triggers Sonar research, (4) triggers Stagehand scraping, (5) synthesizes verdict. Each step is logged and visible.

**Q: How do you handle rate limits?**
A: We catch errors gracefully and show fallback results. In production, we'd add caching and rate limit handling.

**Q: Can you fork multiple times?**
A: Yes! Each fork creates a new branch. You can explore multiple directions simultaneously.

**Q: How is this different from just asking ChatGPT?**
A: Three agents debate each other, real-time research validates claims, visual tree shows the flow, and you can fork to explore alternatives.
