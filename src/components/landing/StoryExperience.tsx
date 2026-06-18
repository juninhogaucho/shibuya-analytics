import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Lock, UploadCloud } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import {
  FINGERPRINT_AXES,
  STORY_SCENES,
  TRADER_ARCHETYPES,
  buildBehavioralPressureIndex,
  buildPredictedFingerprint,
  buildPublicStorySignalMarkerIds,
  createInitialStorySignal,
  getBehavioralPressureBand,
  getDominantFingerprintAxis,
  getPublicStorySignalMarkers,
  recordPricingInterest,
  recordSceneView,
  recordUploadIntent,
  selectArchetype,
  togglePainAxis,
  type FingerprintAxisId,
  type StoryArchetypeId,
} from '../../lib/storyExperience'
import { BehavioralFingerprint } from './BehavioralFingerprint'
import { PublicJourneySpine } from './PublicJourneySpine'

const ENGINE_PIPELINE_STAGES = [
  {
    step: '01',
    label: 'Normalize',
    body: 'Parse broker history into a comparable decision sequence before analysis.',
  },
  {
    step: '02',
    label: 'BQL state detection',
    body: 'Detect behavioral states around entries, exits, holds, adds, and re-entries.',
  },
  {
    step: '03',
    label: 'Discipline tax',
    body: 'Estimate repeated behavioral cost without turning it into a trade signal.',
  },
  {
    step: '04',
    label: 'Edge drift',
    body: 'Separate setup health from ordinary variance before calling anything decayed.',
  },
  {
    step: '05',
    label: 'Breach pressure',
    body: 'Model rulebook pressure and state change before prop-style account damage.',
  },
  {
    step: '06',
    label: 'Report artifact',
    body: 'Explain the detected state in trader language after the math has run.',
  },
] as const

const CINEMATIC_CHOICES: Array<{
  line: string
  subline: string
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  nextSceneIndex: number
}> = [
  {
    line: 'I kept trading after the trade was already gone.',
    subline: 'Loss became recovery mission.',
    archetypeId: 'john',
    axisId: 'revenge_reentry',
    nextSceneIndex: 4,
  },
  {
    line: 'I changed near the limit line.',
    subline: 'The account pressure changed the operator.',
    archetypeId: 'priya',
    axisId: 'drawdown_pressure',
    nextSceneIndex: 4,
  },
  {
    line: 'I defended an edge that stopped paying.',
    subline: 'The setup looked familiar. The market was different.',
    archetypeId: 'marco',
    axisId: 'edge_decay',
    nextSceneIndex: 4,
  },
]

