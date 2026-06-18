import { useMemo, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Lock, UploadCloud } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import {
  FINGERPRINT_AXES,
  STORY_SCENES,
  TRADER_ARCHETYPES,
  buildPublicStoryDemoScript,
  buildBehavioralPressureIndex,
  buildPredictedFingerprint,
  buildPublicStorySignalMarkerIds,
  createInitialStorySignal,
  getBehavioralPressureBand,
  getDominantFingerprintAxis,
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
  const publicDemoScript = useMemo(() => buildPublicStoryDemoScript(signal), [signal])
  const selectedPainAxisLabels = signal.selectedPainAxes
    .map((axisId) => FINGERPRINT_AXES.find((axis) => axis.id === axisId))
    .filter((axis): axis is (typeof FINGERPRINT_AXES)[number] => Boolean(axis))
    .map((axis) => axis.label)
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

  const presenterSteps = [
    {
      time: '00:00',
      title: 'Hook',
      body: 'State problem, not strategy problem.',
      onSelect: () => inspectScene(0),
    },
    {
      time: '00:45',
      title: 'Mirror',
      body: 'Pick the trader and pain axis that feels true.',
      onSelect: () => inspectScene(3),
    },
    {
      time: '01:45',
      title: 'Reveal',
      body: 'Show the provisional fingerprint and the boundary.',
      onSelect: () => inspectScene(9),
    },
    {
      time: '02:30',
      title: 'Evidence',
      body: 'Upload/sample history to test the prediction.',
      onSelect: () => inspectUploadFlow(),
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

  const inspectUploadFlow = () => {
    const nextSignal = recordUploadIntent(signal)
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

    setSignal(nextSignal)
    navigate(addMarketToPath(`/upload?${uploadParams.toString()}`, market))
  }

  const openGuidedDemoPath = () => {
    const demoSceneIds = ['cold-open', 'archetypes', 'predicted-reveal', 'upload-moment']
    const demoSignal = recordUploadIntent(
      togglePainAxis(
        selectArchetype(
          demoSceneIds.reduce(
            (current, sceneId) => recordSceneView(current, sceneId),
            createInitialStorySignal(),
          ),
          'marco',
        ),
        'edge_decay',
      ),
    )
    const demoParams = new URLSearchParams({
      archetype: 'marco',
      axis: 'edge_decay',
      story: 'guided',
      scene_count: String(demoSignal.visitedSceneIds.length),
      pain_axes: 'edge_decay',
      signals: buildPublicStorySignalMarkerIds(demoSignal).join(','),
    })
    const uploadMomentIndex = STORY_SCENES.findIndex((scene) => scene.id === 'upload-moment')

    setActiveSceneIndex(uploadMomentIndex >= 0 ? uploadMomentIndex : activeSceneIndex)
    setSignal(demoSignal)
    navigate(addMarketToPath(`/upload?${demoParams.toString()}`, market))
  }

  return (
    <section id="story-experience" className="shibuya-story-experience overflow-hidden border-b border-white/5 bg-[#030304] pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="mx-auto w-full max-w-full px-5 sm:px-6 md:px-12 lg:max-w-7xl">
        <div className="mb-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="min-w-0">
            <h2 className="break-words font-display text-[2rem] font-bold uppercase leading-tight text-white sm:text-3xl md:text-5xl">
              You do not have a strategy problem. You have a state problem.
            </h2>
            <p className="mt-6 max-w-full break-words text-base leading-relaxed text-neutral-300 md:text-lg lg:max-w-2xl">
              Shibuya is the trader operating mirror: a public story that earns the upload, a report that names the leak,
              and a private workspace that turns the next session into a controlled experiment.
            </p>
            <div className="mt-6 min-w-0 overflow-hidden rounded-3xl border border-indigo-300/20 bg-indigo-300/[0.07] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-100 sm:tracking-[0.24em]">IFX presenter brief</p>
              <p className="mt-3 break-words text-sm leading-relaxed text-neutral-200">
                In three minutes: show the trader mirror, reveal the provisional fingerprint, then make upload the
                evidence step. Do not pitch signals. Pitch state, proof, and the next-session operating loop.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={openGuidedDemoPath}
                className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-indigo-200 sm:w-auto sm:px-5 sm:text-sm sm:tracking-[0.14em]"
              >
                Start Guided Demo Path
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={inspectUploadFlow}
                className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black sm:w-auto sm:px-5 sm:text-sm sm:tracking-[0.14em]"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Trade History
              </button>
              <button
                type="button"
                onClick={() => inspectScene(1)}
                className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black sm:w-auto sm:px-5 sm:text-sm sm:tracking-[0.14em]"
              >
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 max-w-full break-words text-xs leading-5 text-neutral-500 lg:max-w-xl">
              For a fast handoff, the guided path uses Marco / Edge Decay and carries that public context into upload,
              free report, locked insight, and the private demo gate.
            </p>
          </div>
          <div className="min-w-0 space-y-4 text-sm leading-relaxed text-neutral-400 md:text-base">
            <p>
              P&L tells you what happened. Shibuya shows the repeatable behavioral state that appeared before it happened.
              This page builds a provisional fingerprint from the way you move through the story, then asks your trade history to confirm or reject it.
            </p>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                <span>3-minute guided story</span>
                <span>Scene {activeSceneIndex + 1}/{STORY_SCENES.length}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-300 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className="break-words rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-amber-100/90">
              This is not your report. It is a website-level prediction based on interaction. Upload history or activate a live account before treating anything as account-specific analysis.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <PublicJourneySpine
            activeStage="story"
            detail="The first public job is recognition. The page can route a hypothesis forward, but upload/report/private claims stay behind evidence."
          />
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {presenterSteps.map((step) => (
            <button
              key={step.time}
              type="button"
              onClick={step.onSelect}
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-indigo-300/50 hover:bg-indigo-300/[0.08]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-indigo-200">{step.time}</span>
              <span className="mt-2 block text-sm font-semibold text-white">{step.title}</span>
              <span className="mt-2 block text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-200">{step.body}</span>
            </button>
          ))}
        </div>

        <section className="mb-8 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                Public StoryExperience demo script
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{publicDemoScript.headline}</h3>
            </div>
            <p className="text-sm leading-7 text-emerald-50/75">{publicDemoScript.operatorBrief}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {publicDemoScript.moments.map((moment) => (
              <article key={`${moment.timebox}-${moment.title}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">{moment.timebox}</p>
                <h4 className="mt-2 text-base font-semibold text-white">{moment.title}</h4>
                <p className="mt-3 text-xs leading-5 text-neutral-300">
                  <span className="font-semibold text-white">Say:</span> {moment.say}
                </p>
                <p className="mt-3 text-xs leading-5 text-neutral-300">
                  <span className="font-semibold text-white">Show:</span> {moment.show}
                </p>
                <p className="mt-3 text-xs leading-5 text-amber-100/75">
                  <span className="font-semibold text-amber-100">Boundary:</span> {moment.boundary}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <h4 className="text-base font-semibold text-white">Allowed public claims</h4>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-50/80">
                {publicDemoScript.allowedClaims.map((claim) => (
                  <li key={claim} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-5">
              <h4 className="text-base font-semibold text-white">Forbidden public claims</h4>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-rose-50/80">
                {publicDemoScript.forbiddenClaims.map((claim) => (
                  <li key={claim} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-emerald-50/75">
            <span className="font-semibold text-white">Next action:</span> {publicDemoScript.nextAction}
          </p>
        </section>

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
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">3-minute demo path</p>
                <div className="mt-4 grid gap-3 text-sm leading-relaxed text-neutral-300">
                  {[
                    ['1', 'Public story predicts a provisional fingerprint.'],
                    ['2', 'Upload or sample history creates the free report packet.'],
                    ['3', 'Locked insight explains what live evidence must prove.'],
                    ['4', 'Private Reset Pro demo opens only behind the founder gate.'],
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
                  The public page earns the upload. The private demo shows structure with sample data only.
                </p>
                <button
                  type="button"
                  onClick={openGuidedDemoPath}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300/30 bg-indigo-300/[0.08] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50 hover:bg-indigo-300/[0.14]"
                >
                  Use Guided Demo Path
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-[#09090B] p-5">
                <button
                  type="button"
                  onClick={inspectUploadFlow}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                >
                  <UploadCloud className="h-4 w-4" />
                  Continue To Upload
                </button>
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
