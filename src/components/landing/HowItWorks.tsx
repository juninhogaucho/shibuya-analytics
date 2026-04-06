import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { resolveMarket } from '../../lib/market'

const HowItWorks: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const steps =
    market === 'india'
      ? [
          {
            title: 'Import Your History',
            desc: 'Export trades from Zerodha, Dhan, Angel One, Upstox, FYERS, MT5, or your prop portal. This is built for fast upload, not another journaling ritual.',
          },
          {
            title: 'See The Leak In Rupees',
            desc: 'Shibuya separates edge decay from behavioral leakage, quantifies discipline tax, and shows the exact pattern that keeps taxing the account.',
          },
          {
            title: 'Carry The Reset Forward',
            desc: 'Use a 30-day reset window if you want a one-time intervention, or keep the same workspace live monthly if you want continuity.',
          },
        ]
      : [
          {
            title: 'Import Your History',
            desc: 'Export trades from MT4, MT5, cTrader, TradingView, or your broker. No funds access required.',
          },
          {
            title: 'Separate Edge From Sabotage',
            desc: 'The system shows which losses came from weak setups, which came from behavioral leakage, and which state kept showing up before the damage.',
          },
          {
            title: 'Keep The Loop Live',
            desc: 'Your workspace stays live after activation so alerts, history, and next-session mandates update with the process you are actually running.',
          },
        ]

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 md:py-40">
      <div className="mb-20 text-center md:text-left">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-3xl font-display font-bold uppercase text-white md:text-5xl"
        >
          Three steps from guesswork to a next-session mandate.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-xl italic text-neutral-400"
        >
          {market === 'india'
            ? 'Upload history. See the leak in rupees. Choose between a one-time reset window and a monthly live loop depending on how much continuity you need.'
            : 'Upload history. Separate edge from sabotage. Use a persistent workspace that keeps the loop alive session by session.'}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ staggerChildren: 0.2 }}
        className="mb-24 grid gap-8 md:grid-cols-3"
      >
        {steps.map((step, index) => (
          <Step key={step.title} index={index} title={step.title} desc={step.desc} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="border-t border-white/5 pt-12"
      >
        <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          Works with exports from
        </p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
          {(market === 'india'
            ? ['Zerodha', 'Dhan', 'Angel One', 'Upstox', 'FYERS', 'MetaTrader 5']
            : ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView', 'NinjaTrader']
          ).map((platform, index) => (
            <motion.span
              key={platform}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="cursor-default font-display text-lg font-bold tracking-wide text-white transition-colors hover:text-indigo-300"
            >
              {platform}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

const Step = ({ title, desc, index }: { title: string; desc: string; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      whileHover={{ y: -10, backgroundColor: '#0A0A0B', borderColor: 'rgba(255,255,255,0.1)' }}
      className="group cursor-default rounded-3xl border border-transparent p-8 transition-all duration-300 hover:border-white/5"
    >
      <h3 className="mb-4 text-2xl font-bold text-white transition-colors group-hover:text-indigo-400">{title}</h3>
      <p className="font-serif text-lg italic leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300">{desc}</p>
    </motion.div>
  )
}

export default HowItWorks
