import { type FormEvent, useEffect, useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { appendCheckoutIntentToPath, readCheckoutIntent } from '../../lib/checkoutIntent'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import { readPublicStoryHandoff } from '../../lib/publicStoryHandoff'
import {
  PRIVATE_DEMO_CODE_ENV_KEY,
  PRIVATE_DEMO_UNLOCK_BOUNDARY,
  buildPrivateDemoUnlockReceiptId,
  enterPrivateResetProDemo,
  hasPrivateDemoGateConfigured,
  type PrivateResetProDemoHandoff,
  verifyPrivateDemoCode,
} from '../../lib/privateDemoAccess'
import {
  appendDemoLauncherSamplePacketToPath,
  buildDemoLauncherSampleReportSession,
  getPublicReportSession,
  hasDemoLauncherSamplePacketRequest,
  isDemoLauncherSampleReportSession,
  persistPublicReportSession,
} from '../../lib/publicReportSession'
import {
  buildPublicReportEngagementRows,
  buildPublicReportEngagementSummary,
  getPublicReportEngagement,
} from '../../lib/publicReportEngagement'
import {
  buildFreeReportPreview,
  findLockedReportSectionBySlug,
  getFingerprintAxis,
  getTraderArchetype,
  toReportSectionSlug,
} from '../../lib/storyExperience'

const PRIVATE_DEMO_OPERATOR_RUNBOOK = [
  {
    label: '1. Open Mission HQ',
    body: 'Start from the carried public pain, current enemy, and next-session mandate.',
  },
  {
    label: '2. Show the private question',
    body: 'Use the Reset Pro bridge only as the question live data must prove, not as the answer.',
  },
  {
    label: '3. Inspect intervention surfaces',
    body: 'Show slump protocol, alerts, edge portfolio, and propOS angle as decision support.',
  },
  {
    label: '4. Close on append proof',
    body: 'End at upload/append so the viewer sees that progress requires new evidence.',
  },
] as const

const PRIVATE_DEMO_CLAIM_SCRIPT = [
  {
    label: 'Say',
    value: 'This is the Reset Pro operating loop Shibuya is building toward.',
    body: 'Frame the sample workspace as product structure: mission, question, interventions, and append proof.',
  },
  {
    label: 'Show',
    value: 'One carried question, one intervention surface, one append-proof close.',
    body: 'Keep the walkthrough under three minutes and avoid wandering through every dashboard card.',
  },
  {
    label: 'Refuse',
    value: 'Do not claim live activation, backend normalization, or account-specific improvement.',
    body: 'Those claims require configured backend, real uploads, generated artifacts, durable append history, and measured deltas.',
  },
] as const

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
  const postUnlockDestination = params.get('destination') === 'append_proof' ? 'append_proof' : 'mission_hq'
  const postUnlockPath = addMarketToPath(
    postUnlockDestination === 'append_proof' ? '/dashboard/upload' : '/dashboard',
    market,
  )
  const checkoutIntent = readCheckoutIntent(location.search)
  const hasReportHandoff = ['free_report', 'locked_insight'].includes(handoffSource ?? '') || Boolean(handoffReportId)
  const hasLockedInsightHandoff = handoffSource === 'locked_insight' && Boolean(handoffReportId) && Boolean(handoffSectionId)
  const storedReportSession = getPublicReportSession(handoffReportId)
  const hasStoredReportSession = Boolean(storedReportSession)
  const urlStoryHandoff = readPublicStoryHandoff(location.search)
  const currentStoryHandoff = readPublicStoryHandoff(location.search)
  const demoLauncherSession =
    hasStoredReportSession || !handoffReportId || !hasDemoLauncherSamplePacketRequest(location.search)
      ? null
      : buildDemoLauncherSampleReportSession({
        reportId: handoffReportId,
        market,
        archetypeId: handoffArchetype.id,
        axisId: handoffAxis.id,
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
  const handoffReport = buildFreeReportPreview({
    reportId: handoffReportId,
    archetypeId: params.get('archetype'),
    axisId: params.get('axis'),
    storySource: effectiveStorySource,
    selectedPainAxisIds: effectiveSelectedPainAxisIds,
    visitedSceneCount: effectiveVisitedSceneCount,
    signalMarkerIds: effectiveSignalMarkerIds,
  })
  const privateGateEngagement = getPublicReportEngagement(handoffReport.reportId)
  const privateGateEngagementRows = buildPublicReportEngagementRows(privateGateEngagement, handoffSectionId)
  const privateGateEngagementSummary = buildPublicReportEngagementSummary(privateGateEngagement, handoffSectionId)
  const hasLockedSectionIntentProof = privateGateEngagementSummary.currentSectionClickCount > 0
  const routeIntegrityReady = hasLockedInsightHandoff && (hasLockedSectionIntentProof || shouldCarryDemoLauncherPacket)
  const selectedPainAxes = handoffReport.storyHandoff.selectedPainAxes
  const lockedSection = findLockedReportSectionBySlug(handoffReport, handoffSectionId)
  const resetProBridge = handoffReport.resetProBridge
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [boundaryAcknowledged, setBoundaryAcknowledged] = useState(false)
  const configured = hasPrivateDemoGateConfigured()
  const preflightChecks = [
    {
      label: 'Public context',
      value: reportSession?.evidenceLabel ?? (hasReportHandoff ? 'URL context only' : 'Direct private-demo entry'),
      body: reportSession?.validationSummary
        ?? (hasReportHandoff
          ? 'The link carries story/report intent, but this browser has no local upload validation packet.'
          : 'No public story or report handoff is attached. Use only if you are intentionally opening the workspace cold.'),
    },
    {
      label: 'Route integrity',
      value: routeIntegrityReady
        ? 'Locked insight intent verified'
        : hasReportHandoff
          ? 'Blocked: open locked insight first'
          : 'Blocked: start from story/report',
      body: routeIntegrityReady
        ? 'The founder gate can open because this browser has a locked-section intent receipt or a controlled launcher packet.'
        : hasReportHandoff
          ? 'Private demo unlocks require a local locked-section intent receipt or an explicit controlled launcher packet. A URL alone is not enough.'
          : 'Cold private-demo unlocks are disabled. Start from StoryExperience, upload/report, locked insight, or the IFX demo launcher so Reset Pro receives a real question.',
    },
    {
      label: 'Locked question',
      value: lockedSection?.title ?? handoffSectionId ?? 'No locked module attached',
      body: routeIntegrityReady
        ? resetProBridge.decisionQuestion
        : hasLockedInsightHandoff
          ? 'A locked insight URL is attached, but the private demo stays blocked until this browser records the locked-section intent or carries a controlled launcher packet.'
          : hasReportHandoff
            ? 'A report is attached, but the private demo stays blocked until a locked insight module carries the question.'
          : 'No public report question is attached, so the operator must frame this as a generic sample preview.',
    },
    {
      label: 'Access gate',
      value: configured ? 'Private demo code configured' : 'Private demo disabled in this build',
      body: configured
        ? 'The workspace can be unlocked with the founder-controlled code configured at build time.'
        : `Configure ${PRIVATE_DEMO_CODE_ENV_KEY} before sharing this demo path.`,
    },
    {
      label: 'Live proof',
      value: 'Still missing by design',
      body: 'This demo does not prove live activation, live upload, generated artifacts, durable append history, or account-specific conclusions.',
    },
    {
      label: 'Post-unlock destination',
      value: postUnlockDestination === 'append_proof' ? 'Append proof close after unlock' : 'Mission HQ first',
      body: postUnlockDestination === 'append_proof'
        ? 'This public shortcut still requires the founder gate, then opens the append-proof endpoint with Reset Pro sample context attached.'
        : 'The normal demo opens Mission HQ first, then the operator closes on append proof.',
    },
  ]
  const workspaceHandoffFacts = [
    ['Source', hasReportHandoff ? handoffSource ?? 'report_link' : 'direct_private_demo'],
    ['Market', market],
    ['Report', handoffReportId ?? 'not attached'],
    ['Archetype', hasReportHandoff ? `${handoffArchetype.name}: ${handoffArchetype.title}` : 'not attached'],
    ['Dominant axis', hasReportHandoff ? handoffAxis.label : 'not attached'],
    ['Story handoff', effectiveStorySource ? `${effectiveStorySource}; scenes ${effectiveVisitedSceneCount ?? 0}` : 'not attached'],
    ['Public signal markers', handoffReport.storyHandoff.signalMarkers.length ? handoffReport.storyHandoff.signalMarkers.map((marker) => marker.label).join(', ') : 'not attached'],
    ['Evidence packet', reportSession?.evidenceLabel ?? (hasReportHandoff ? 'direct-link fallback only' : 'demo entry only')],
    ['Locked module', lockedSection?.title ?? handoffSectionId ?? 'not attached'],
    ['Bridge question', hasReportHandoff ? resetProBridge.decisionQuestion : 'not attached'],
  ]
  const storyContextChecksum = effectiveStorySource
    ? `story=${effectiveStorySource}; scene_count=${effectiveVisitedSceneCount ?? 0}; pain_axes=${effectiveSelectedPainAxisIds?.join(',') || 'none'}; signals=${effectiveSignalMarkerIds?.join(',') || 'none'}`
    : 'story context not attached'
  const privateGateChecksum = hasReportHandoff
    ? `source=${handoffSource ?? 'report_link'}; report=${handoffReport.reportId}; section=${lockedSection ? toReportSectionSlug(lockedSection.title) : handoffSectionId ?? 'no-locked-module'} | archetype=${handoffArchetype.id}; axis=${handoffAxis.id} | ${storyContextChecksum} | sample route, not live answer`
    : 'source=direct_private_demo; report=no-report; section=no-locked-module | archetype=none; axis=none | story context not attached | sample route, not live answer'
  const workspaceHandoffFactsWithChecksum = [
    ...workspaceHandoffFacts,
    ['Private gate checksum', privateGateChecksum],
  ]
  const unlockManifestRows = [
    {
      label: 'Stored after unlock',
      value: routeIntegrityReady
        ? 'sample mode, market, report, archetype, dominant axis, locked module, bridge question, public signal markers, private gate checksum'
        : 'nothing; URL-only, report-only, and cold private-demo unlocks are blocked',
      body: routeIntegrityReady
        ? 'These values seed the Reset Pro preview so the command center can open with the right context.'
        : 'The private workspace should not open without a locked-section intent receipt or controlled launcher packet because there is no verified private question to test.',
    },
    {
      label: 'Not stored or proven',
      value: 'raw visitor trades, payment proof, live backend artifacts, account-specific conclusions',
      body: 'The private demo stays a controlled sample workspace even when the URL carries report context.',
    },
    {
      label: 'First screen after unlock',
      value: postUnlockDestination === 'append_proof'
        ? 'Append proof close with Reset Pro sample context'
        : 'Mission HQ with the Reset Pro operator strip',
      body: postUnlockDestination === 'append_proof'
        ? 'Use this only as the public recovery shortcut for closing the demo; the sample context is still founder-gated.'
        : 'Start there, show one intervention surface, then close on append proof.',
    },
  ]
  const privateDemoHandoff: PrivateResetProDemoHandoff = {
    source: routeIntegrityReady ? handoffSource : undefined,
    reportId: routeIntegrityReady ? handoffReportId : undefined,
    archetypeId: routeIntegrityReady ? handoffArchetype.id : undefined,
    axisId: routeIntegrityReady ? handoffAxis.id : undefined,
    reportSource: routeIntegrityReady ? reportSession?.source ?? 'direct_link' : undefined,
    evidenceLabel: routeIntegrityReady ? reportSession?.evidenceLabel : undefined,
    validationSummary: routeIntegrityReady ? reportSession?.validationSummary : undefined,
    storySource: routeIntegrityReady ? effectiveStorySource : undefined,
    selectedPainAxisIds: routeIntegrityReady ? effectiveSelectedPainAxisIds : undefined,
    visitedSceneCount: routeIntegrityReady ? effectiveVisitedSceneCount : undefined,
    signalMarkerIds: routeIntegrityReady ? handoffReport.storyHandoff.signalMarkers.map((marker) => marker.id) : undefined,
    lockedSectionId: routeIntegrityReady ? lockedSection ? toReportSectionSlug(lockedSection.title) : handoffSectionId : undefined,
    lockedSectionTitle: routeIntegrityReady ? lockedSection?.title : undefined,
    bridgeHeadline: routeIntegrityReady ? resetProBridge.headline : undefined,
    bridgeDecisionQuestion: routeIntegrityReady ? resetProBridge.decisionQuestion : undefined,
    bridgeWhyNow: routeIntegrityReady ? resetProBridge.whyNow : undefined,
    bridgeLiveProof: routeIntegrityReady ? resetProBridge.liveWorkspaceMustProve : undefined,
    bridgePreviewShows: routeIntegrityReady ? resetProBridge.privatePreviewShows : undefined,
    privateGateChecksum,
    engagementReportViewCount: privateGateEngagementSummary.reportViewCount,
    engagementLockedSectionClickCount: privateGateEngagementSummary.lockedSectionClickCount,
    engagementCurrentSectionClickCount: privateGateEngagementSummary.currentSectionClickCount,
    engagementPrivateDemoIntentCount: privateGateEngagementSummary.privateDemoIntentCount,
    engagementBoundary: privateGateEngagementSummary.boundary,
    demoEntryMode: postUnlockDestination === 'append_proof' ? 'append_proof_shortcut' : 'mission_hq',
  }
  const unlockReceiptId = buildPrivateDemoUnlockReceiptId(market, privateDemoHandoff)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!routeIntegrityReady) {
      setError('Open a locked private insight from the report before the private demo so Reset Pro receives a verified private question.')
      return
    }

    const result = verifyPrivateDemoCode(code)

    if (!result.ok) {
      setError(
        result.reason === 'not_configured'
          ? `Private demo access is disabled in this build. Configure ${PRIVATE_DEMO_CODE_ENV_KEY} before sharing a Reset Pro demo.`
          : 'That demo code does not unlock the private Reset Pro workspace.',
      )
      return
    }

    if (!boundaryAcknowledged) {
      setError('Acknowledge the evidence boundary before unlocking the private Reset Pro workspace.')
      return
    }

    enterPrivateResetProDemo(market, privateDemoHandoff)
    navigate(postUnlockPath, { replace: true })
  }

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#030304] px-4 pb-20 pt-14 text-white sm:px-6 md:px-12">
      <div className="mx-0 grid w-full max-w-[22.25rem] min-w-0 gap-8 sm:mx-auto sm:max-w-6xl lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-indigo-300">
            Private Reset Pro Demo
          </p>
          <h1 className="break-words font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
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

        <div className="min-w-0 rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
          <div className="mb-6">
            <PublicJourneySpine
              activeStage="demo"
              detail="This is the controlled sample workspace handoff. It demonstrates structure only; live proof still requires activation, upload, backend artifacts, and append history."
            />
          </div>

          <div className="mb-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">
              Operator runbook after unlock
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Four beats. Do not browse the workspace randomly.
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRIVATE_DEMO_OPERATOR_RUNBOOK.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-50/70">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-emerald-50/60">
              This runbook is presentation discipline. The sample workspace can teach structure; only live activation,
              normalized upload, generated artifacts, and append history can prove trader-specific outcomes.
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">
              Private demo preflight
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Check the handoff before unlocking the workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-cyan-50/70">
              Presenter rule: the public story can create recognition, the private demo can show the operating loop,
              and only live activation plus uploaded history can create proof.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {preflightChecks.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-cyan-50/65">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-cyan-50/55">
              Preflight approval does not create live proof. It only prevents the presenter from overstating what this sample route proves.
            </p>
          </div>

          {!routeIntegrityReady ? (
            <div className="mb-6 rounded-3xl border border-rose-300/25 bg-rose-300/[0.08] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-200">
                Route integrity blocked
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Private Reset Pro requires a carried public question.
              </h2>
              <p className="mt-3 text-sm leading-6 text-rose-50/75">
                Direct cold unlock is intentionally disabled. The correct product order is public StoryExperience,
                upload/report, locked private insight, then founder-gated Reset Pro sample workspace.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to={addMarketToPath('/story', market)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Open StoryExperience
                </Link>
                <Link
                  to={addMarketToPath('/demo', market)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Open IFX Demo Launcher
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mb-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.06] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
              Private demo claim script
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              What to say before the code goes in.
            </h2>
            <p className="mt-3 text-sm leading-6 text-violet-50/70">
              The founder gate is where the pitch can accidentally overclaim. Use this script to keep the demo focused on
              structure, not unfinished live proof.
            </p>
            <div className="mt-4 grid gap-3">
              {PRIVATE_DEMO_CLAIM_SCRIPT.map((row) => (
                <div key={row.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-100">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{row.value}</p>
                  <p className="mt-2 text-xs leading-5 text-violet-50/65">{row.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-violet-50/60">
              Claim script rule: unlock can demonstrate workflow readiness only; it cannot prove live outcomes.
            </p>
          </div>

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
                  {workspaceHandoffFactsWithChecksum.map(([label, value]) => (
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
              <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                  Private gate engagement receipt
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">
                  Intent survived into the founder gate. It still is not evidence.
                </h3>
                <p className="mt-2 text-sm leading-6 text-cyan-50/75">
                  The gate can read local report engagement so the operator knows why this private demo was opened.
                  These values are route continuity only, never trader proof.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {privateGateEngagementRows.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">{row.label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{row.value}</p>
                      <p className="mt-2 text-xs leading-5 text-cyan-50/65">{row.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-cyan-50/60">
                  Private gate engagement rule: views, locked clicks, and gate attempts can explain routing intent only.
                  They do not prove payment, backend normalization, raw trades, or account-specific improvement.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">
              Private demo unlock manifest
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              What changes when the founder code succeeds.
            </h2>
            <div className="mt-4 grid gap-3">
              {unlockManifestRows.map((row) => (
                <div key={row.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{row.value}</p>
                  <p className="mt-2 text-xs leading-5 text-cyan-50/65">{row.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-cyan-50/60">
              Unlock manifest rule: a successful code changes access state only after locked insight intent is verified. It does not convert demo context into live proof.
            </p>
          </div>

          <div className="mb-6 rounded-3xl border border-sky-300/20 bg-sky-300/[0.06] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200">
              Reset Pro unlock receipt preview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              The workspace will store this receipt, not the private code.
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sky-100">Receipt id</p>
                <p className="mt-1 break-words text-sm font-semibold text-white">{unlockReceiptId}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sky-100">Receipt boundary</p>
                <p className="mt-1 text-sm leading-6 text-sky-50/75">{PRIVATE_DEMO_UNLOCK_BOUNDARY}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50/85">
              <input
                type="checkbox"
                checked={boundaryAcknowledged}
                onChange={(event) => {
                  setBoundaryAcknowledged(event.target.checked)
                  setError(null)
                }}
                className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 text-amber-300"
              />
              <span>
                <span className="block font-semibold text-white">I acknowledge the private demo boundary.</span>
                This unlock shows sample Reset Pro structure only. It does not prove live activation, live uploads,
                generated backend artifacts, durable append history, or account-specific trader conclusions.
              </span>
            </label>

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
              to={addMarketToPath(
                appendDemoLauncherSamplePacketToPath(
                  appendCheckoutIntentToPath('/activate', checkoutIntent),
                  shouldCarryDemoLauncherPacket,
                ),
                market,
              )}
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
