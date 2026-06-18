import { type FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appendCheckoutIntentToPath, readCheckoutIntent } from '../../lib/checkoutIntent'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import { readPublicStoryHandoff } from '../../lib/publicStoryHandoff'
import {
  PRIVATE_DEMO_CODE_ENV_KEY,
  enterPrivateResetProDemo,
  hasPrivateDemoGateConfigured,
  verifyPrivateDemoCode,
} from '../../lib/privateDemoAccess'
import { getPublicReportSession } from '../../lib/publicReportSession'
import {
  buildFreeReportPreview,
  findLockedReportSectionBySlug,
  getFingerprintAxis,
  getTraderArchetype,
  toReportSectionSlug,
} from '../../lib/storyExperience'

export default function PrivateDemoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const market = resolveMarket(location.pathname, location.search)
  const params = new URLSearchParams(location.search)
  const handoffReportId = params.get('report')?.trim() || undefined
  const handoffArchetype = getTraderArchetype(params.get('archetype'))
  const handoffAxis = getFingerprintAxis(params.get('axis'))
  const handoffSectionId = params.get('section')?.trim() || undefined
  const handoffSource = params.get('source') ?? undefined
  const checkoutIntent = readCheckoutIntent(location.search)
  const hasReportHandoff = ['free_report', 'locked_insight'].includes(handoffSource ?? '') || Boolean(handoffReportId)
  const reportSession = getPublicReportSession(handoffReportId)
  const urlStoryHandoff = readPublicStoryHandoff(location.search)
  const effectiveStorySource = reportSession?.storySource ?? urlStoryHandoff?.storySource
  const effectiveSelectedPainAxisIds = reportSession?.selectedPainAxisIds ?? urlStoryHandoff?.selectedPainAxisIds
  const effectiveVisitedSceneCount = reportSession?.visitedSceneCount ?? urlStoryHandoff?.visitedSceneCount
  const handoffReport = buildFreeReportPreview({
    reportId: handoffReportId,
    archetypeId: params.get('archetype'),
    axisId: params.get('axis'),
    storySource: effectiveStorySource,
    selectedPainAxisIds: effectiveSelectedPainAxisIds,
    visitedSceneCount: effectiveVisitedSceneCount,
  })
  const selectedPainAxes = handoffReport.storyHandoff.selectedPainAxes
  const lockedSection = findLockedReportSectionBySlug(handoffReport, handoffSectionId)
  const resetProBridge = handoffReport.resetProBridge
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const configured = hasPrivateDemoGateConfigured()
  const workspaceHandoffFacts = [
    ['Source', hasReportHandoff ? handoffSource ?? 'report_link' : 'direct_private_demo'],
    ['Market', market],
    ['Report', handoffReportId ?? 'not attached'],
    ['Archetype', hasReportHandoff ? `${handoffArchetype.name}: ${handoffArchetype.title}` : 'not attached'],
    ['Dominant axis', hasReportHandoff ? handoffAxis.label : 'not attached'],
    ['Story handoff', effectiveStorySource ? `${effectiveStorySource}; scenes ${effectiveVisitedSceneCount ?? 0}` : 'not attached'],
    ['Evidence packet', reportSession?.evidenceLabel ?? (hasReportHandoff ? 'direct-link fallback only' : 'demo entry only')],
    ['Locked module', lockedSection?.title ?? handoffSectionId ?? 'not attached'],
    ['Bridge question', hasReportHandoff ? resetProBridge.decisionQuestion : 'not attached'],
  ]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = verifyPrivateDemoCode(code)

    if (!result.ok) {
      setError(
        result.reason === 'not_configured'
          ? `Private demo access is disabled in this build. Configure ${PRIVATE_DEMO_CODE_ENV_KEY} before sharing a Reset Pro demo.`
          : 'That demo code does not unlock the private Reset Pro workspace.',
      )
      return
    }

    enterPrivateResetProDemo(market, {
      source: hasReportHandoff ? handoffSource : undefined,
      reportId: handoffReportId,
      archetypeId: hasReportHandoff ? handoffArchetype.id : undefined,
      axisId: hasReportHandoff ? handoffAxis.id : undefined,
      reportSource: reportSession?.source ?? (hasReportHandoff ? 'direct_link' : undefined),
      evidenceLabel: reportSession?.evidenceLabel,
      validationSummary: reportSession?.validationSummary,
      storySource: effectiveStorySource,
      selectedPainAxisIds: effectiveSelectedPainAxisIds,
      visitedSceneCount: effectiveVisitedSceneCount,
      lockedSectionId: lockedSection ? toReportSectionSlug(lockedSection.title) : handoffSectionId,
      lockedSectionTitle: lockedSection?.title,
      bridgeHeadline: hasReportHandoff ? resetProBridge.headline : undefined,
      bridgeDecisionQuestion: hasReportHandoff ? resetProBridge.decisionQuestion : undefined,
      bridgeWhyNow: hasReportHandoff ? resetProBridge.whyNow : undefined,
      bridgeLiveProof: hasReportHandoff ? resetProBridge.liveWorkspaceMustProve : undefined,
      bridgePreviewShows: hasReportHandoff ? resetProBridge.privatePreviewShows : undefined,
    })
    navigate(addMarketToPath('/dashboard', market), { replace: true })
  }

  return (
    <section className="min-h-screen bg-[#030304] px-6 pb-20 pt-14 text-white md:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-indigo-300">
            Private Reset Pro Demo
          </p>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            Open the Reset Pro workspace for a controlled demo.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300">
            This gate opens the Reset Pro preview workspace for controlled demos only. It uses demo data,
            does not persist live trades, and must not be treated as account-specific analysis. After
            unlock, the operator lands on a 3-minute path through Mission HQ, slump protocol, alerts,
            edge portfolio, propOS shadow boxing, and append-proof flow.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-neutral-300">
            {[
              'The public story and free report stay open to everyone.',
              'The Reset Pro workspace requires a private code configured at build time.',
              `The demo opens in the ${market} market context and carries the public handoff forward.`,
              'The dashboard opens a founder talk track before the normal workspace cards.',
              'The preview-only boundary stays visible after unlock.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                Founder-controlled access
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Enter private demo code.</h2>
            </div>
            <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] p-3 text-indigo-100">
              <LockKeyhole className="h-5 w-5" />
            </div>
          </div>

          {!configured ? (
            <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 text-sm leading-7 text-amber-100">
              Private demo access is intentionally disabled because <span className="font-mono">{PRIVATE_DEMO_CODE_ENV_KEY}</span> is not configured in this build.
            </div>
          ) : null}

          {hasReportHandoff ? (
            <div className="mb-5 rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] p-4 text-sm leading-7 text-indigo-50/85">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Public-to-private handoff</p>
              <p className="mt-2">
                This unlock will carry <span className="font-mono text-white">{handoffReportId ?? 'direct-report'}</span> into
                the Reset Pro preview as demo routing context. Demo archetype: <span className="text-white">{handoffArchetype.name}</span>.
                Dominant axis: <span className="text-white">{handoffAxis.label}</span>.
              </p>
              {handoffSectionId ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-200">
                    Locked insight intent
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {lockedSection?.title ?? 'Unknown locked module'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-50/75">
                    {lockedSection?.body ?? 'The private demo will preserve the requested section slug, but the section was not found in the current report model.'}
                  </p>
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-200">
                  Evidence boundary
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">
                  {reportSession?.evidenceLabel ?? 'Direct-link fallback only'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-indigo-50/75">
                  {reportSession?.validationSummary ?? 'No local upload-step validation packet was found in this browser. The private demo can still open, but the handoff is URL context only.'}
                </p>
                <p className="mt-3 text-xs leading-5 text-indigo-50/55">
                  {reportSession?.boundary ?? 'Use the public upload page to create a stronger local evidence packet before demoing the report-to-workspace transition.'}
                </p>
                {effectiveStorySource ? (
                  <p className="mt-3 text-xs leading-5 text-indigo-50/55">
                    Story handoff: {effectiveStorySource}. Scenes before upload: {effectiveVisitedSceneCount ?? 0}.
                    {!reportSession && urlStoryHandoff ? ' URL context only.' : ''}
                  </p>
                ) : null}
                {selectedPainAxes.length ? (
                  <p className="mt-3 text-xs leading-5 text-indigo-50/55">
                    Public pain axes: {selectedPainAxes.map((axis) => axis.label).join(', ')}.
                  </p>
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                  Workspace handoff packet
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">
                  What Reset Pro preview receives after unlock.
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {workspaceHandoffFacts.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-emerald-50/60">
                  This packet is demo routing context. It does not become account-specific evidence until a live account activates and uploads production-normalized history.
                </p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Demo code
              </span>
              <input
                type="password"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  setError(null)
                }}
                placeholder="Private code"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-indigo-300/50"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-indigo-200"
            >
              Unlock Reset Pro Preview
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <Link
              to={addMarketToPath(appendCheckoutIntentToPath('/activate', checkoutIntent), market)}
              className="rounded-xl border border-white/10 px-4 py-3 text-center font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Activate Paid Account
            </Link>
            <Link
              to={addMarketToPath('/pricing', market)}
              className="rounded-xl border border-white/10 px-4 py-3 text-center font-semibold text-white transition hover:bg-white hover:text-black"
            >
              View Paid Ladder
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
