import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Filter, TrendingUp } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { resolveMarket } from '../../lib/market'

const Methodology: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  return (
    <section id="methodology" className="py-32 border-y border-white/[0.05] bg-[#030304]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-4 block"
          >
            The Methodology
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold text-white uppercase mb-12"
          >
            Logic Over Luck
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 0.5 },
              opacity: { duration: 0.5 },
            }}
            whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.2)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.1)' }}
            className="inline-block p-6 md:p-10 rounded-full border border-white/10 bg-[#080808] relative cursor-default shadow-lg shadow-black/50"
          >
            <div className="font-mono text-lg md:text-3xl text-neutral-400 tracking-tight whitespace-nowrap overflow-x-auto">
              <span className="text-emerald-400 font-bold">PnL</span> = (<span className="text-indigo-400">Edge</span> + <span className="text-purple-400">Luck</span>) - <span className="text-white border-b-2 border-red-500">Behavior</span>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <BentoItem
            icon={<Filter className="w-6 h-6 text-purple-400" />}
            title="Remove Luck"
            desc="We filter noise so you stop mistaking one lucky streak or one ugly sequence for the whole truth."
            delay={0.1}
          />
          <BentoItem
            icon={<Brain className="w-6 h-6 text-white" />}
            title="Isolate Behavior"
            desc="We identify patterns linked to emotional execution, fatigue, revenge loops, and sizing distortion."
            delay={0.2}
          />
          <BentoItem
            icon={<TrendingUp className="w-6 h-6 text-indigo-400" />}
            title="Reveal Edge"
            desc="What remains is the part of your process worth protecting instead of burying under repeat sabotage."
            delay={0.3}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] md:grid-cols-2"
        >
          <div className="p-8">
            <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-indigo-400">Behavioral State Model</h4>
            <p className="text-sm leading-relaxed text-neutral-300">
              Tracks whether you are trading in control, under pressure, or losing command — across every session, automatically. No self-reporting. No guessing. A hidden Markov model watches the numbers while you watch the charts.
            </p>
          </div>
          <div className="p-8">
            <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-indigo-400">Discipline Tax Engine</h4>
            <p className="text-sm leading-relaxed text-neutral-300">
              {market === 'india'
                ? 'Decomposes your P&L into market conditions, execution quality, and behavioral cost — the rupees you earned and gave back through revenge trades, overtrading, and size violations.'
                : 'Decomposes your P&L into market conditions, execution quality, and behavioral cost — the money you earned and gave back through revenge trades, overtrading, and size violations.'}
            </p>
          </div>
          <div className="p-8">
            <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-indigo-400">Drift Detection</h4>
            <p className="text-sm leading-relaxed text-neutral-300">
              Compares your current performance distribution to your baseline. Detects when edge is decaying, behavior is slipping, or conditions have shifted before you feel it happening.
            </p>
          </div>
          <div className="p-8">
            <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-indigo-400">Proof of Change</h4>
            <p className="text-sm leading-relaxed text-neutral-300">
              Every upload is compared to your baseline. Saved capital, reduced revenge cost, tighter size discipline — quantified across sessions so you can see the trend, not just the last day.
            </p>
          </div>
        </motion.div>

        <Link to="/dashboard" className="block transform group">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6 }}
            className="p-10 md:p-14 rounded-3xl bg-[#0A0A0B] border border-white/5 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-indigo-500/10"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-4 right-6 text-xs font-mono text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
              See Sample Workspace <ArrowRight className="w-3 h-3" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-display font-bold uppercase mb-4 text-white group-hover:text-indigo-100 transition-colors">Different by Design</h3>
                <p className="font-serif text-lg text-neutral-400 italic mb-6">Not another journal. Not another alert layer.</p>
                <p className="text-neutral-300 leading-relaxed mb-4">
                  Most trading tools track what happened or warn that you are near a limit. <span className="text-white font-semibold">Very few tell you why the pattern keeps repeating, quantify the leak clearly, or prescribe the next corrective action.</span>
                </p>
                <p className="text-neutral-400 leading-relaxed mb-6 text-sm">
                  Shibuya keeps the deeper model stack under the hood and turns it into an action board: what is costing you money, what to stop next session, and what part of the process is still worth protecting.
                </p>
              </div>
              <div className="h-full min-h-[200px] border border-white/10 rounded-xl bg-black/50 p-6 flex flex-col justify-center shadow-xl group-hover:border-indigo-500/30 transition-colors">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">
                      <span>Traditional</span>
                      <span>Surface Level</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-600 w-1/3" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-indigo-300 uppercase tracking-widest font-mono mb-1">
                      <span>{market === 'india' ? 'Psych Audit' : 'Shibuya Audit'}</span>
                      <span>Reset Pro</span>
                    </div>
                    <div className="h-1.5 w-full bg-indigo-900/30 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '75%' }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  )
}

const BentoItem = ({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  delay: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: '#0F0F10', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 rounded-3xl bg-[#0A0A0B] border border-white/5 cursor-default transition-all duration-300 group shadow-lg shadow-black/40"
    >
      <div className="mb-6 p-3 w-fit rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm group-hover:text-neutral-300 transition-colors">
        {desc}
      </p>
    </motion.div>
  )
}

export default Methodology
