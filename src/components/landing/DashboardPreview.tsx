import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, ClipboardList, FileText, KeyRound, UploadCloud } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { resolveMarket } from '../../lib/market'

const StateCard = ({
  icon: Icon,
  label,
  value,
  detail,
  variant = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  detail: string
  variant?: 'default' | 'success' | 'primary'
}) => {
  const variantStyles = {
    default: 'border-white/8',
    success: 'border-emerald-500/25 bg-emerald-500/[0.04]',
    primary: 'border-indigo-500/25 bg-indigo-500/[0.05]',
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border bg-[#0A0A0F] p-5 transition-all duration-300 ${variantStyles[variant]}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-white/5 p-2">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</span>
      </div>
      <div className="mb-2 text-xl font-semibold text-white">{value}</div>
      <p className="text-sm leading-relaxed text-neutral-400">{detail}</p>
    </motion.div>
  )
}

const DashboardPreview: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const nextAction =
    market === 'india'
      ? 'Reduce index F&O size until the first clean upload-to-append cycle is complete.'
      : 'Reduce size until the first clean upload-to-append cycle is complete.'

  return (
    <section className="relative overflow-hidden bg-[#020203] py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]" />
        <div className="absolute inset-0 bg-[#020203]/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2"
          >
            <ClipboardList className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-400">Action Board Preview</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-display font-bold uppercase text-white md:text-6xl"
          >
            Reset Pro is a first-cycle command room, not a prettier report.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-neutral-400"
          >
            The public experience should make the next screen obvious: sample workspace for inspection, live trader account for persistent uploads, and Reset Pro for the first guided review after evidence exists.
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
              <span className="font-mono text-xs text-neutral-500">shibuya-analytics.com/dashboard/workspace</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <StateCard
                icon={ClipboardList}
                label="Runtime"
                value="Sample or live"
                detail="Sample teaches the workflow. Live persists only after activation."
                variant="primary"
              />
              <StateCard
                icon={KeyRound}
                label="Activation"
                value="Order code"
                detail="Email plus code unlocks the live trader account."
                variant="success"
              />
              <StateCard
                icon={UploadCloud}
                label="Ingestion"
                value="Universal first"
                detail="CSV, statement, or paste parser before deeper connectors."
              />
              <StateCard
                icon={FileText}
                label="Reset Pro"
                value="Review after upload"
                detail="The guided checkpoint follows the first meaningful upload."
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
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="mb-1 font-medium text-white">First-cycle Reset Pro path</h4>
                    <p className="text-sm text-neutral-500">Generated after context and upload, then checked against the next append.</p>
                  </div>
                  <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                    Action board
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    ['Before trading', 'Review allowed setup, size limit, and the condition that stops the session.'],
                    ['During the first cycle', nextAction],
                    ['After session', 'Append the new trades and compare adherence, improvement, or relapse before guided review.'],
                  ].map(([title, body], index) => (
                    <div key={title} className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 font-mono text-xs text-neutral-300">
                        {index + 1}
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-semibold text-white">{title}</div>
                        <p className="text-sm leading-relaxed text-neutral-400">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col rounded-2xl border border-white/5 bg-[#080809] p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-white">Guided review checkpoint</h4>
                <p className="mb-6 text-sm leading-relaxed text-neutral-400">
                  Reset Pro unlocks a guided checkpoint after the first meaningful upload, so the call reviews the board, the mandate, and the actual reset plan.
                </p>
                <div className="mt-auto rounded-xl border border-white/5 bg-black/30 p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Included where plan says guided
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-500">
                    Self-serve plans still keep the workspace loop. Guided review is an explicit plan feature, not a hidden claim or pre-evidence promise.
                  </p>
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
          Preview uses bounded product states. Live accounts must bind to backend state or show the missing state honestly.
        </motion.p>
      </div>
    </section>
  )
}

export default DashboardPreview
