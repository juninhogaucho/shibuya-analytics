import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Crosshair, Flame, TrendingUp, Zap } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { GridPattern } from './Visuals'
import { resolveMarket } from '../../lib/market'

const INDIA_STATS = [
  {
    icon: <Flame className="h-6 w-6 text-rose-500" />,
    title: 'Actual Edge',
    value: '01',
    metric: 'What still pays',
    desc: 'Separate the setup that still deserves protection from the setup that only feels familiar because it used to work.',
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-amber-500" />,
    title: 'Repeat Leak',
    value: '02',
    metric: 'What keeps taxing the account',
    desc: 'Name the recurring process mistake, estimate its damage from the available history, and turn it into a rule for the next session.',
  },
  {
    icon: <Crosshair className="h-6 w-6 text-emerald-500" />,
    title: 'Current State',
    value: '03',
    metric: 'Press, reduce, or stop',
    desc: 'Frame the trader state before size goes back on. The output is a guardrail, not a promise about the next trade.',
  },
  {
    icon: <Zap className="h-6 w-6 text-cyan-500" />,
    title: 'Append Proof',
    value: '04',
    metric: 'Did the process change',
    desc: 'Append the next session and compare the mandate against what actually happened. Improvement has to show up in the record.',
  },
]

const GLOBAL_STATS = [
  {
    icon: <Flame className="h-6 w-6 text-rose-500" />,
    title: 'Actual Edge',
    value: '01',
    metric: 'What still pays',
    desc: 'Separate the setup that still deserves protection from the setup that only feels familiar because it used to work.',
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-amber-500" />,
    title: 'Repeat Leak',
    value: '02',
    metric: 'What keeps taxing the account',
    desc: 'Name the recurring process mistake, estimate its damage from the available history, and turn it into a rule for the next session.',
  },
  {
    icon: <Crosshair className="h-6 w-6 text-emerald-500" />,
    title: 'Current State',
    value: '03',
    metric: 'Press, reduce, or stop',
    desc: 'Frame the trader state before size goes back on. The output is a guardrail, not a promise about the next trade.',
  },
  {
    icon: <Zap className="h-6 w-6 text-cyan-500" />,
    title: 'Append Proof',
    value: '04',
    metric: 'Did the process change',
    desc: 'Append the next session and compare the mandate against what actually happened. Improvement has to show up in the record.',
  },
]

const StatsGrid: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const stats = market === 'india' ? INDIA_STATS : GLOBAL_STATS
  const headlineFigure = '6'
  const headlineLabel = 'Operating questions every useful review must answer'

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-24 md:py-32 lg:py-40">
      <div className="absolute inset-0 opacity-5">
        <GridPattern />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="mb-16 text-center md:mb-20 lg:mb-24">
          <motion.span
            className="mb-6 block font-mono text-xs uppercase tracking-widest text-indigo-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The Pattern
          </motion.span>

          <motion.h2
            className="mb-6 text-4xl font-display font-bold uppercase leading-[0.95] text-white md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {market === 'india' ? 'The Work Is Not More Signals.' : 'The Work Is Not More Signals.'}
            <span className="text-neutral-600"> It Is Better Process.</span>
          </motion.h2>

          <motion.p
            className="mx-auto mb-12 max-w-2xl font-serif text-lg italic text-neutral-400 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {market === 'india'
              ? 'Indian F&O traders do not need another confident chart screenshot. They need a private loop that answers what is working, what is leaking, and what must change before the next session.'
              : 'Most traders do not need another confident chart screenshot. They need a private loop that answers what is working, what is leaking, and what must change before the next session.'}
          </motion.p>

          <motion.div
            className="inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-6xl font-display font-bold leading-none text-white md:text-8xl lg:text-9xl">
              {headlineFigure} Questions
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-red-400">
              <TrendingUp className="h-5 w-5" />
              <span className="font-mono text-sm uppercase tracking-wider">{headlineLabel}</span>
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm font-sans text-neutral-500">
              Actual edge. Repeat mistake. Current state. Next action. Immediate stop. Evidence of improvement.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} index={index} icon={stat.icon} title={stat.title} value={stat.value} metric={stat.metric} desc={stat.desc} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  metric: string
  desc: string
  index: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, metric, desc, index }) => {
  return (
    <SpotlightCard index={index}>
      <div className="flex h-full flex-col p-8 md:p-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-colors group-hover:bg-white/10">
            {icon}
          </div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white transition-colors group-hover:text-indigo-200 md:text-xl">
            {title}
          </h3>
        </div>

        <div className="mb-2">
          <span className="font-mono text-5xl font-medium tracking-tight text-white md:text-6xl">{value}</span>
        </div>
        <span className="mb-6 font-mono text-xs uppercase tracking-widest text-neutral-500">{metric}</span>

        <p className="mt-auto font-serif text-base italic leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300 md:text-lg">
          {desc}
        </p>
      </div>
    </SpotlightCard>
  )
}

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  index?: number
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '', index = 0 }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) {
      return
    }

    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: '-10%', once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0B] transition-all duration-300 md:rounded-3xl ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

export default StatsGrid
