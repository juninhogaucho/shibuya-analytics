import { Check, LockKeyhole } from 'lucide-react'
import {
  PUBLIC_JOURNEY_CONTRACT,
  getPublicJourneyStageState,
  type PublicJourneyStage,
} from '../../lib/publicJourneyContract'

export type { PublicJourneyStage }

export function PublicJourneySpine({
  activeStage,
  detail,
}: {
  activeStage: PublicJourneyStage
  detail?: string
}) {
  return (
    <aside
      aria-label="Shibuya public to private journey"
      className="min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 md:p-5"
    >
      <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="break-words font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-200 sm:tracking-[0.22em]">
            Public-to-private journey
          </p>
          <h2 className="mt-1 break-words text-lg font-semibold text-white">Story first. Evidence decides what unlocks.</h2>
        </div>
        {detail ? (
          <p className="max-w-xl break-words text-xs leading-5 text-neutral-400">{detail}</p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-6">
        {PUBLIC_JOURNEY_CONTRACT.map((stage) => {
          const state = getPublicJourneyStageState(stage.id, activeStage)

          return (
            <div
              key={stage.id}
              className={`min-w-0 rounded-2xl border p-3 ${
                state === 'active'
                  ? 'border-indigo-300/50 bg-indigo-300/[0.1]'
                  : state === 'complete'
                    ? 'border-emerald-300/25 bg-emerald-300/[0.06]'
                    : 'border-white/8 bg-black/20'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{stage.label}</span>
                {state === 'complete' ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : state === 'locked' ? (
                  <LockKeyhole className="h-4 w-4 text-neutral-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-indigo-200" />
                )}
              </div>
              <h3 className="break-words text-sm font-semibold text-white">{stage.title}</h3>
              <p className="mt-2 break-words text-xs leading-5 text-neutral-400">{stage.boundary}</p>
              {state === 'active' ? (
                <p className="mt-2 break-words text-[11px] leading-5 text-indigo-100/75">
                  {stage.proofContract}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
