import React from 'react'
import { motion } from 'framer-motion'
import { Bot, ClipboardCheck, Landmark, ShieldAlert } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'

const ProofStack: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const cards = market === 'india'
    ? [
        {
          icon: <Landmark className="h-5 w-5 text-amber-300" />,
          eyebrow: 'Regulator-grade reality',
          title: 'SEBI already proved the loss problem.',
          body:
            'Most Indian retail F&O traders lose. Shibuya is built for the part nobody fixes well: the repeat leak between one decent read and the next stupid decision.',
        },
        {
          icon: <ClipboardCheck className="h-5 w-5 text-emerald-300" />,
          eyebrow: 'What the product does',
          title: 'It names the leak and gives you a mandate.',
          body:
            'Not journaling. Not mood tracking. You upload history, see the leak in rupees, get a standards ledger, and leave with a next-session protocol.',
        },
        {
          icon: <Bot className="h-5 w-5 text-indigo-300" />,
          eyebrow: 'Why this over generic AI',
          title: 'ChatGPT can comment. Shibuya can control the loop.',
          body:
            'It stores your baseline, compares later uploads, tracks your delivery state, and turns repeated mistakes into an operating system instead of a one-off conversation.',
        },
      ]
    : [
        {
          icon: <Landmark className="h-5 w-5 text-amber-300" />,
          eyebrow: 'Hard truth',
          title: 'Most traders do not have an information problem.',
          body:
            'They have an execution problem that keeps showing up after losses, after fatigue, and near prop breach conditions.',
        },
        {
          icon: <ClipboardCheck className="h-5 w-5 text-emerald-300" />,
          eyebrow: 'What the product does',
          title: 'It separates edge from sabotage.',
          body:
            'You upload history, see the behavioral tax, get a standards ledger, and carry a next-session protocol instead of just another analysis page.',
        },
        {
          icon: <ShieldAlert className="h-5 w-5 text-indigo-300" />,
          eyebrow: 'Why it matters',
          title: 'Good traders still lose command.',
          body:
            'Shibuya is built to catch the process failure before it becomes another breached account, reset spiral, or false confidence streak.',
        },
      ]

  return (
    <section className="border-t border-white/5 bg-[#040405] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-indigo-300">
              Why This Exists
            </p>
            <h2 className="text-3xl font-display font-bold uppercase leading-[0.95] text-white md:text-5xl">
              A harder standard for traders who are done lying to themselves.
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
