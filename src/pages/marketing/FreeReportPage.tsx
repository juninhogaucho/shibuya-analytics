import { useEffect, useState } from 'react'
import { ArrowRight, Lock, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { BehavioralFingerprint } from '../../components/landing/BehavioralFingerprint'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { addMarketToPath, getPlanForMarket, resolveMarket } from '../../lib/market'
import { buildLiveProofReadinessContract } from '../../lib/liveProofReadiness'
import { appendPublicStoryHandoffParams, readPublicStoryHandoff } from '../../lib/publicStoryHandoff'
import {
  appendDemoLauncherSamplePacketParam,
  buildDemoLauncherSampleReportSession,
  hasDemoLauncherSamplePacketRequest,
  isDemoLauncherSampleReportSession,
  persistPublicReportSession,
} from '../../lib/publicReportSession'
import { usePublicReportSessionRecovery } from '../../lib/publicReportRecovery'
import {
  buildPublicReportEngagementRows,
  getPublicReportEngagement,
  recordLockedSectionIntent,
  recordPublicReportView,
} from '../../lib/publicReportEngagement'
import {
  buildFreeReportPreview,
  getFingerprintAxis,
  getGuidedLockedSectionForAxis,
  getTraderArchetype,
  toReportSectionSlug,
} from '../../lib/storyExperience'

const LIVE_PROOF_STATUS_LABELS = {
  ready: 'READY',
  blocked: 'BLOCKED',
  required: 'REQUIRED',
} as const

const REPORT_REVEAL_SEQUENCE = [
  {
    timebox: '0:00',
    label: 'Baseline reveal',
    title: 'Name what survived the story.',
    body: 'Start with archetype, dominant axis, and pressure band. Do not bury the trader in cards before the report has one clear thesis.',
    boundary: 'Website-level recognition plus local packet context only.',
  },
  {
    timebox: '0:40',
    label: 'Evidence receipt',
    title: 'Show what the packet can prove.',
    body: 'Explain whether this came from a guided story, local sample, pasted table, or direct URL fallback before showing private modules.',
    boundary: 'No raw rows or live backend artifact are proven on this public page.',
  },
  {
    timebox: '1:20',
    label: 'Private question',
    title: 'Open one locked door.',
    body: 'Route to the locked module that matches the dominant axis instead of making the visitor browse every possible feature.',
    boundary: 'The locked module carries a question, not an answer.',
  },
  {
    timebox: '2:10',
    label: 'Reset Pro bridge',
    title: 'End with the operating loop.',
    body: 'Make the next step explicit: private workspace, sample boundary, and append proof are how the product becomes real.',
    boundary: 'Account-specific claims wait for activation, upload, generated artifacts, and append history.',
  },
] as const

export default function FreeReportPage() {
  const { id } = useParams()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const params = new URLSearchParams(location.search)
  const reportId = id ?? 'sample-free-report'
  const archetype = getTraderArchetype(params.get('archetype'))
  const axis = getFingerprintAxis(params.get('axis'))
  const currentStoryHandoff = readPublicStoryHandoff(location.search)
  const reportSessionRecovery = usePublicReportSessionRecovery({
    reportId,
    market,
    archetypeId: archetype.id,
    axisId: axis.id,
    storySource: currentStoryHandoff?.storySource ?? params.get('story'),
    selectedPainAxisIds: currentStoryHandoff?.selectedPainAxisIds,
    visitedSceneCount: currentStoryHandoff?.visitedSceneCount,
    signalMarkerIds: currentStoryHandoff?.signalMarkerIds,
    disabled: hasDemoLauncherSamplePacketRequest(location.search),
  })
  const storedReportSession = reportSessionRecovery.session
  const hasStoredReportSession = Boolean(storedReportSession)
  const urlStoryHandoff = readPublicStoryHandoff(location.search)
  const demoLauncherSession =
    hasStoredReportSession || !hasDemoLauncherSamplePacketRequest(location.search)
      ? null
      : buildDemoLauncherSampleReportSession({
        reportId,
        market,
        archetypeId: archetype.id,
        axisId: axis.id,
        storySource: currentStoryHandoff?.storySource ?? params.get('story'),
        selectedPainAxisIds: currentStoryHandoff?.selectedPainAxisIds,
        visitedSceneCount: currentStoryHandoff?.visitedSceneCount,
        signalMarkerIds: currentStoryHandoff?.signalMarkerIds,
      })
  const reportSession = storedReportSession ?? demoLauncherSession
  const shouldCarryDemoLauncherPacket =
    isDemoLauncherSampleReportSession(reportSession) || hasDemoLauncherSamplePacketRequest(location.search)

  useEffect(() => {
    if (demoLauncherSession) {
      persistPublicReportSession(demoLauncherSession)
    }
  }, [demoLauncherSession])
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
  const [reportEngagement, setReportEngagement] = useState(() => getPublicReportEngagement(report.reportId))
  const selectedPainAxes = report.storyHandoff.selectedPainAxes
  const guidedLockedSection = getGuidedLockedSectionForAxis(report)
  const guidedLockedSectionSlug = toReportSectionSlug(guidedLockedSection.title)
  const resetPlan = getPlanForMarket(market, 'reset_monthly')
  const publicStoryHandoffForLinks = reportSession || urlStoryHandoff
    ? {
        storySource: report.storyHandoff.source,
        selectedPainAxisIds: report.storyHandoff.selectedPainAxes.map((axis) => axis.id),
        visitedSceneCount: report.storyHandoff.visitedSceneCount,
        signalMarkerIds: report.storyHandoff.signalMarkers.map((marker) => marker.id),
      }
    : null
  const guidedInsightQuery = appendPublicStoryHandoffParams(
    new URLSearchParams({
      source: 'guided_report',
      report: report.reportId,
      archetype: report.archetype.id,
      axis: report.dominantAxis.id,
    }),
    publicStoryHandoffForLinks,
  )
  const guidedInsightSearch = appendDemoLauncherSamplePacketParam(guidedInsightQuery, shouldCarryDemoLauncherPacket).toString()
  const guidedInsightPath = addMarketToPath(`/insight/${guidedLockedSectionSlug}?${guidedInsightSearch}`, market)
  const reportEngagementRows = buildPublicReportEngagementRows(reportEngagement)
  const reportLiveProofGap = reportSession?.liveProofGap ?? buildLiveProofReadinessContract()
  const reportPacketFallbackLabel =
    reportSessionRecovery.status === 'loading'
      ? 'Checking backend teaser receipt'
      : 'No local upload packet found'
  const reportPacketFallbackSummary =
    reportSessionRecovery.status === 'loading'
      ? 'Checking Medallion for a persisted public teaser receipt before falling back to URL context.'
      : reportSessionRecovery.status === 'failed'
        ? `Backend teaser recovery failed: ${reportSessionRecovery.error}. This direct report route is URL context only.`
        : 'This report was opened directly. It can show the public fingerprint preview, but it does not have upload-step validation metadata in this browser.'
  const reportPacketFallbackFacts =
    reportSessionRecovery.attemptedBackendRecovery && reportSessionRecovery.status === 'failed'
      ? [
          'Medallion public teaser receipt recovery was attempted and failed.',
          'Story signal came from URL parameters only.',
          'No raw trade rows, file metadata, or backend receipt is attached in this browser.',
        ]
      : [
          'Story signal came from URL parameters only.',
          'No raw trade rows, file metadata, or local validation packet is attached.',
          'Use the upload page to generate a report with a local evidence handoff.',
        ]

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReportEngagement(recordPublicReportView(report.reportId))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [report.reportId])

  const markLockedSectionIntent = (sectionId: string) => {
    setReportEngagement(recordLockedSectionIntent(report.reportId, sectionId))
  }

  const reportToPrivateHandoffRows = [
    {
      label: 'Carries forward',
      value: `${report.archetype.name} / ${report.dominantAxis.label}`,
      body: 'The locked insight receives the report id, market, archetype, dominant axis, story handoff, and public signal markers.',
    },
    {
      label: 'Private question carried',
      value: guidedLockedSection.title,
      body: report.resetProBridge.decisionQuestion,
    },
    {
      label: 'Proof remains locked',
      value: reportSession?.evidenceLabel ?? 'URL context only',
      body: 'The next page may preserve context and show the proof contract, but it cannot answer the private question without live evidence.',
    },
  ] as const

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#030304] px-4 pb-20 pt-14 text-white sm:px-6 md:px-12">
      <div className="mx-0 w-full max-w-[22.25rem] min-w-0 sm:mx-auto sm:max-w-7xl">
        <div className="mb-10 grid min-w-0 gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="min-w-0">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-emerald-300">Free Behavioral Leak Report</p>
            <h1
              aria-label="Your baseline is forming."
              className="break-words font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl"
            >
              <span className="block">Your baseline is</span>
              <span className="block">forming.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300">
              Report ID <span className="font-mono text-neutral-100">{report.reportId}</span>. This preview unlocks one sharp recognition point and shows what remains locked until the trader chooses a live workspace.
            </p>
            <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Public report packet</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {reportSession?.evidenceLabel ?? reportPacketFallbackLabel}
              </h2>
              <div className="mt-4 grid gap-3 text-xs leading-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="block font-mono uppercase tracking-[0.18em] text-emerald-100">Artifact status</span>
                  <strong className="mt-1 block text-sm text-white">
                    {reportSession?.artifactStatusLabel ?? 'URL context only'}
                  </strong>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="block font-mono uppercase tracking-[0.18em] text-emerald-100">Live/private artifact</span>
                  <strong className="mt-1 block text-sm text-white">
                    {reportSession?.productionArtifactProven ? 'Proven' : 'Not proven'}
                  </strong>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="block font-mono uppercase tracking-[0.18em] text-emerald-100">Proof boundary</span>
                  <strong className="mt-1 block text-sm text-white">Backend required</strong>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-emerald-50/80">
                {reportSession?.validationSummary ?? reportPacketFallbackSummary}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-emerald-50/75">
                {(reportSession?.validationFacts ?? reportPacketFallbackFacts).map((fact) => (
                  <li key={fact} className="flex gap-2">
                    <span className="text-emerald-300">-</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-6 text-emerald-50/60">
                {reportSession?.boundary ?? 'Direct-link fallback only. Production analytics still require backend normalization and generated artifacts.'}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Pressure Index</p>
                <p className="mt-1 font-mono text-2xl font-black text-white">{report.pressureIndex}/100</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Suggested path</p>
                <p className="mt-1 text-lg font-semibold text-white">{report.recommendedPath.label}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Dominant predicted axis</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{report.dominantAxis.label}</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-400">{report.dominantAxis.description}</p>
          </div>
        </div>

        <div className="mb-8">
          <PublicJourneySpine
            activeStage="report"
            detail="The report gives a useful baseline and names the private question. It still does not cross into account-specific truth without live evidence."
          />
        </div>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.055] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200">
                Report live-proof gap
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{reportLiveProofGap.headline}</h2>
            </div>
            <div>
              <span className="inline-flex rounded-full border border-amber-200/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100">
                {reportLiveProofGap.statusLabel}
              </span>
              <p className="mt-3 text-sm leading-7 text-amber-50/75">
                This ledger came from the upload/report packet when available. It is the machine-readable proof gap the
                locked insight and private demo must keep visible.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {reportLiveProofGap.rows.map((row) => (
              <article key={row.label} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">
                  {LIVE_PROOF_STATUS_LABELS[row.status]}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">{row.label}</h3>
                <p className="mt-3 text-sm leading-6 text-amber-50/70">{row.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-amber-50/60">
            Gap ledger rule: the report may route the private question, but required evidence stays incomplete until a live
            account proves activation, first meaningful upload, generated artifacts, and append history.
          </p>
        </section>

        <section className="mb-8 min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070708]">
          <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-white/10 p-5 md:p-8 lg:border-b-0 lg:border-r">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                Report reveal sequence
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
                Keep the report cinematic: one baseline, one packet, one private question.
              </h2>
              <p className="mt-5 text-sm leading-7 text-neutral-300 md:text-base md:leading-8">
                The report should feel like the second act of the same story: the public mirror becomes a baseline,
                the packet explains what evidence exists, and the locked insight names the question Reset Pro must prove later.
              </p>
              <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs leading-6 text-amber-50/75">
                Report reveal rule: do not let the report become a dashboard tour. It should route the next decision while keeping account-specific truth locked.
              </div>
            </div>

            <div className="grid md:grid-cols-2">
              {REPORT_REVEAL_SEQUENCE.map((beat) => (
                <article key={beat.label} className="border-b border-white/10 p-5 last:border-b-0 md:border-r md:[&:nth-child(even)]:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-100">
                    {beat.timebox} / {beat.label}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold leading-tight text-white">{beat.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">{beat.body}</p>
                  <p className="mt-4 rounded-2xl border border-white/8 bg-black/25 p-3 text-xs leading-5 text-neutral-400">
                    Boundary: {beat.boundary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">Guided continuation</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">The next click should answer one private question.</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                For a live walkthrough, do not browse every locked module. Carry this report into the module that best matches the dominant axis:
                <span className="font-semibold text-white"> {guidedLockedSection.title}</span>.
              </p>
            </div>
            <div className="rounded-3xl border border-indigo-300/20 bg-indigo-300/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Presenter path</p>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-neutral-300">
                {[
                  `Story predicted ${report.archetype.name} / ${report.dominantAxis.label}.`,
                  reportSession ? `${reportSession.evidenceLabel}: ${reportSession.validationSummary}` : 'Direct report route: URL context only.',
                  `Locked question: ${guidedLockedSection.title}.`,
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/25 p-3">
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to={guidedInsightPath}
                onClick={() => markLockedSectionIntent(guidedLockedSectionSlug)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
              >
                Continue Guided Storyline
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-violet-300/20 bg-violet-300/[0.055] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-200">
                Report-to-private handoff receipt
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                The report can carry context. It cannot carry the answer.
              </h2>
            </div>
            <p className="text-sm leading-7 text-violet-50/75">
              This receipt is the bridge between public report and locked insight. It makes the next private click explicit
              without pretending the free report has already proven trader-specific truth.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {reportToPrivateHandoffRows.map((row) => (
              <article key={row.label} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-100">{row.label}</p>
                <h3 className="mt-2 text-base font-semibold text-white">{row.value}</h3>
                <p className="mt-3 text-sm leading-6 text-violet-50/70">{row.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-violet-50/60">
            Handoff receipt rule: the locked insight inherits the question and evidence status only; live activation,
            normalized upload, generated artifacts, and append history must still produce the answer.
          </p>
        </section>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.055] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                Report engagement ledger
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Conversion intent is tracked locally. It is not trader evidence.
              </h2>
            </div>
            <p className="text-sm leading-7 text-cyan-50/75">
              The free report can notice attention signals like a reopen or locked-module click. Those signals help route
              the journey; they cannot upgrade a public preview into account-specific truth.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {reportEngagementRows.map((row) => (
              <article key={row.label} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">{row.label}</p>
                <h3 className="mt-2 text-base font-semibold text-white">{row.value}</h3>
                <p className="mt-3 text-sm leading-6 text-cyan-50/70">{row.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-cyan-50/60">
            Engagement ledger rule: report views, locked-section clicks, and private-demo intent are stored as local routing
            metadata only. No raw trade rows, payment proof, backend artifacts, or private conclusion are stored here.
          </p>
        </section>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.05] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">Prediction survival check</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What survived from the public story?</h2>
            </div>
            <p className="text-sm leading-7 text-indigo-50/75">
              The free report should not pretend the website prediction became truth. It should show the handoff:
              public recognition, local upload/sample validation, then the private proof still required.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Public prediction</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{report.archetype.name} / {report.dominantAxis.label}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                  {report.storyHandoff.source === 'guided'
                  ? report.storyHandoff.summary
                  : 'Direct report route. No guided StoryExperience packet was attached in this browser.'}
              </p>
              {!reportSession && urlStoryHandoff ? (
                <p className="mt-3 text-xs leading-5 text-amber-100/70">
                  URL story context only. This preserves the public journey signal, but it is weaker than a local upload packet.
                </p>
              ) : null}
                <p className="mt-3 text-xs leading-5 text-indigo-50/60">
                  Public pain axes: {selectedPainAxes.length ? selectedPainAxes.map((axis) => axis.label).join(', ') : 'none captured'}.
                </p>
                {report.storyHandoff.signalMarkers.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-200">Why this report path exists</p>
                    <ul className="mt-3 space-y-2 text-xs leading-5 text-indigo-50/70">
                      {report.storyHandoff.signalMarkers.map((marker) => (
                        <li key={marker.id}>
                          <span className="font-semibold text-white">{marker.label}:</span> {marker.body}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-3 text-xs leading-5 text-indigo-50/60">{report.storyHandoff.boundary}</p>
              </article>

            <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Local packet</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{reportSession?.evidenceLabel ?? 'URL context only'}</h3>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                Artifact status: {reportSession?.artifactStatusLabel ?? 'URL context only'}
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                {reportSession?.validationSummary ?? 'No local upload/sample validation packet was found. This page can explain the preview, but cannot prove the upload handoff.'}
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200">Still locked</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Private proof loop</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Live workspace evidence must still prove the pattern from normalized history, activation state, and repeated append packets before Shibuya makes account-specific private claims.
              </p>
            </article>
          </div>
        </section>

        <section className="mb-8 min-w-0 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.05] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">Reset Pro bridge</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What the private workspace must decide next.</h2>
            </div>
            <p className="text-sm leading-7 text-emerald-50/75">
              {report.resetProBridge.headline} The free report creates the question; the live workspace has to prove the answer with activation, upload, and append history.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Decision question</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{report.resetProBridge.decisionQuestion}</h3>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{report.resetProBridge.whyNow}</p>
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-emerald-50/65">
                This bridge is a product handoff, not a live diagnosis. Reset Pro sample mode can demonstrate the workflow; only the live account can produce account-specific proof.
              </p>
            </article>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <h3 className="text-base font-semibold text-white">Live workspace must prove</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                  {report.resetProBridge.liveWorkspaceMustProve.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <h3 className="text-base font-semibold text-white">Private demo may show</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                  {report.resetProBridge.privatePreviewShows.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="min-w-0 space-y-5">
            <BehavioralFingerprint scores={report.scores} />
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-sm leading-7 text-amber-100/90">
              <strong>Not a trade call.</strong> Shibuya describes state. It does not tell traders what instrument to buy, sell, hold, or avoid.
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <UnlockKeyhole className="h-5 w-5 text-emerald-300" />
                <h2 className="text-2xl font-semibold text-white">Unlocked preview</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {report.unlocked.map((item) => (
                  <article key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{item.label}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.value}</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-400">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-5 w-5 text-indigo-300" />
                <h2 className="text-2xl font-semibold text-white">Locked until live workspace</h2>
              </div>
              <div className="grid gap-3">
                {report.locked.map((item) => (
                  <Link
                    key={item.title}
                    to={addMarketToPath(
                      `/insight/${toReportSectionSlug(item.title)}?${appendDemoLauncherSamplePacketParam(
                        appendPublicStoryHandoffParams(
                          new URLSearchParams({
                            source: 'locked_report',
                            report: report.reportId,
                            archetype: report.archetype.id,
                            axis: report.dominantAxis.id,
                          }),
                          publicStoryHandoffForLinks,
                        ),
                        shouldCarryDemoLauncherPacket,
                      ).toString()}`,
                      market,
                    )}
                    onClick={() => markLockedSectionIntent(toReportSectionSlug(item.title))}
                    className="group flex gap-4 rounded-3xl border border-white/8 bg-black/25 p-5 transition hover:border-indigo-300/40 hover:bg-indigo-300/[0.06]"
                    aria-label={`Unlock ${item.title}`}
                  >
                    <Lock className="mt-1 h-4 w-4 shrink-0 text-neutral-500" />
                    <div>
                      <h3 className="text-base font-semibold text-white transition group-hover:text-indigo-100">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">{item.body}</p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                        Unlock with {resetPlan.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                {report.conversionLine}
              </p>
            </section>

            <section className="rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.06] p-5 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">Private insight contract</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{report.privateInsightGate.headline}</h2>
                  <p className="mt-4 text-sm leading-7 text-indigo-50/75">{report.privateInsightGate.body}</p>
                </div>
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-base font-semibold text-white">Evidence required before private claims</h3>
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
                  <h3 className="text-base font-semibold text-white">Boundary the demo keeps visible</h3>
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

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm leading-7 text-neutral-300">{report.privateInsightGate.demoPromise}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={guidedInsightPath}
                    onClick={() => markLockedSectionIntent(guidedLockedSectionSlug)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                  >
                    Open Locked Insight First
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={guidedInsightPath}
                    onClick={() => markLockedSectionIntent(guidedLockedSectionSlug)}
                    className="inline-flex items-center justify-center rounded-xl border border-indigo-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50 hover:bg-indigo-300/[0.08]"
                  >
                    Continue Via Locked Insight
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              <Link
                to={guidedInsightPath}
                onClick={() => markLockedSectionIntent(guidedLockedSectionSlug)}
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
              >
                Open {guidedLockedSection.title}
              </Link>
              <Link
                to={addMarketToPath('/pricing', market)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                View Paid Ladder
              </Link>
              <Link
                to={guidedInsightPath}
                onClick={() => markLockedSectionIntent(guidedLockedSectionSlug)}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-300/30 bg-indigo-300/[0.08] px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50"
              >
                Private Insight Gate
              </Link>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
