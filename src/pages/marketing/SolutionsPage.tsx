import { motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'

const productSurfaces = [
  {
    title: 'Psych Audit',
    summary: 'The baseline that tells you whether the real problem is edge, behavior, or the state you keep entering before you self-sabotage.',
    bullets: [
      'Discipline tax in real money',
      'Behavioral leak diagnosis',
      'Edge concentration and weak-zone mapping',
      'First next-session mandate',
    ],
  },
  {
    title: 'Reset Layer',
    summary: 'The premium reset track for traders who already know they are stuck in a loop and need either a harder one-time intervention or a deeper live monthly tier.',
    bullets: [
      'Everything in Psych Audit',
      'Reset Intensive for a guided one-time reset window',
      'Reset Pro Live for deeper monthly continuity',
      'Built for repeat breach and relapse recovery',
    ],
  },
  {
    title: 'Live Workspace',
    summary: 'The system you use after activation: upload, inspect the leak, carry the mandate forward, and see whether the fix actually held.',
    bullets: [
      'Upload and append trade history',
      'History, alerts, and slump diagnosis',
      'Persistent trader runtime after activation',
      'Sample mode for evaluation before purchase',
    ],
  },
]

const differentiation = [
  {
    title: 'Not just risk alerts',
    body: 'Risk tools can tell you that you are near a limit. Shibuya is built to show why you keep getting there in the first place.',
  },
  {
    title: 'Not just a journal',
    body: 'A trade journal tells you what happened. Shibuya turns the pattern into a concrete mandate for the next session.',
  },
  {
    title: 'Not just prettier analytics',
    body: 'The point is not more charts. The point is to know what to stop, what to press, and whether your leak is behavioral or structural.',
  },
]

export function SolutionsPage() {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  return (
    <div className="min-h-screen bg-[#020204] text-white selection:bg-blue-500/30">
      <section className="relative overflow-hidden bg-grid-pattern py-24">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#020204]/50 to-[#020204]" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Direct Trader Product
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              The Shibuya Trader Loop
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-400">
              Shibuya exists to answer three questions brutally fast: is this an edge problem or a behavior problem, how much is the leak costing, and what changes next session.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {productSurfaces.map((surface, index) => (
            <motion.article
              key={surface.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-white/5 bg-[#0A0A0B] p-8"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Surface 0{index + 1}</p>
              <h2 className="text-2xl font-semibold text-white">{surface.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">{surface.summary}</p>
              <div className="mt-6 space-y-3">
                {surface.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-neutral-300">
                    {bullet}
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#060607] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Why it matters</p>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-white">
              The product is not the dashboard. The product is the next decision.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {differentiation.map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/5 bg-[#0A0A0B] p-6">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Get started</p>
          <h2 className="max-w-3xl text-4xl font-bold uppercase tracking-tight text-white">
            Start in the sample workspace if you want to inspect the loop first. Start with pricing if you are ready to fix it for real.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={addMarketToPath('/pricing', market)}
              className="rounded-xl bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:bg-indigo-200"
            >
              Open Pricing
            </Link>
            <Link
              to={addMarketToPath('/login', market)}
              className="rounded-xl border border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black"
            >
              Sign In Or Activate
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
