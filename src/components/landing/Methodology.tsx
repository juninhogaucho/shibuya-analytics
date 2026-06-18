import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ClipboardList, FileSearch, History, Target } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'

const OPERATING_QUESTIONS = [
  ['Actual edge', 'Which setup still deserves risk?'],
  ['Repeat mistake', 'Which behavior keeps taxing the account?'],
  ['Current state', 'Should the trader press, reduce, or stop?'],
  ['Next action', 'What exactly changes before the next session?'],
  ['Stop now', 'What cannot happen again today?'],
  ['Proof', 'Did the next append show improvement or relapse?'],
]

const Methodology: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  return (
    <section id="methodology" className="border-y border-white/[0.05] bg-[#030304] py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 block font-mono text-xs uppercase tracking-widest text-indigo-400"
          >
            Operating Loop
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-3xl font-display font-bold uppercase text-white md:text-5xl"
          >
            From upload to next action.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg"
          >
            Every surface has to earn its place by answering a trader-operating question. If a feature does not change the next decision or improve the proof trail, it does not belong in the core loop.
          </motion.p>
        </div>

        <div className="mb-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OPERATING_QUESTIONS.map(([label, question], index) => (
            <motion.article
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">
                {label}
              </p>
              <p className="text-base leading-relaxed text-white">{question}</p>
            </motion.article>
          ))}
        </div>

        <div className="mb-20 grid gap-6 md:grid-cols-4">
          <LoopItem
            icon={<FileSearch className="h-6 w-6 text-indigo-300" />}
            title="Baseline"
            desc="Use sample data before payment or live account data after activation. The distinction stays visible."
            delay={0.1}
          />
          <LoopItem
            icon={<ClipboardList className="h-6 w-6 text-emerald-300" />}
            title="Current State"
            desc="Show what the latest history says about edge, repeat mistakes, concentration, and process drift."
            delay={0.2}
          />
          <LoopItem
            icon={<Target className="h-6 w-6 text-amber-300" />}
            title="Next Action"
            desc="Convert the review into a specific next-session mandate instead of a motivational summary."
            delay={0.3}
          />
          <LoopItem
            icon={<History className="h-6 w-6 text-white" />}
            title="Append Proof"
            desc="Append the next session and compare adherence, improvement, relapse, and report artifacts over time."
            delay={0.4}
          />
        </div>

        <Link to={addMarketToPath('/pricing', market)} className="block transform group">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0A0A0B] p-10 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 md:p-14"
          >
            <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-indigo-900/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="absolute right-6 top-4 flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              See offers <ArrowRight className="h-3 w-3" />
            </div>

            <div className="relative z-10 grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h3 className="mb-4 text-2xl font-display font-bold uppercase text-white transition-colors group-hover:text-indigo-100">Different by runtime</h3>
                <p className="mb-6 font-serif text-lg italic text-neutral-400">Sample to inspect. Live to keep score. Reset Pro to review the first real cycle.</p>
                <p className="mb-4 leading-relaxed text-neutral-300">
                  Shibuya should never blur the line between a preview and a paid account. Sample mode teaches the workflow. Live mode owns uploads, history, action board, reports, and guided-review status.
                </p>
                <p className="text-sm leading-relaxed text-neutral-400">
                  That is why the public site now routes the trader through the same product contract the docs describe: sample, checkout, activation, context, upload, action board, append.
                </p>
              </div>
              <div className="h-full min-h-[220px] rounded-xl border border-white/10 bg-black/50 p-6 shadow-xl transition-colors group-hover:border-indigo-500/30">
                <div className="space-y-5">
                  {[
                    ['Sample workspace', 'Evaluation only. No live persistence.'],
                    ['Live trader account', 'Activation, return access, uploads, reports.'],
                    ['Reset Pro', 'Guided review after the first meaningful upload.'],
                  ].map(([label, body]) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-indigo-300">{label}</div>
                      <p className="text-sm text-neutral-400">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  )
}

const LoopItem = ({
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
      whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: '#0F0F10' }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay, duration: 0.5 }}
      className="cursor-default rounded-3xl border border-white/5 bg-[#0A0A0B] p-7 shadow-lg shadow-black/40 transition-all duration-300"
    >
      <div className="mb-6 w-fit rounded-xl border border-white/10 bg-white/5 p-3">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-display font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400">{desc}</p>
    </motion.div>
  )
}

export default Methodology
