import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { addMarketToPath, getPlanForMarket, resolveMarket } from '../../lib/market'
import { appendPublicStoryHandoffParams, readPublicStoryHandoff } from '../../lib/publicStoryHandoff'
import { getPublicReportSession } from '../../lib/publicReportSession'
import { buildFreeReportPreview, buildLockedInsightPreview, toReportSectionSlug } from '../../lib/storyExperience'

const LOCKED_INSIGHT_DECISION_CHECKS = [
  {
    label: 'Public packet',
    body: 'Explains why this module was requested and what the visitor recognized before checkout.',
  },
  {
    label: 'Private question',
    body: 'Names the exact thing Reset Pro or the live workspace must prove from normalized history.',
  },
  {
    label: 'Proof missing',
    body: 'Blocks the answer until activation, upload, generated artifacts, and append history exist.',
  },
] as const

export default function LockedInsightPage() {
  const { section } = useParams()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const params = new URLSearchParams(location.search)
  const reportId = params.get('report') || 'direct-locked-insight'
  const reportSession = getPublicReportSession(reportId)
  const urlStoryHandoff = readPublicStoryHandoff(location.search)
  const effectiveStorySource = reportSession?.storySource ?? urlStoryHandoff?.storySource
  const effectiveSelectedPainAxisIds = reportSession?.selectedPainAxisIds ?? urlStoryHandoff?.selectedPainAxisIds
  const effectiveVisitedSceneCount = reportSession?.visitedSceneCount ?? urlStoryHandoff?.visitedSceneCount
  const effectiveSignalMarkerIds = reportSession?.signalMarkerIds ?? urlStoryHandoff?.signalMarkerIds
  const report = buildFreeReportPreview({
    reportId,
    archetypeId: params.get('archetype'),
    axisId: params.get('axis'),
    storySource: effectiveStorySource,
    selectedPainAxisIds: effectiveSelectedPainAxisIds,
    visitedSceneCount: effectiveVisitedSceneCount,
    signalMarkerIds: effectiveSignalMarkerIds,
  })
  const resetPlan = getPlanForMarket(market, 'reset_monthly')
  const auditPlan = getPlanForMarket(market, 'audit_monthly')
  const requestedSection = report.locked.find((candidate) => toReportSectionSlug(candidate.title) === section)
  const lockedSection = requestedSection ?? report.locked[0]
  const sectionSlug = toReportSectionSlug(lockedSection.title)
  const lockedInsightPreview = buildLockedInsightPreview(report, sectionSlug)
  const publicStoryHandoffForLinks = reportSession || urlStoryHandoff
    ? {
        storySource: report.storyHandoff.source,
        selectedPainAxisIds: report.storyHandoff.selectedPainAxes.map((axis) => axis.id),
        visitedSceneCount: report.storyHandoff.visitedSceneCount,
        signalMarkerIds: report.storyHandoff.signalMarkers.map((marker) => marker.id),
      }
    : null
  const lockedCheckoutQuery = appendPublicStoryHandoffParams(
    new URLSearchParams({
      source: 'locked_insight',
      section: sectionSlug,
      report: report.reportId,
      archetype: report.archetype.id,
      axis: report.dominantAxis.id,
    }),
    publicStoryHandoffForLinks,
  ).toString()
  const checkoutPath = addMarketToPath(
    `/checkout/${resetPlan.checkoutSlug}?${lockedCheckoutQuery}`,
    market,
  )
  const auditCheckoutPath = addMarketToPath(
    `/checkout/${auditPlan.checkoutSlug}?${lockedCheckoutQuery}`,
    market,
  )
  const privateDemoPath = addMarketToPath(
    `/private-demo?${appendPublicStoryHandoffParams(
      new URLSearchParams({
        source: 'locked_insight',
        report: report.reportId,
        archetype: report.archetype.id,
        axis: report.dominantAxis.id,
        section: sectionSlug,
      }),
      publicStoryHandoffForLinks,
    ).toString()}`,
    market,
  )
  const reportPath = addMarketToPath(
    `/report/${encodeURIComponent(report.reportId)}?${appendPublicStoryHandoffParams(
      new URLSearchParams({
        archetype: report.archetype.id,
        axis: report.dominantAxis.id,
      }),
      publicStoryHandoffForLinks,
    ).toString()}`,
    market,
  )

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#030304] px-4 pb-20 pt-14 text-white sm:px-6 md:px-12">
      <div className="mx-0 grid w-full max-w-[22.25rem] min-w-0 gap-8 sm:mx-auto sm:max-w-7xl lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-indigo-300">
            Locked Private Insight
          </p>
          <h1 className="break-words font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            This is where recognition becomes evidence.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300">
            The free report can name the likely leak. The private layer only opens when the trader has a live workspace,
            activation, and a repeatable evidence loop. This page shows what is locked without pretending the public
            preview has already proven account-specific truth.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-5 text-sm leading-7 text-amber-100/90">
            <strong>Boundary:</strong> no buy/sell instruction, no guaranteed profit improvement, and no durable private
            claim from a public URL alone.
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <PublicJourneySpine
            activeStage="insight"
            detail="The private insight page explains the locked module and proof contract before checkout or founder-gated demo access."
          />

          <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-5 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
              Private insight decision gate
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              This page carries a question, not an answer.
            </h2>
            <p className="mt-4 text-sm leading-7 text-emerald-50/75">
              The locked module should make the next private question obvious without pretending the public report has
              already earned a private conclusion.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {LOCKED_INSIGHT_DECISION_CHECKS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-50/70">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                  Requested locked module
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{lockedSection.title}</h2>
                <p className="mt-4 text-sm leading-7 text-neutral-400">{lockedSection.body}</p>
              </div>
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] p-3 text-indigo-100">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {!requestedSection ? (
              <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 text-sm leading-7 text-amber-100">
                Unknown locked section requested. Showing the default highest-cost state module instead.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Origin report', report.reportId],
                ['Public archetype', `${report.archetype.name}: ${report.archetype.title}`],
                ['Predicted axis', report.dominantAxis.label],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.05] p-5 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">
              Private module preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{lockedInsightPreview.sectionTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-indigo-50/75">{lockedInsightPreview.thesis}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {[
                ['Live workspace shows', lockedInsightPreview.liveWorkspaceShows, 'emerald'],
                ['Demo may preview', lockedInsightPreview.demoMayPreview, 'indigo'],
                ['Proof required', lockedInsightPreview.proofRequired, 'amber'],
              ].map(([title, items, tone]) => (
                <div key={title as string} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-base font-semibold text-white">{title as string}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                    {(items as string[]).map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                            tone === 'emerald' ? 'bg-emerald-300' : tone === 'amber' ? 'bg-amber-300' : 'bg-indigo-300'
                          }`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.05] p-5 md:p-8">
            <div className="mb-5 flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                  Evidence status
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {reportSession?.evidenceLabel ?? 'Direct-link fallback only'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-emerald-50/75">
                  {reportSession?.validationSummary ?? 'No local upload-step validation packet was found in this browser. This page can explain the lock, but it cannot claim upload proof.'}
                </p>
                {!reportSession && urlStoryHandoff ? (
                  <p className="mt-3 text-xs leading-5 text-amber-100/75">
                    URL story context only: {urlStoryHandoff.storySource}; scenes {urlStoryHandoff.visitedSceneCount}; axes {urlStoryHandoff.selectedPainAxisIds.length}.
                  </p>
                ) : null}
              </div>
            </div>
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-emerald-50/65">
              {reportSession?.boundary ?? 'Use the upload page to generate a stronger public report packet before presenting the report-to-private-insight transition.'}
            </p>
          </article>

          <article className="rounded-[2rem] border border-violet-300/20 bg-violet-300/[0.06] p-5 md:p-8">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-200">
                  Founder demo continuation
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Carry this locked question into Reset Pro.
                </h2>
                <p className="mt-4 text-sm leading-7 text-violet-50/75">
                  The private demo gate receives the report, archetype, dominant axis, story handoff, and locked module.
                  It can show the operating structure with sample data only; it still cannot answer this question as live truth.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
                  Demo packet to carry
                </p>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-neutral-300">
                  {[ 
                    `Locked module: ${lockedSection.title}.`,
                    `Bridge question: ${report.resetProBridge.decisionQuestion}`,
                    `Evidence status: ${reportSession?.evidenceLabel ?? 'direct-link fallback only'}.`,
                    report.storyHandoff.signalMarkers.length
                      ? `Public signal markers: ${report.storyHandoff.signalMarkers.map((marker) => marker.label).join(', ')}.`
                      : 'Public signal markers: none attached.',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/8 bg-black/25 p-3">
                      {item}
                    </div>
                  ))}
                </div>
                <Link
                  to={privateDemoPath}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                >
                  Continue To Private Demo Gate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.06] p-5 md:p-8">
            <h2 className="text-2xl font-semibold text-white">What unlocks here</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <h3 className="text-base font-semibold text-white">Private claim requirements</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                  {report.privateInsightGate.evidenceRequired.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <h3 className="text-base font-semibold text-white">Claims this page refuses</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                  {report.privateInsightGate.refusesToClaim.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to={checkoutPath}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
              >
                Unlock with {resetPlan.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={privateDemoPath}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-300/30 px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50 hover:bg-indigo-300/[0.08]"
              >
                Open Private Demo Gate
              </Link>
              <Link
                to={auditCheckoutPath}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                Start {auditPlan.name}
              </Link>
              <Link
                to={reportPath}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                Back to Free Report
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
