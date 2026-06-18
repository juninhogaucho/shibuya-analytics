import React from 'react'
import { motion } from 'framer-motion'
import { Calculator, ClipboardCheck, KeyRound, ShieldAlert } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'

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
      </div>
    </section>
  )
}

export default ProofStack