export default function StoryExperience() {
  const navigate = useNavigate()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const [signal, setSignal] = useState(() => recordSceneView(createInitialStorySignal(), STORY_SCENES[0].id))
  const scores = useMemo(() => buildPredictedFingerprint(signal), [signal])
  const dominantAxis = getDominantFingerprintAxis(scores)
  const pressureIndex = buildBehavioralPressureIndex(scores)
  const pressureBand = getBehavioralPressureBand(pressureIndex)
  const activeScene = STORY_SCENES[activeSceneIndex]
  const progress = Math.round(((activeSceneIndex + 1) / STORY_SCENES.length) * 100)
  const selectedArchetype = TRADER_ARCHETYPES.find((archetype) => archetype.id === signal.archetypeId)
  const selectedPainAxisLabels = signal.selectedPainAxes
    .map((axisId) => FINGERPRINT_AXES.find((axis) => axis.id === axisId))
    .filter((axis): axis is (typeof FINGERPRINT_AXES)[number] => Boolean(axis))
    .map((axis) => axis.label)
  const currentSignalMarkerIds = buildPublicStorySignalMarkerIds(signal)
  const currentSignalMarkers = getPublicStorySignalMarkers(currentSignalMarkerIds)
  const evidenceContractRows = [
    {
      label: 'Public signal only',
      body: `Current hypothesis: ${selectedArchetype ? `${selectedArchetype.name} / ${selectedArchetype.title}` : 'no mirror selected yet'} with ${dominantAxis.label} as the leading axis. This is routing context, not account evidence.`,
    },
    {
      label: 'Upload must prove it',
      body: `Trade history has to confirm or reject ${dominantAxis.label} before Shibuya treats the pattern as account-specific truth.`,
    },
    {
      label: 'Private demo boundary',
      body: 'Reset Pro preview can show the operating loop with sample data only. Live persistence requires activation, upload, and generated artifacts.',
    },
  ]
  const publicHandoffRows = [
    {
      label: 'Secret-free routing context',
      value: selectedArchetype
        ? `archetype=${selectedArchetype.id}; axis=${dominantAxis.id}`
        : `archetype=unselected; axis=${dominantAxis.id}`,
      body: 'The public story may carry market, archetype, dominant axis, visited scene count, public pain axes, and signal marker ids.',
    },
    {
      label: 'Stored at next click',
      value: `story=guided; scene_count=${signal.visitedSceneIds.length}; pain_axes=${signal.selectedPainAxes.join(',') || 'none'}`,
      body: 'Upload/report/private insight can preserve this as context so the next page knows what question the visitor is trying to test.',
    },
    {
      label: 'Public markers',
      value: currentSignalMarkers.length ? currentSignalMarkers.map((marker) => marker.label).join(', ') : 'No route markers yet',
      body: currentSignalMarkerIds.length
        ? `Marker ids: ${currentSignalMarkerIds.join(', ')}. These explain routing intent only.`
        : 'No marker should be interpreted as account behavior until upload evidence exists.',
    },
    {
      label: 'Claim boundary',
      value: 'No private conclusion',
      body: 'No raw trade rows, account id, brokerage login, P&L, or private conclusion is stored or proven by this public packet.',
    },
  ]

  const inspectScene = (index: number) => {
    const scene = STORY_SCENES[index]
    setActiveSceneIndex(index)
    setSignal((current) => recordSceneView(current, scene.id))
  }

  const chooseArchetype = (archetypeId: StoryArchetypeId) => {
    setSignal((current) => selectArchetype(current, archetypeId))
  }

  const togglePain = (axisId: FingerprintAxisId) => {
    setSignal((current) => togglePainAxis(current, axisId))
  }

  const chooseCinematicMirror = (
    archetypeId: StoryArchetypeId,
    axisId: FingerprintAxisId,
    nextSceneIndex: number,
  ) => {
    const safeNextIndex = Math.max(0, Math.min(nextSceneIndex, STORY_SCENES.length - 1))
    const nextScene = STORY_SCENES[safeNextIndex]

    setActiveSceneIndex(safeNextIndex)
    setSignal((current) => {
      const withArchetype = selectArchetype(current, archetypeId)
      const withPainAxis = withArchetype.selectedPainAxes.includes(axisId)
        ? withArchetype
        : togglePainAxis(withArchetype, axisId)

      return recordSceneView(withPainAxis, nextScene.id)
    })
  }

  const goPreviousScene = () => {
    inspectScene(Math.max(activeSceneIndex - 1, 0))
  }

  const goNextScene = () => {
    inspectScene(Math.min(activeSceneIndex + 1, STORY_SCENES.length - 1))
  }

  const goPricing = () => {
    setSignal((current) => recordPricingInterest(current))
    navigate(addMarketToPath('/pricing', market))
  }

  const buildUploadPath = (nextSignal: typeof signal) => {
    const archetypeId = nextSignal.archetypeId ?? 'john'
    const uploadParams = new URLSearchParams({
      archetype: archetypeId,
      axis: dominantAxis.id,
      story: 'guided',
      scene_count: String(nextSignal.visitedSceneIds.length),
      signals: buildPublicStorySignalMarkerIds(nextSignal).join(','),
    })

    if (nextSignal.selectedPainAxes.length > 0) {
      uploadParams.set('pain_axes', nextSignal.selectedPainAxes.join(','))
    }

    return addMarketToPath(`/upload?${uploadParams.toString()}`, market)
  }

  const pendingUploadSignal = recordUploadIntent(signal)
  const uploadPath = buildUploadPath(pendingUploadSignal)

  const recordPendingUploadIntent = () => {
    setSignal(pendingUploadSignal)
  }

  const inspectUploadFlow = () => {
    const nextSignal = recordUploadIntent(signal)

    setSignal(nextSignal)
    navigate(buildUploadPath(nextSignal))
  }

  return (
    <section
      id="story-experience"
      className="shibuya-story-experience relative overflow-hidden border-b border-white/5 bg-[#020203] pb-16 pt-24 text-white md:pb-24 md:pt-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute right-[-14rem] top-[18rem] h-[38rem] w-[38rem] rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,rgba(2,2,3,0)_0%,#020203_76%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-full px-5 sm:px-6 md:px-12 lg:max-w-7xl">
        <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/50">
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              key={`light-${activeScene.id}`}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute inset-0"
              style={{
                background:
                  activeSceneIndex % 3 === 0
                    ? 'radial-gradient(circle at 24% 26%, rgba(129,140,248,0.34), transparent 32%), radial-gradient(circle at 80% 20%, rgba(34,211,238,0.14), transparent 34%), linear-gradient(130deg, #030309 0%, #070711 44%, #010102 100%)'
                    : activeSceneIndex % 3 === 1
                      ? 'radial-gradient(circle at 75% 22%, rgba(244,114,182,0.22), transparent 30%), radial-gradient(circle at 18% 72%, rgba(56,189,248,0.16), transparent 34%), linear-gradient(130deg, #020203 0%, #10070d 48%, #030304 100%)'
                      : 'radial-gradient(circle at 72% 70%, rgba(16,185,129,0.16), transparent 36%), radial-gradient(circle at 28% 18%, rgba(255,255,255,0.13), transparent 24%), linear-gradient(130deg, #020202 0%, #05050b 48%, #010101 100%)',
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.72)_100%)]" />
          </div>

          <div className="relative flex min-h-[calc(100vh-6rem)] flex-col justify-between p-5 sm:p-7 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.26em] text-white/55">
              <span>Interactive film / public mirror</span>
              <span>{activeScene.label} / {progress}% complete</span>
            </div>

            <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.43fr)] lg:items-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene.id}
                  initial={false}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -18, filter: 'blur(12px)' }}
                  transition={{ duration: 0.48, ease: 'easeOut' }}
                  className="min-w-0"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-indigo-100/80">
                    Shibuya scene experience
                  </p>
                  <h2 className="mt-5 max-w-5xl break-words font-display text-[3.1rem] font-black uppercase leading-[0.86] tracking-[-0.07em] text-white sm:text-[4.7rem] md:text-[6.4rem] lg:text-[7.4rem]">
                    {activeSceneIndex === 0 ? (
                      <>
                        The market did not break you.
                        <span className="block text-white/40">Your state repeated.</span>
                      </>
                    ) : (
                      activeScene.title
                    )}
                  </h2>
                  <p className="mt-7 max-w-2xl break-words text-lg leading-8 text-neutral-200 md:text-xl md:leading-9">
                    {activeSceneIndex === 0
                      ? 'P&L is the last frame. Shibuya rewinds the film: pressure, hesitation, size, exit, re-entry, damage.'
                      : activeScene.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              <motion.aside
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
                className="min-w-0 rounded-[1.5rem] border border-white/10 bg-black/45 p-4 backdrop-blur-xl md:p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Choose the frame that stings</p>
                <div className="mt-4 space-y-3">
                  {CINEMATIC_CHOICES.map((choice) => {
                    const selected = signal.archetypeId === choice.archetypeId || signal.selectedPainAxes.includes(choice.axisId)

                    return (
                      <button
                        key={choice.axisId}
                        type="button"
                        onClick={() => chooseCinematicMirror(choice.archetypeId, choice.axisId, choice.nextSceneIndex)}
                        className={`group w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? 'border-white/40 bg-white text-black'
                            : 'border-white/10 bg-white/[0.035] text-white hover:border-white/30 hover:bg-white/[0.08]'
                        }`}
                      >
                        <span className="block text-sm font-semibold leading-6">{choice.line}</span>
                        <span className={`mt-2 block text-xs leading-5 ${selected ? 'text-black/60' : 'text-neutral-400 group-hover:text-neutral-300'}`}>
                          {choice.subline}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-sm leading-6 text-amber-50/85">
                  This is recognition, not proof. Account-specific truth starts after upload.
                </div>
              </motion.aside>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="h-1 max-w-xl overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-3 max-w-2xl text-xs leading-5 text-neutral-400">
                  Public interaction can create only a hypothesis. Upload/report decides what survives contact with trade history.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goNextScene}
                  disabled={activeSceneIndex === STORY_SCENES.length - 1}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  Next Scene
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to={uploadPath}
                  onClick={recordPendingUploadIntent}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black sm:w-auto"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload evidence
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 text-sm leading-7 text-neutral-300 md:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">Public story contract</p>
          <p className="mt-3">
            This is the first product surface: recognize the pressure state, choose the uncomfortable mirror, reveal a
            provisional fingerprint, then decide whether trade history can prove or reject it.
          </p>
        </div>

        <div className="mb-8">
          <PublicJourneySpine
            activeStage="story"
            detail="The first public job is recognition. The page can route a hypothesis forward, but upload/report/private claims stay behind evidence."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="order-2 space-y-3 lg:order-1">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              <span>Scene rail</span>
              <span>{progress}% complete</span>
            </div>
            {STORY_SCENES.map((scene, index) => {
              const selected = index === activeSceneIndex

              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => inspectScene(index)}
                  className={`grid w-full grid-cols-[auto_1fr] gap-4 border p-4 text-left transition ${
                    selected
                      ? 'border-indigo-300/50 bg-indigo-300/[0.08] text-white'
                      : 'border-white/8 bg-[#09090B] text-neutral-400 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{scene.label}</span>
                  <span className="text-sm font-semibold">{scene.title}</span>
                </button>
              )
            })}
          </div>

          <div className="order-1 grid gap-6 xl:grid-cols-[1fr_0.82fr] lg:order-2">
            <article className="border border-white/8 bg-[#09090B]">
              <div className="border-b border-white/8 p-6 md:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300">{activeScene.label}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPreviousScene}
                      disabled={activeSceneIndex === 0}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Previous story scene"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextScene}
                      disabled={activeSceneIndex === STORY_SCENES.length - 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Next story scene"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white md:text-3xl">{activeScene.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-neutral-300">{activeScene.body}</p>
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-white/8 p-6 md:border-b-0 md:border-r md:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">What must be true</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">{activeScene.proof}</p>
                </div>
                <div className="p-6 md:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Visual cue</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">{activeScene.visualCue}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/8 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
                <p className="text-sm leading-relaxed text-neutral-400">
                  Keep moving until the fingerprint reveal, then upload to see what survives contact with real trade history.
                </p>
                <button
                  type="button"
                  onClick={activeSceneIndex === STORY_SCENES.length - 1 ? inspectUploadFlow : goNextScene}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-indigo-200"
                >
                  {activeSceneIndex === STORY_SCENES.length - 1 ? 'Upload History' : 'Next Scene'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-white/8 p-6 md:p-8">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Choose the uncomfortable mirror
                </p>
                <p className="mb-4 text-sm leading-relaxed text-neutral-400">
                  For a live demo, choose one mirror and one pain axis. Shibuya carries that public context into upload,
                  checkout, activation, and the private demo without claiming it is account evidence yet.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {TRADER_ARCHETYPES.map((archetype) => (
                    <button
                      key={archetype.id}
                      type="button"
                      onClick={() => chooseArchetype(archetype.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        signal.archetypeId === archetype.id
                          ? 'border-indigo-300/50 bg-indigo-300/[0.1]'
                          : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span className="text-sm font-semibold text-white">{archetype.name}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-neutral-500">{archetype.title}</span>
                      <span className="mt-3 block text-xs leading-relaxed text-neutral-400">{archetype.body}</span>
                    </button>
                  ))}
                </div>

                <p className="mb-4 mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Tap the pain that feels closest
                </p>
                <div className="flex flex-wrap gap-2">
                  {FINGERPRINT_AXES.map((axis) => (
                    <button
                      key={axis.id}
                      type="button"
                      onClick={() => togglePain(axis.id)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        signal.selectedPainAxes.includes(axis.id)
                          ? 'border-indigo-300/50 bg-indigo-300/[0.12] text-indigo-100'
                          : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      {axis.label}
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <aside className="space-y-4">
              <BehavioralFingerprint scores={scores} />
              <div className="rounded-3xl border border-white/10 bg-[#09090B] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Predicted dominant axis</p>
                <h4 className="mt-2 text-xl font-semibold text-white">{dominantAxis.label}</h4>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{dominantAxis.description}</p>
                <div className="mt-4 grid gap-2 text-xs leading-relaxed text-neutral-400">
                  <p>
                    Mirror:{' '}
                    <span className="text-neutral-200">{selectedArchetype ? `${selectedArchetype.name} - ${selectedArchetype.title}` : 'not selected yet'}</span>
                  </p>
                  <p>
                    Pain selected:{' '}
                    <span className="text-neutral-200">{selectedPainAxisLabels.length ? selectedPainAxisLabels.join(', ') : 'none yet'}</span>
                  </p>
                  <p>
                    Scenes viewed: <span className="text-neutral-200">{signal.visitedSceneIds.length}</span>
                  </p>
                </div>
                <p className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-relaxed text-neutral-500">
                  Based only on how you moved through this page. This is not diagnostic proof.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#09090B] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Behavioral pressure index</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-mono text-4xl font-black text-white">{pressureIndex}</span>
                  <span className="pb-1 font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">/100</span>
                </div>
                <h4 className="mt-3 text-lg font-semibold text-indigo-100">{pressureBand.label}</h4>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{pressureBand.description}</p>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Evidence contract</p>
                <h4 className="mt-2 text-lg font-semibold text-white">Story first. Evidence second.</h4>
                <div className="mt-4 grid gap-3">
                  {evidenceContractRows.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100">{row.label}</p>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-300">{row.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-sky-300/20 bg-sky-300/[0.055] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200">Public handoff packet</p>
                <h4 className="mt-2 text-lg font-semibold text-white">What survives from story into upload.</h4>
                <p className="mt-3 text-sm leading-relaxed text-sky-50/75">
                  This packet is the bridge from recognition to evidence. It is useful because it is explicit,
                  secret-free, and narrow enough not to become a fake diagnosis.
                </p>
                <div className="mt-4 grid gap-3">
                  {publicHandoffRows.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-100">{row.label}</p>
                      <p className="mt-2 break-words text-xs font-semibold text-white">{row.value}</p>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-300">{row.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-relaxed text-sky-50/65">
                  Handoff rule: the packet can route the next page and preserve the question; it cannot answer the question.
                </p>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.055] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">Target engine path</p>
                <h4 className="mt-2 text-lg font-semibold text-white">The model calculates. The language explains.</h4>
                <p className="mt-3 text-sm leading-relaxed text-cyan-50/75">
                  This is the production proof path the website is promising, not a claim that the public page has already
                  analyzed the account.
                </p>
                <div className="mt-4 grid gap-2">
                  {ENGINE_PIPELINE_STAGES.map((stage) => (
                    <div key={stage.step} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/30 font-mono text-[10px] text-cyan-100">
                        {stage.step}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">{stage.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-neutral-300">{stage.body}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-relaxed text-cyan-50/65">
                  No public accuracy percentage, no buy/sell recommendation, and no account-specific diagnosis before normalized upload proof.
                </p>
              </div>
              <div className="rounded-3xl border border-indigo-300/20 bg-indigo-300/[0.06] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Truth ladder</p>
                <div className="mt-4 grid gap-3 text-sm leading-relaxed text-neutral-300">
                  {[
                    ['1', 'Public story creates a provisional mirror.'],
                    ['2', 'Upload or sample history tests what the mirror got right.'],
                    ['3', 'Free report names the leak without pretending to finish the answer.'],
                    ['4', 'Locked insight asks the private question the trader now cares about.'],
                    ['5', 'Reset Pro becomes the operating loop only after access and evidence boundaries are clear.'],
                  ].map(([step, body]) => (
                    <div key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-black">
                        {step}
                      </span>
                      <span>{body}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-indigo-50/65">
                  The public story earns the upload. Private workspace access can show the operating loop, but live proof still begins at upload and append history.
                </p>
                <Link
                  to={uploadPath}
                  onClick={recordPendingUploadIntent}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300/30 bg-indigo-300/[0.08] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50 hover:bg-indigo-300/[0.14]"
                >
                  Turn Mirror Into Evidence
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-[#09090B] p-5">
                <Link
                  to={uploadPath}
                  onClick={recordPendingUploadIntent}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                >
                  <UploadCloud className="h-4 w-4" />
                  Continue To Upload
                </Link>
                <button
                  type="button"
                  onClick={goPricing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
                >
                  <Lock className="h-4 w-4" />
                  See Paid Ladder
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
