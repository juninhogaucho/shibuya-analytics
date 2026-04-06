import React from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, getPlanForMarket, resolveMarket } from '../../lib/market'
import { enterSampleMode } from '../../lib/runtime'

const RevealText = ({
  text,
  className = '',
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) => {
  const words = text.split(' ')

  const wordPositions = words.reduce<number[]>((acc, _, index) => {
    const previousPosition = index === 0 ? 0 : acc[index - 1] + words[index - 1].length
    acc.push(previousPosition)
    return acc
  }, [])

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-0 ${className}`}>
      {words.map((word, wordIndex) => {
        const currentWordStart = wordPositions[wordIndex]
        return (
          <span key={`${word}-${wordIndex}`} className="inline-flex overflow-hidden">
            {word.split('').map((character, characterIndex) => (
              <span key={`${character}-${characterIndex}`} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: delay + (currentWordStart + characterIndex) * 0.03,
                  }}
                  className="inline-block"
                >
                  {character}
                </motion.span>
              </span>
            ))}
          </span>
        )
      })}
    </span>
  )
}

const INDIA_METRICS = [
  { label: 'REVENGE TRADING', value: '64% | \u20b911,789' },
  { label: 'SIZE VIOLATION', value: '28% | \u20b95,153' },
  { label: 'HESITATION', value: '8% | \u20b91,478' },
]

const GLOBAL_METRICS = [
  { label: 'REVENGE TRADING', value: '64% | EUR 795' },
  { label: 'SIZE VIOLATION', value: '28% | EUR 347' },
  { label: 'HESITATION', value: '8% | EUR 98' },
]

const Hero: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const metrics = market === 'india' ? INDIA_METRICS : GLOBAL_METRICS
  const auditPlan = getPlanForMarket(market, 'audit_once')
  const resetPlan = getPlanForMarket(market, 'reset_once')

  const openSampleWorkspace = () => {
    enterSampleMode()
    navigate('/dashboard')
  }

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-white/5 bg-[#050505] px-6 pb-12 pt-32 text-[#e5e5e5] md:px-12">
      <div className="pointer-events-none absolute right-0 top-0 h-[50vw] w-[50vw] rounded-full bg-white/[0.03] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[30vw] w-[30vw] rounded-full bg-indigo-900/10 blur-[120px]" />

      <div className="mx-auto mt-0 grid max-w-[1920px] grid-cols-1 gap-12 md:mt-12 lg:grid-cols-12">
        <div className="flex flex-col justify-center lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 font-mono text-xs uppercase tracking-widest text-indigo-400"
          >
            {market === 'india' ? 'India Trader Performance OS' : 'Trader Performance OS'}
          </motion.p>

          <h1 className="mb-8 flex flex-col text-left font-display text-[clamp(2.5rem,8vw,8rem)] font-bold leading-[0.88] tracking-tighter uppercase">
            <div className="w-full">
              <RevealText text={market === 'india' ? 'See What Is' : 'Know If It Is'} delay={0.2} />
            </div>
            <div className="w-full">
              <RevealText text={market === 'india' ? 'Bleeding The' : 'Edge Or'} delay={0.5} />
            </div>
            <div className="w-full text-neutral-600">
              <RevealText text={market === 'india' ? 'Account' : 'Behavior'} delay={0.8} className="text-neutral-600" />
            </div>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.6 }}
            className="max-w-xl pl-1"
          >
            <p className="mb-3 max-w-lg font-sans text-base leading-relaxed text-neutral-300">
              {market === 'india'
                ? 'Shibuya shows where you sabotage yourself between good trades, how much avoidable loss your process is leaking in rupees, and what to stop before the next session or the next prop breach.'
                : 'Shibuya shows where you sabotage yourself between good trades, how much avoidable loss your process is leaking, and what to stop before the next session or the next prop breach.'}
            </p>
            <p className="mb-4 max-w-lg font-sans text-sm leading-relaxed text-neutral-400">
              Not a journal. Not ChatGPT. A system that remembers every session, enforces your rules, and proves you are improving.
            </p>
            <p className="mb-8 max-w-lg font-sans text-sm leading-relaxed text-neutral-500">
              {market === 'india'
                ? 'SEBI already proved the structural problem. Shibuya exposes the execution one: whether the real issue is edge decay, self-sabotage, or the state you keep entering before you torch the account.'
                : 'Upload your history. See discipline tax, edge concentration, trader state, and a next-session mandate. Use the sample workspace to evaluate. Use the live workspace to fix the loop for real.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(addMarketToPath(`/checkout/${auditPlan.checkoutSlug}`, market))}
                className="group relative flex items-center gap-2 overflow-hidden bg-white px-6 py-4 text-sm font-bold uppercase tracking-wider text-black"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  {market === 'india' ? 'Get My Psych Audit' : auditPlan.ctaLabel}
                </span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-colors duration-300 group-hover:text-white" />
                <div className="absolute inset-0 origin-left scale-x-0 bg-indigo-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(addMarketToPath(`/checkout/${resetPlan.checkoutSlug}`, market))}
                className="border border-white/20 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
              >
                {market === 'india' ? 'Start Reset Intensive' : resetPlan.ctaLabel}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={openSampleWorkspace}
                className="border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-bold uppercase tracking-wider text-neutral-200 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Open Sample Workspace
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.6 }}
              className="mt-8 flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {market === 'india'
                  ? '\u20b914,000 average annual friction cost from overtrading'
                  : 'EUR 3,418 average monthly avoidable loss identified'}
              </div>
              <div className="hidden h-4 w-px bg-white/10 md:block" />
              <span className="font-mono text-xs text-neutral-500">
                {market === 'india'
                  ? '91% of Indian retail F&O traders lose. The point is to make the leak concrete before it becomes normal.'
                  : 'Most prop breaches start as repeated process errors, not one bad chart read.'}
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative aspect-[4/5] w-full max-w-md md:aspect-square"
          >
            <div className="absolute inset-0 border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-1">
              <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#080808]">
                <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#0A0A0B] px-4">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="font-mono text-[10px] uppercase text-neutral-600">action_board.exe</div>
                </div>

                <div className="relative flex flex-1 flex-col p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

                  <div className="relative z-10 mb-8 flex items-start justify-between">
                    <div>
                      <div className="mb-1 font-mono text-xs uppercase tracking-wider text-neutral-500">Discipline Leak</div>
                      <div className="font-display text-3xl font-bold text-white">
                        {market === 'india' ? '-\u20b918,420' : '-EUR 1,240'}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-neutral-600">DEAN attribution | 30-day window</div>
                    </div>
                    <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-red-400">
                      <Activity className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    {metrics.map((row, index) => (
                      <div key={row.label}>
                        <div className="mb-1 flex justify-between font-mono text-[10px] text-neutral-400">
                          <span>{row.label}</span>
                          <span className={index === 0 ? 'text-rose-400' : index === 1 ? 'text-amber-400' : 'text-neutral-400'}>
                            {row.value}
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: index === 0 ? '64%' : index === 1 ? '28%' : '8%' }}
                            transition={{ delay: 1 + index * 0.2, duration: 1.5 }}
                            className={`h-full ${index === 0 ? 'bg-rose-500/70' : index === 1 ? 'bg-amber-500/70' : 'bg-neutral-600'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 mt-6">
                    <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                      <span className="uppercase tracking-wider text-neutral-500">Next session mandate</span>
                      <span className="uppercase text-emerald-400">
                        {market === 'india' ? 'Do less | protect capital' : 'Protect capital first'}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-neutral-300">
                      {market === 'india'
                        ? 'No expiry-day punts, no size increase after a loss, and no new setup until your baseline is reviewed against the sessions that actually pay you.'
                        : 'Cut the decayed setup, reduce size for the next two sessions, and only trade the edge that still pays you.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
