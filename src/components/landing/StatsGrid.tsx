import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Crosshair, Flame, TrendingUp, Zap } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { GridPattern } from './Visuals'
import { resolveMarket } from '../../lib/market'

const INDIA_STATS = [
  {
    icon: <Flame className="h-6 w-6 text-rose-500" />,
    title: 'Revenge Trading',
    value: '\u20b911,789',
    metric: 'The "I will make it back"',
    desc: 'One bad loss turns into eleven trades and a much worse day. Shibuya identifies when you force it, what it cost you, and when you should have stopped.',
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-amber-500" />,
    title: 'Risk Skew',
    value: '3.2x',
    metric: 'The overconfidence asymmetry',
    desc: 'You size up when emotional and size down when clear. We show the exact asymmetry so you stop leaking on execution, not just on strategy.',
  },
  {
    icon: <Crosshair className="h-6 w-6 text-emerald-500" />,
    title: 'Setup Decay',
    value: '3 stale patterns',
    metric: 'Edge decay factor',
    desc: 'A favorite setup can keep firing long after its edge is gone. Shibuya surfaces which patterns still pay and which ones are quietly bleeding the account.',
  },
  {
    icon: <Zap className="h-6 w-6 text-cyan-500" />,
    title: 'Action Score',
    value: '69%',
    metric: 'Readiness indicator',
    desc: 'A composite read on how trustworthy your current process is. Not destiny. A signal for whether to press, reduce risk, or stop.',
  },
]

const GLOBAL_STATS = [
  {
    icon: <Flame className="h-6 w-6 text-rose-500" />,
    title: 'Revenge Trading',
    value: 'EUR 847',
    metric: 'The "I will make it back"',
    desc: 'Good traders still torch consistency by trying to reverse one bad sequence immediately. Shibuya makes that leak explicit and expensive.',
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-amber-500" />,
    title: 'Risk Skew',
    value: '3.2x',
    metric: 'Execution asymmetry',
    desc: 'You size up when emotional and size down when clear. The platform quantifies the skew so you can correct it instead of rationalizing it.',
  },
  {
    icon: <Crosshair className="h-6 w-6 text-emerald-500" />,
    title: 'Setup Decay',
    value: '3 stale patterns',
    metric: 'Edge decay factor',
    desc: 'Some setups keep getting traded because they once paid well. Shibuya forces the distinction between current edge and nostalgia.',
  },
  {
    icon: <Zap className="h-6 w-6 text-cyan-500" />,
    title: 'Action Score',
    value: '69%',
    metric: 'Readiness indicator',
    desc: 'A composite read on whether your current process deserves more risk, less risk, or a full stop.',
  },
]

const StatsGrid: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const stats = market === 'india' ? INDIA_STATS : GLOBAL_STATS
  const headlineFigure = market === 'india' ? '\u20b914,000+' : 'EUR 3,418'
  const headlineLabel =
    market === 'india'
      ? 'Illustrative annual avoidable loss from behavioral leakage'
      : 'Illustrative monthly avoidable loss from behavioral leakage'

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
            The Leak
          </motion.span>

          <motion.h2
            className="mb-6 text-4xl font-display font-bold uppercase leading-[0.95] text-white md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {market === 'india' ? 'Why Good Market Reads Still' : 'Why Good Traders Still'}
            <span className="text-neutral-600"> {market === 'india' ? 'Bleed The Account' : 'Blow Good Accounts'}</span>
          </motion.h2>

          <motion.p
            className="mx-auto mb-12 max-w-2xl font-serif text-lg italic text-neutral-400 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {market === 'india'
              ? 'SEBI already proved the loss problem. Shibuya focuses on the behavioral leak that keeps repeating after the indicator, the finfluencer, and the new setup.'
              : 'Most traders do not need another indicator. They need to know which repeat mistake is still taxing the account before it becomes a breach.'}
          </motion.p>

          <motion.div
            className="inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-6xl font-display font-bold leading-none text-white md:text-8xl lg:text-9xl">
              {headlineFigure}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-red-400">
              <TrendingUp className="h-5 w-5" />
              <span className="font-mono text-sm uppercase tracking-wider">{headlineLabel}</span>
            </div>
            <p className="mx-auto mt-4 max-w-md text-sm font-sans text-neutral-500">
              {market === 'india'
                ? 'Not market loss. Process loss. The kind that keeps getting normalized while the trader says the next big day or next finfluencer setup will fix everything.'
                : 'Not market loss. Process loss. The kind that keeps appearing in breached accounts and almost-there traders.'}
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
