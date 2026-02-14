'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useProductStore from '@/store/useProductStore';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
});
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const stepFade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Daisy logo                                                         */
/* ------------------------------------------------------------------ */
function DaisyLogo({ size = 28 }) {
  const r = size / 2;
  const petalRx = r * 0.34;
  const petalRy = r * 0.58;
  const petalDist = r * 0.42;
  const petals = 6;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i * 360) / petals;
        return (
          <ellipse
            key={i}
            cx={r}
            cy={r - petalDist}
            rx={petalRx}
            ry={petalRy}
            fill="white"
            opacity={0.92}
            transform={`rotate(${angle} ${r} ${r})`}
          />
        );
      })}
      <circle cx={r} cy={r} r={r * 0.28} fill="#facc15" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Pill Navbar                                                        */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: 'Product', id: 'product' },
  { label: 'Solutions', id: 'solutions' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Docs', id: 'docs' },
  { label: 'Blog', id: 'blog' },
];

function PillNav({ onEnter }) {
  const [active, setActive] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-5 inset-x-0 mx-auto w-fit z-50 flex items-center gap-1.5 bg-white/50 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/[0.03] rounded-full px-3 py-2"
    >
      {/* Logo */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 pl-1 pr-3">
        <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center">
          <DaisyLogo size={22} />
        </div>
        <span className="text-[15px] font-semibold text-gray-900">Daisy</span>
      </button>

      <div className="w-px h-5 bg-gray-200/60" />

      {/* Links */}
      {NAV_LINKS.map((link) => (
        <button
          key={link.id}
          onClick={() => scrollTo(link.id)}
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
            active === link.id
              ? 'bg-white/70 text-gray-900'
              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          {link.label}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200/60" />

      {/* CTA */}
      <button
        onClick={onEnter}
        className="px-5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-full text-[13px] font-medium transition-colors ml-0.5"
      >
        Open App
      </button>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const enterApp = useProductStore((s) => s.enterApp);
  const loadSampleData = useProductStore((s) => s.loadSampleData);

  return (
    <div className="min-h-screen bg-white">
      <PillNav onEnter={enterApp} />

      {/* ====== HERO ====== */}
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div {...fadeUp(0.15)}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[12px] font-medium border border-brand-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Now in public beta
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.25)}
          className="text-[52px] leading-[1.08] font-semibold text-gray-900 tracking-tight mb-5"
        >
          Accelerate your
          <br />
          product <span className="text-brand-700">productivity</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.35)}
          className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
        >
          AI made engineering 10x faster. Product management is still stuck in
          docs and spreadsheets. Daisy closes the gap — turning customer feedback
          into shipped features, automatically.
        </motion.p>

        <motion.div {...fadeUp(0.45)} className="flex items-center justify-center gap-3">
          <button
            onClick={enterApp}
            className="px-7 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-full text-[14px] font-medium transition-colors shadow-sm"
          >
            Get Started Free
          </button>
          <button
            onClick={() => { loadSampleData(); enterApp(); }}
            className="px-7 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full text-[14px] font-medium transition-colors"
          >
            Live Demo
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p {...fadeUp(0.55)} className="mt-10 text-[12px] text-gray-300">
          Trusted by product teams at early-stage and growth startups
        </motion.p>
      </section>

      {/* ====== PRODUCT — How it works ====== */}
      <section id="product" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-80px' }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={stepFade} className="text-[12px] font-semibold text-brand-600 uppercase tracking-wider mb-2">How it works</motion.p>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              From raw feedback to shipped features
            </motion.h2>
            <motion.p variants={stepFade} className="text-[15px] text-gray-500 max-w-lg mx-auto leading-relaxed">
              Four steps. No spreadsheets. No guesswork.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-4 gap-4"
          >
            {[
              { n: '01', title: 'Upload', desc: 'Paste interview transcripts, support tickets, NPS surveys, or any customer data.', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
              { n: '02', title: 'Analyze', desc: 'AI identifies pain points, feature requests, praise, and confusion patterns.', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' },
              { n: '03', title: 'Prioritize', desc: 'Ranked feature recommendations backed by real evidence and customer quotes.', icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5' },
              { n: '04', title: 'Ship', desc: 'Generate specs and dev tasks ready to paste into Cursor or Claude Code.', icon: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
            ].map((s) => (
              <motion.div key={s.n} variants={stepFade} className="bg-white border border-gray-200 rounded-xl p-5 relative">
                <span className="text-[11px] font-bold text-brand-400 mb-3 block">{s.n}</span>
                <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                </div>
                <h3 className="text-[14px] font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== SOLUTIONS — Who it's for ====== */}
      <section id="solutions" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-80px' }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={stepFade} className="text-[12px] font-semibold text-brand-600 uppercase tracking-wider mb-2">Solutions</motion.p>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              Built for teams that ship
            </motion.h2>
            <motion.p variants={stepFade} className="text-[15px] text-gray-500 max-w-lg mx-auto leading-relaxed">
              Whether you&apos;re a founder, PM, or engineering lead — Daisy meets you where you are.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
            variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-3 gap-5"
          >
            {[
              { role: 'Founders', desc: 'Stop spending weekends in spreadsheets. Upload your user interviews and get a clear roadmap in minutes, not weeks.', highlight: 'Save 10+ hours per sprint' },
              { role: 'Product Managers', desc: 'Turn qualitative feedback into quantitative priorities. Every recommendation is backed by customer evidence you can cite in your PRD.', highlight: 'Evidence-backed PRDs' },
              { role: 'Engineering Leads', desc: 'Get feature specs and task breakdowns that your team (or AI agent) can start building immediately. No more ambiguous tickets.', highlight: 'Agent-ready dev tasks' },
            ].map((item) => (
              <motion.div key={item.role} variants={stepFade} className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{item.role}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-block px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-medium border border-brand-100">
                  {item.highlight}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== Coding got fast ====== */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              Coding got fast. Product didn&apos;t.
            </motion.h2>
            <motion.p variants={stepFade} className="text-[15px] text-gray-500 max-w-lg mx-auto leading-relaxed mb-12">
              Teams use Cursor and Claude to ship code in hours. But figuring out{' '}
              <em>what</em> to build still takes weeks. Daisy is the missing piece.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
            variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-3 gap-6"
          >
            {[
              { num: '10x', label: 'Faster insight extraction' },
              { num: '< 5 min', label: 'Raw data to dev tasks' },
              { num: '100%', label: 'Evidence-backed decisions' },
            ].map((s) => (
              <motion.div key={s.label} variants={stepFade}>
                <p className="text-4xl font-semibold text-brand-700 mb-1">{s.num}</p>
                <p className="text-[13px] text-gray-400">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-80px' }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={stepFade} className="text-[12px] font-semibold text-brand-600 uppercase tracking-wider mb-2">Pricing</motion.p>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={stepFade} className="text-[15px] text-gray-500 max-w-md mx-auto">
              Start free. Scale when you&apos;re ready.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
            variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-3 gap-5 max-w-3xl mx-auto"
          >
            {[
              { plan: 'Starter', price: 'Free', period: '', desc: 'For founders and small teams getting started.', features: ['5 data sources', 'Insight extraction', 'Feature recommendations', 'Community support'], cta: 'Get Started', primary: false },
              { plan: 'Pro', price: '$49', period: '/mo', desc: 'For product teams shipping every week.', features: ['Unlimited sources', 'Spec generation', 'Dev task breakdown', 'Agent-ready prompts', 'Priority support'], cta: 'Start Free Trial', primary: true },
              { plan: 'Enterprise', price: 'Custom', period: '', desc: 'For organizations with advanced needs.', features: ['Everything in Pro', 'SSO & SAML', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee'], cta: 'Contact Sales', primary: false },
            ].map((plan) => (
              <motion.div
                key={plan.plan}
                variants={stepFade}
                className={`rounded-xl p-6 ${plan.primary ? 'bg-brand-700 text-white ring-2 ring-brand-700 shadow-lg shadow-brand-700/10' : 'bg-white border border-gray-200'}`}
              >
                <p className={`text-[13px] font-semibold mb-1 ${plan.primary ? 'text-brand-200' : 'text-brand-600'}`}>{plan.plan}</p>
                <div className="flex items-baseline gap-0.5 mb-2">
                  <span className={`text-3xl font-semibold ${plan.primary ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  {plan.period && <span className={`text-[13px] ${plan.primary ? 'text-brand-200' : 'text-gray-400'}`}>{plan.period}</span>}
                </div>
                <p className={`text-[12px] mb-5 ${plan.primary ? 'text-brand-200' : 'text-gray-400'}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-[12px] flex items-center gap-2 ${plan.primary ? 'text-brand-100' : 'text-gray-600'}`}>
                      <svg className={`w-3.5 h-3.5 shrink-0 ${plan.primary ? 'text-brand-300' : 'text-brand-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={enterApp}
                  className={`w-full py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    plan.primary
                      ? 'bg-white text-brand-700 hover:bg-brand-50'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== DOCS / BLOG teasers ====== */}
      <section id="docs" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-80px' }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={stepFade} className="text-[12px] font-semibold text-brand-600 uppercase tracking-wider mb-2">Resources</motion.p>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              Learn &amp; get started
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}
            variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-3 gap-5"
          >
            {[
              { tag: 'Guide', title: 'Getting started with Daisy', desc: 'Upload your first data source and generate insights in under 5 minutes.' },
              { tag: 'Blog', title: 'Why product management needs AI now', desc: 'Engineering productivity exploded. Here\'s how product teams can catch up.' },
              { tag: 'Docs', title: 'Integrating with your coding agent', desc: 'Copy agent-ready prompts directly into Cursor, Claude Code, or Copilot.' },
            ].map((item) => (
              <motion.div key={item.title} variants={stepFade} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">{item.tag}</span>
                <h3 className="text-[14px] font-semibold text-gray-800 mt-2 mb-1">{item.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== BLOG extra anchor ====== */}
      <div id="blog" />

      {/* ====== FINAL CTA ====== */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            <motion.h2 variants={stepFade} className="text-3xl font-semibold text-gray-900 mb-3">
              Stop guessing what to build.
            </motion.h2>
            <motion.p variants={stepFade} className="text-[15px] text-gray-500 mb-8 max-w-md mx-auto">
              Your customers are already telling you. Daisy helps you listen,
              prioritize, and ship — all in one place.
            </motion.p>
            <motion.div variants={stepFade} className="flex items-center justify-center gap-3">
              <button
                onClick={enterApp}
                className="px-7 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-full text-[14px] font-medium transition-colors shadow-sm"
              >
                Get Started — Free
              </button>
              <button
                onClick={() => { loadSampleData(); enterApp(); }}
                className="px-7 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full text-[14px] font-medium transition-colors"
              >
                Try Live Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8 mb-10">
            {/* Brand col */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center">
                  <DaisyLogo size={18} />
                </div>
                <span className="text-[14px] font-semibold text-gray-900">Daisy</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                AI-native product management. Figure out what to build, not just how.
              </p>
            </div>
            {/* Link cols */}
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { heading: 'Resources', links: ['Documentation', 'Blog', 'Guides', 'API Reference'] },
              { heading: 'Company', links: ['About', 'Careers', 'Contact', 'Legal'] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{col.heading}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-[13px] text-gray-500 hover:text-gray-800 cursor-pointer transition-colors">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
            <p className="text-[12px] text-gray-300">&copy; 2025 Daisy. All rights reserved.</p>
            <p className="text-[12px] text-gray-300">Built at TreeHacks 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
