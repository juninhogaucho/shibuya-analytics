import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calculator, ClipboardCheck, KeyRound, LineChart, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import { METHOD_PROOF_BOUNDARIES, METHOD_PROOF_CARDS } from '../../lib/methodProof'

const proofIcons = [
  <ShieldCheck className="h-5 w-5 text-emerald-300" />,
  <LineChart className="h-5 w-5 text-sky-300" />,
  <ShieldAlert className="h-5 w-5 text-amber-300" />,
]

const ProofStack: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const cards = market === 'india'
    ? [
        {
          icon: <ClipboardCheck className="h-5 w-5 text-emerald-300" />,
          eyebrow: 'Runtime truth',
          title: 'Sample is a preview. Live is the record.',
          body:
            'The sample workspace teaches the loop with sample data. A live trader account starts only after checkout, order-code verification, and password setup.',
        },
        {
          icon: <KeyRound className="h-5 w-5 text-amber-300" />,
          eyebrow: 'Fulfillment path',
          title: 'Pay, activate, set context, upload, append.',
          body:
            'The paid path sends an order code, opens activation, captures trader context, turns broker exports into a mandate, then checks the next session against it.',
        },
        {
          icon: <Calculator className="h-5 w-5 text-indigo-300" />,
          eyebrow: 'Method boundary',
          title: 'Calculation discipline over AI theater.',
          body:
            'Shibuya Direct is for traders. It should never imply magic detection; the story is defensible calculations, trader context, and repeated proof.',
        },
      ]
    : [
        {
          icon: <ClipboardCheck className="h-5 w-5 text-emerald-300" />,
          eyebrow: 'Runtime truth',
          title: 'Sample is a preview. Live is the record.',
          body:
            'The sample workspace teaches the workflow. A live trader account starts only after payment, order-code verification, and password setup.',
        },
        {
          icon: <KeyRound className="h-5 w-5 text-amber-300" />,
          eyebrow: 'Fulfillment path',
          title: 'Activate, set context, upload, append.',
          body:
            'The live loop captures trader type, platform, capital reality, and trading history before it gives a mandate, then checks the next session against it.',
        },
        {
          icon: <ShieldAlert className="h-5 w-5 text-indigo-300" />,
          eyebrow: 'Product boundary',
          title: 'Direct trader OS, not brokerage plumbing.',
          body:
            'You can use Shibuya whether or not your firm uses PropOS. Partner and embedded paths belong on Decrypt/PropOS, not this direct-trader page.',
        },
      ]

  return (
    <section className="border-t border-white/5 bg-[#040405] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-indigo-300">
              What This Is
            </p>
            <h2 className="text-3xl font-display font-bold uppercase leading-[0.95] text-white md:text-5xl">
              From sample workspace to live account without hiding the state boundary.
            </h2>
          </div>

          <Link
            to={addMarketToPath('/pricing', market)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-white/20 hover:bg-white hover:text-black"
          >
            See The Offer Ladder
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="rounded-3xl border border-white/8 bg-[#0A0A0B] p-6 shadow-lg shadow-black/30"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {card.icon}
              </div>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                {card.eyebrow}
              </p>
              <h3 className="mb-4 text-xl font-semibold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{card.body}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.16),transparent_36%),#050506] p-5 shadow-2xl shadow-black/35 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-indigo-300">
                Method proof, not magic
              </p>
              <h3 className="mt-4 max-w-2xl text-3xl font-display font-bold uppercase leading-[0.95] text-white md:text-5xl">
                The public promise now has math underneath it.
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-300 md:text-base">
                Shibuya should not sound like another generic AI trading dashboard. The backend work now gives us a better claim:
                deterministic features, learned scoring, first-passage risk, calibration, and visible limits.
              </p>
              <p className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-xs leading-6 text-amber-50/80">
                Boundary: these are synthetic method-validation numbers from Medallion v2 engines. They prove implementation discipline,
                not real-world accuracy on a live trader or firm book.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {METHOD_PROOF_CARDS.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className="rounded-3xl border border-white/10 bg-black/35 p-5"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    {proofIcons[index] ?? <Calculator className="h-5 w-5 text-indigo-300" />}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                    {card.eyebrow}
                  </p>
                  <h4 className="mt-3 text-lg font-semibold leading-tight text-white">
                    {card.title}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    {card.body}
                  </p>
                  <div className="mt-5 grid gap-2">
                    {card.metrics.map((metric) => (
                      <div key={`${card.title}-${metric.label}`} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                            {metric.label}
                          </span>
                          <span className="font-mono text-sm font-black text-white">
                            {metric.value}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-neutral-400">
                          {metric.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {METHOD_PROOF_BOUNDARIES.map((boundary, index) => (
              <div key={boundary} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">
                  Boundary {index + 1}
                </p>
                <p className="mt-3 text-xs leading-6 text-neutral-300">{boundary}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 text-sm leading-6 text-neutral-300 md:flex-row md:items-center md:justify-between">
            <p>
              Product consequence: the story earns upload, the report asks the private question, and Reset Pro must prove the loop with real history.
            </p>
            <Link
              to={addMarketToPath('/upload', market)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-indigo-100"
            >
              Test The Mirror
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProofStack
