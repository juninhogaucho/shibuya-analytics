import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const solutions = [
  {
    title: 'Reality Check',
    price: 'EUR 99 - 149',
    description: 'One-time baseline for traders who need brutal clarity on edge concentration, discipline leaks, and the next corrective move.',
    features: [
      'Discipline Tax and avoidable-loss breakdown',
      'Edge Portfolio with press / cut / stop guidance',
      'Behavioral state and slump-risk diagnosis',
      'Delivered in 72 hours with concrete next actions',
      'No subscription required',
    ],
    cta: 'Open Pricing',
    link: '/pricing',
    badge: 'Direct Trader',
  },
  {
    title: 'Trader Workspace',
    price: 'Sample now / live after activation',
    description: 'The performance operating system: upload, diagnose, prescribe, append, and improve session by session.',
    features: [
      'Sample workspace for truthful exploration before purchase',
      'Live trader account after direct or partner activation',
      'Trade append, history, alerts, and slump remediation',
      'Session mandate and weekly coach digest',
      'Same runtime whether access came from you or a partner firm',
    ],
    cta: 'Start With Truthful Access',
    link: '/pricing',
    badge: 'Core Product',
  },
  {
    title: 'Embedded Shibuya',
    price: 'Partner pricing',
    description: 'For props, brokers, and tech providers that want trader-facing Shibuya and operator intelligence without forcing a full stack switch on day one.',
    features: [
      'Connector ladder: CSV -> platform -> partner endpoint',
      'Trader acquisition and retention signal',
      'Embedded analytics without replatforming first',
      'Operator-side risk and behavior intelligence',
      'Upgrade path into PropOS when replacement becomes rational',
    ],
    cta: 'Review Partner Path',
    link: '/partners',
    badge: 'Partner',
  },
]

const connectorSteps = [
  {
    title: 'Universal ingestion',
    body: 'CSV, statements, and paste parsing give any serious trader or firm a zero-friction way to start.',
  },
  {
    title: 'Platform connectors',
    body: 'MT5, cTrader, Match-Trader, and similar integrations unlock many firms at once instead of one endpoint at a time.',
  },
  {
    title: 'Partner endpoints',
    body: 'When a prop or broker wants deeper data flow, we add richer account, event, and intervention hooks.',
  },
  {
    title: 'Embedded Shibuya',
    body: 'The intelligence layer lives inside the partner surface, and full PropOS becomes an upgrade path instead of a hard first sell.',
  },
]

const partnerReasons = [
  'Shibuya-supported firms become more attractive to traders who already use the product.',
  'Better feedback loops can increase trader retention and lifetime value.',
  'The same data that helps the trader can later power operator-side risk and behavior intelligence.',
  'Partners can buy embedded value first, then decide later whether full PropOS replacement is worth it.',
]

function badgeClasses(badge: string): string {
  if (badge === 'Direct Trader') {
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  }
  if (badge === 'Core Product') {
    return 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  }
  return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
}

export function SolutionsPage() {
  return (
    <div className="landing min-h-screen bg-[#020204] text-white selection:bg-blue-500/30">
      <section className="landing-section relative overflow-hidden bg-grid-pattern py-24">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#020204]/50 to-[#020204]" />
        <div className="landing-container relative z-10 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Solutions
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              The Shibuya Product Ladder
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-400">
              One mission, three ways in. Start with trader value, then expand into partner distribution and embedded intelligence only when the proof justifies it.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="landing-section pb-24">
        <div className="landing-container mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {solutions.map((solution, index) => (
              <motion.article
                key={solution.title}
                className="glass-panel relative rounded-2xl border border-white/10 bg-[#0A0A0F] p-8 transition-all hover:border-blue-500/30"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(59, 130, 246, 0.12)' }}
              >
                <div className="mb-8 mt-2 text-center">
                  <div className="mb-5">
                    <span className={`rounded-full border px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClasses(solution.badge)}`}>
                      {solution.badge}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{solution.title}</h3>
                  <div className="mb-4 text-3xl font-bold text-white">{solution.price}</div>
                  <p className="text-sm leading-relaxed text-gray-400">{solution.description}</p>
                </div>

                <ul className="mb-8 space-y-4 border-t border-white/5 pt-8">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="mt-0.5 text-blue-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={solution.link}
                  className="block w-full rounded-full border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
                >
                  {solution.cta}
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#050508] py-24" id="partner-model">
        <div className="landing-container mx-auto max-w-6xl px-6">
          <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-white">How Shibuya Reaches Traders</h2>
          <p className="mx-auto mb-16 max-w-3xl text-center text-gray-400">
            Shibuya should not depend on one custom endpoint per firm as the default scaling model. The correct path is a connector ladder that starts universal and gets deeper only where the data or economics justify it.
          </p>

          <div className="grid gap-6 md:grid-cols-4">
            {connectorSteps.map((step, index) => (
              <motion.article
                key={step.title}
                className="glass-panel rounded-2xl border border-white/10 bg-[#0A0A0F] p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{step.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#020204] py-24">
        <div className="landing-container mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-white">Who This Is For</h2>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              className="rounded-2xl border border-green-500/10 bg-green-500/5 p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Right fit
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3"><span className="mt-1 text-green-500">✓</span><span>You want to know where your real edge lives.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-green-500">✓</span><span>You keep repeating mistakes between good trades and want that loop broken.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-green-500">✓</span><span>You want a performance operating system, not another journal with prettier charts.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-green-500">✓</span><span>You are serious enough to upload data and act on what the system tells you.</span></li>
              </ul>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-red-500/10 bg-red-500/5 p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                Wrong fit
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3"><span className="mt-1 text-red-500">✕</span><span>You want trade signals or a bot to replace judgment.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-red-500">✕</span><span>You want partner-grade intelligence without sharing usable data.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-red-500">✕</span><span>You are looking for a generic AI summary that could be replaced by a chat box.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-red-500">✕</span><span>You want instant absolution without changing process.</span></li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="landing-section bg-[#050508] py-24">
        <div className="landing-container mx-auto max-w-5xl px-6">
          <div className="glass-panel rounded-3xl border border-white/10 bg-[#0A0A0F] p-10">
            <h2 className="mb-6 text-center text-3xl font-bold text-white">Why firms integrate before they switch stacks</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {partnerReasons.map((reason, index) => (
                <motion.article
                  key={reason}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-blue-400">Partner value {index + 1}</div>
                  <p className="text-sm leading-relaxed text-gray-300">{reason}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section py-24 text-center">
        <div className="landing-container mx-auto max-w-3xl px-6">
          <h2 className="mb-6 text-3xl font-bold text-white">Start with the truthful entry point</h2>
          <p className="mb-8 text-gray-400">
            Direct traders should start with pricing and activation. Technology providers, props, and brokers should start with the partner path, prove the connector, then expand into embedded Shibuya or PropOS only when the economics are real.
          </p>
          <Link to="/partners" className="landing-btn landing-btn--primary px-8 py-3">
            Open Partner Path
          </Link>
        </div>
      </section>
    </div>
  )
}
