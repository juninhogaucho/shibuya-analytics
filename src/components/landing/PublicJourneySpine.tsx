import { Check, LockKeyhole } from 'lucide-react'

export type PublicJourneyStage = 'story' | 'upload' | 'report' | 'insight' | 'demo'

const PUBLIC_JOURNEY_STAGES: Array<{
  id: PublicJourneyStage
  label: string
  title: string
  boundary: string
}> = [
  {
    id: 'story',
    label: '01',
    title: 'Public story',
    boundary: 'Website-level recognition only.',
  },
  {
    id: 'upload',
    label: '02',
    title: 'Upload packet',
    boundary: 'Local handoff or live normalization.',
  },
  {
    id: 'report',
    label: '03',
    title: 'Free baseline',
    boundary: 'One sharp preview, private proof still locked.',
  },
  {
    id: 'insight',
    label: '04',
    title: 'Private insight lock',
    boundary: 'Shows what evidence must exist first.',
  },
  {
    id: 'demo',
    label: '05',
    title: 'Reset Pro demo',
    boundary: 'Founder-gated sample workspace.',
  },
]

function getStageState(stage: PublicJourneyStage, activeStage: PublicJourneyStage): 'complete' | 'active' | 'locked' {
  const stageIndex = PUBLIC_JOURNEY_STAGES.findIndex((candidate) => candidate.id === stage)
  const activeIndex = PUBLIC_JOURNEY_STAGES.findIndex((candidate) => candidate.id === activeStage)

  if (stageIndex < activeIndex) {
    return 'complete'
  }

  if (stageIndex === activeIndex) {
    return 'active'
  }

  return 'locked'
}

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
      className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 md:p-5"
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">
            Public-to-private journey
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Story first. Evidence decides what unlocks.</h2>
        </div>
        {detail ? (
          <p className="max-w-xl text-xs leading-5 text-neutral-400">{detail}</p>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {PUBLIC_JOURNEY_STAGES.map((stage) => {
          const state = getStageState(stage.id, activeStage)

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border p-3 ${
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
              <h3 className="text-sm font-semibold text-white">{stage.title}</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-400">{stage.boundary}</p>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
