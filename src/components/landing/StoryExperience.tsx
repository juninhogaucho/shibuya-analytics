import { useMemo, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Lock, UploadCloud } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import {
  FINGERPRINT_AXES,
  STORY_SCENES,
  TRADER_ARCHETYPES,
  buildBehavioralPressureIndex,
  buildPredictedFingerprint,
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
    setSignal((current) => recordUploadIntent(current))
    const archetypeId = signal.archetypeId ?? 'john'
    navigate(addMarketToPath(`/upload?archetype=${archetypeId}&axis=${dominantAxis.id}`, market))
  }

  return (
    <section id="story-experience" className="border-b border-white/5 bg-[#030304] pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase leading-tight text-white md:text-5xl">
              You do not have a strategy problem. You have a state problem.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={inspectUploadFlow}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Trade History
              </button>
              <button
                type="button"
                onClick={() => inspectScene(1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 md:text-base">
            <p>
              P&L tells you what happened. Shibuya shows the repeatable behavioral state that appeared before it happened.
              This page builds a provisional fingerprint from the way you move through the story, then asks your trade history to confirm or reject it.
            </p>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                <span>3-minute guided story</span>
                <span>Scene {activeSceneIndex + 1}/{STORY_SCENES.length}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-300 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-amber-100/90">
              This is not your report. It is a website-level prediction based on interaction. Upload history or activate a live account before treating anything as account-specific analysis.
            </p>
          </div>
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
