import React from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, ArrowUpRight, Brain, Flame, Target, Shield } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { resolveMarket } from '../../lib/market'

const MetricPreview = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  variant = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  trend?: 'up' | 'down'
  trendLabel?: string
  variant?: 'default' | 'danger' | 'success' | 'primary'
}) => {
  const variantStyles = {
    default: 'border-white/5 hover:border-white/20',
    danger: 'border-red-500/20 hover:border-red-500/40',
    success: 'border-emerald-500/20 hover:border-emerald-500/40',
    primary: 'border-indigo-500/20 hover:border-indigo-500/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/5',
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`rounded-2xl border bg-[#0A0A0F] p-5 transition-all duration-300 ${variantStyles[variant]}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-lg bg-white/5 p-2">
          <Icon className="h-4 w-4 text-white/60" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</span>
      </div>
      <div className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">{value}</div>
      {trendLabel && (
        <div className={`flex items-center gap-1.5 text-xs ${trend === 'down' ? 'text-red-400' : 'text-emerald-400'}`}>
          {trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </motion.div>
  )
}

const DashboardPreview: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  return (
    <section className="relative overflow-hidden bg-[#020203] py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]" />
        <div className="absolute inset-0 bg-[#020203]/60" />
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="neural-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.5" fill="rgba(99, 102, 241, 0.5)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2"
          >
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-400">Inside the Engine</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-display font-bold uppercase text-white md:text-6xl"
          >
            Execution you cannot rationalize away.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-neutral-400"
          >
            Not a prettier journal. A control surface that turns mistakes, standards, and recovery protocols into something you can actually act on.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0B]/90 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 bg-black/30 px-6 py-4">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-xs text-neutral-500">shibuya-analytics.com/dashboard</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricPreview
                icon={Flame}
                label="Discipline Tax"
                value={market === 'india' ? '-\u20b98,470' : '-EUR 640'}
                trend="down"
                trendLabel="+12% vs last month"
                variant="danger"
              />
              <MetricPreview
                icon={Target}
                label="Edge Score"
                value="72/100"
                trend="up"
                trendLabel="Top 15%"
                variant="success"
              />
              <MetricPreview
                icon={Shield}
                label="Ruin Probability"
                value="4.2%"
                trend="down"
                trendLabel="Low risk"
                variant="default"
              />
              <MetricPreview
                icon={Brain}
                label="BQL Score"
                value="68"
                trendLabel="Stable"
                variant="primary"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/5 bg-[#080809] p-6 md:col-span-2"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 font-medium text-white">Potential Equity Without Unforced Errors</h4>
                    <p className="text-sm text-neutral-500">What the account would look like with tighter execution</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">
                      {market === 'india' ? '+\u20b925,280' : '+EUR 1,920'}
                    </span>
                    <span className="block text-xs text-neutral-500">unrealized</span>
                  </div>
                </div>

                <div className="relative h-32">
                  <svg className="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <motion.path
                      d="M0,80 Q50,75 100,60 T200,55 T300,65 T400,50"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                    <motion.path
                      d="M0,70 Q50,55 100,40 T200,30 T300,25 T400,15"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                    />
                    <motion.path
                      d="M0,80 Q50,75 100,60 T200,55 T300,65 T400,50 L400,15 Q350,25 300,25 T200,30 T100,40 Q50,55 0,70 Z"
                      fill="url(#gradient-fill)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between font-mono text-[10px] text-neutral-600">
                    <span>30d ago</span>
                    <span>Today</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-0.5 w-3 bg-white/30" />
                      <span className="text-neutral-500">Actual</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-0.5 w-3 bg-indigo-500" />
                      <span className="text-neutral-500">Without errors</span>
                    </span>
                  </div>
                  <span className="text-xs font-medium text-indigo-400">+18% difference</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#080809] p-6 text-center"
              >
                <div className="relative mb-4 h-28 w-28">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="#1a1a2e" strokeWidth="8" fill="none" />
                    <motion.circle
                      initial={{ strokeDashoffset: 314 }}
                      whileInView={{ strokeDashoffset: 88 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="#6366f1"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="314"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-3xl font-bold text-white"
                    >
                      72
                    </motion.span>
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-400">Good</span>
                  </div>
                </div>
                <h4 className="mb-1 text-sm font-medium text-white">Psych Score</h4>
                <p className="text-xs text-neutral-500">Top 15% of users</p>
                <div className="mt-3 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                  Up 8 pts from last month
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm italic text-neutral-500"
        >
          Sample dashboard preview. Your standards. Your leaks. Your path to a tighter operating process.
        </motion.p>
      </div>
    </section>
  )
}

export default DashboardPreview
