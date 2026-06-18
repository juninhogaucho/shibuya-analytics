import type { DashboardOverview } from './types'
import {
  buildPredictedFingerprint,
  createSignalFromPublicJourney,
  getDominantFingerprintAxis,
  type FingerprintScore,
} from './storyExperience'

export interface ResetProDemoMetric {
  label: string
  value: number | string
  kind: 'money' | 'percent' | 'text'
  detail: string
}

export interface ResetProDemoStep {
  label: string
  route: string
  routeLabel: string
  proof: string
}

export interface ResetProDemoPresenterRouteItem extends ResetProDemoStep {
  phase: 'start' | 'show' | 'close'
  phaseLabel: string
  boundary: string
}

export interface ResetProDemoShowMoment {
  timebox: string
  title: string
  say: string
  show: string
  boundary: string
}

export interface ResetProDemoOrigin {
  source?: string
  reportId?: string
  archetypeId?: string
  archetypeLabel?: string
  axisId?: string
  axisLabel?: string
  reportSource?: string
  evidenceLabel?: string
  validationSummary?: string
  storySource?: string
  selectedPainAxisIds?: string[]
  selectedPainAxisLabels?: string[]
  visitedSceneCount?: number
  signalMarkerLabels?: string[]
  lockedSectionId?: string
  lockedSectionTitle?: string
  bridgeHeadline?: string
  bridgeDecisionQuestion?: string
  bridgeWhyNow?: string
  bridgeLiveProof?: string[]
  bridgePreviewShows?: string[]
  privateGateChecksum?: string
  engagementReportViewCount?: number
  engagementLockedSectionClickCount?: number
  engagementCurrentSectionClickCount?: number
  engagementPrivateDemoIntentCount?: number
  engagementBoundary?: string
  unlockReceiptId?: string
  unlockBoundary?: string
}

export interface ResetProDemoOriginCard {
  title: string
  body: string
  facts: string[]
}

export interface ResetProDemoChecklistItem {
  label: string
  status: 'ready' | 'warning'
  detail: string
}

export interface ResetProDemoBridgeCard {
  headline: string
  decisionQuestion: string
  whyNow: string
  liveProof: string[]
  previewShows: string[]
}

export interface ResetProDemoClaimLedger {
  allowed: string[]
  forbidden: string[]
}

export interface ResetProDemoUnlockReceipt {
  statusLabel: string
  headline: string
  facts: string[]
  nextAction: string
  boundary: string
}

export interface ResetProDemoDecisionPacket {
  statusLabel: string
  headline: string
  sayFirst: string
  proceedIf: string[]
  stopIf: string[]
}

export interface ResetProDemoProofStage {
  label: string
  status: 'ready' | 'warning' | 'locked'
  evidence: string
  boundary: string
}

export interface ResetProDemoObjectionResponse {
  prompt: string
  response: string
  boundary: string
}

export interface ResetProDemoCloseContractItem {
  label: string
  body: string
}

export interface ResetProDemoCloseContract {
  headline: string
  body: string
  rows: ResetProDemoCloseContractItem[]
}

export interface ResetProDemoLivingMirrorRow {
  label: string
  value: number | string
  kind: 'money' | 'percent' | 'text'
  body: string
}

export interface ResetProDemoLivingMirror {
  headline: string
  body: string
  publicFingerprintLabel: string
  dominantAxisLabel: string
  fingerprintScores: FingerprintScore[]
  rows: ResetProDemoLivingMirrorRow[]
  boundary: string
}

export interface ResetProDemoScript {
  headline: string
  subline: string
  demoThesis: string
  presenterTalkTrack: string[]
  showSequence: ResetProDemoShowMoment[]
  livingMirror: ResetProDemoLivingMirror
  unlockReceipt: ResetProDemoUnlockReceipt
  decisionPacket: ResetProDemoDecisionPacket
  proofLadder: ResetProDemoProofStage[]
  objectionResponses: ResetProDemoObjectionResponse[]
  closeContract: ResetProDemoCloseContract
  readinessChecklist: ResetProDemoChecklistItem[]
  claimLedger: ResetProDemoClaimLedger
  pressureMetrics: ResetProDemoMetric[]
  presenterRoute: ResetProDemoPresenterRouteItem[]
  steps: ResetProDemoStep[]
  proofArtifacts: string[]
  originCard?: ResetProDemoOriginCard
  bridgeCard?: ResetProDemoBridgeCard
  truthBoundary: string
}

function toPercent(value: number): number {
  return Math.round(value * 1000) / 10
}

export function buildResetProDemoScript(overview: DashboardOverview, origin?: ResetProDemoOrigin): ResetProDemoScript {
  const currentEnemy = overview.analysis_summary?.current_enemy ?? 'The demo account is paying a behavioral tax that has to be named before it can be reduced.'
  const nextSessionCommand = overview.analysis_summary?.next_session_command ?? overview.next_action ?? 'Run the next session from a bounded mandate, then append the evidence.'
  const firstArtifact = overview.artifact_descriptors?.find((artifact) => artifact.available)
  const resetPacket = overview.artifact_descriptors?.find((artifact) => artifact.kind === 'reset_pro_review_packet')
  const originCard = buildOriginCard(origin)
  const bridgeCard = buildBridgeCard(origin)
  const unlockReceipt = buildUnlockReceipt(origin, Boolean(originCard), Boolean(bridgeCard))
  const decisionPacket = buildDecisionPacket(origin, Boolean(originCard), Boolean(bridgeCard))
  const proofLadder = buildProofLadder(origin, Boolean(originCard), Boolean(bridgeCard))
  const steps = buildResetProDemoSteps()
  const livingMirror = buildLivingMirror(overview, origin, nextSessionCommand)

  return {
    headline: 'Private Reset Pro command center',
    subline: 'A controlled presenter demo of the paid workspace: leak detection, next-session mandate, premium intervention, guided review, and proof loop.',
    demoThesis: 'Shibuya does not tell the trader what to buy or sell. It turns their trading history into a behavioral operating system that protects the next decision.',
    presenterTalkTrack: [
      'Start with the cost of the leak, not a generic dashboard.',
      currentEnemy,
      nextSessionCommand,
      'Then show the premium surfaces only as decision-support and proof workflow, never as a fake live account claim.',
    ],
    showSequence: [
      {
        timebox: '0:00-0:30',
        title: origin?.lockedSectionTitle ? 'Connect the public pain to the private module' : 'Start from the public recognition moment',
        say: origin?.bridgeDecisionQuestion
          ? `The report handed us one question: ${origin.bridgeDecisionQuestion}`
          : origin?.lockedSectionTitle
          ? `The trader tried to unlock ${origin.lockedSectionTitle}. Reset Pro turns that curiosity into an operating brief.`
          : 'The public story gets the trader to recognize the leak. Reset Pro is where the leak becomes an operating record.',
        show: bridgeCard
          ? 'Reset Pro bridge card, then origin card, then the private command center.'
          : originCard
          ? `${originCard.title}: report, archetype, axis, evidence label, and requested private insight.`
          : 'Origin card, or direct private demo entry when no public handoff exists.',
        boundary: 'This is context for the walkthrough, not proof that the sample account belongs to the visitor.',
      },
      {
        timebox: '0:30-1:15',
        title: 'Name the current enemy',
        say: currentEnemy,
        show: 'Mission HQ, behavioral leak metric, ruin pressure, and next-session mandate.',
        boundary: 'The numbers are demo data; live claims require payment, activation, upload, and generated artifacts.',
      },
      {
        timebox: '1:15-2:10',
        title: 'Show intervention surfaces',
        say: 'The product is not another analytics dashboard. It changes what the trader is allowed to do next.',
        show: 'Slump protocol, alerts, edge portfolio, and prop rule survivability.',
        boundary: 'This is decision support and workflow proof, not investment advice or a prediction of performance.',
      },
      {
        timebox: '2:10-3:00',
        title: 'Close with the proof loop',
        say: nextSessionCommand,
        show: 'Append proof flow and Reset Pro review packet.',
        boundary: 'The demo ends at sample workflow proof. Live Reset Pro still needs account-specific evidence before private conclusions are presented as truth.',
      },
    ],
    livingMirror,
    unlockReceipt,
    decisionPacket,
    proofLadder,
    objectionResponses: buildObjectionResponses(origin, Boolean(originCard), Boolean(bridgeCard)),
    closeContract: buildCloseContract(origin, Boolean(originCard), Boolean(bridgeCard)),
    claimLedger: {
      allowed: [
        'This is a controlled sample workspace showing the Reset Pro operating loop.',
        originCard
          ? 'The public report context was carried into the demo as routing context.'
          : 'This is a direct private demo without a public report handoff.',
        bridgeCard
          ? 'The private workspace can preview the question live data must prove.'
          : 'The private workspace can show structure before a locked question exists.',
        'Append proof is the correct demo exit because live improvement requires new evidence.',
      ],
      forbidden: [
        'Do not say the sample account belongs to the visitor.',
        'Do not say Shibuya has analyzed the visitor real trades from this demo.',
        'Do not promise profit improvement, challenge pass rates, or drawdown reduction.',
        'Do not present sample metrics as generated backend artifacts for a live account.',
      ],
    },
    readinessChecklist: [
      {
        label: 'Public context carried',
        status: originCard ? 'ready' : 'warning',
        detail: originCard
          ? 'Report, archetype, axis, evidence label, story handoff, and requested private insight are available for the walkthrough.'
          : 'No public report handoff was found. Use this only as a direct private demo, not as proof of the public journey.',
      },
      {
        label: 'Sample boundary visible',
        status: 'ready',
        detail: 'The workspace is explicitly marked demo data only and refuses live persistence or account-specific analytics claims.',
      },
      {
        label: 'Premium path inspectable',
        status: overview.review_eligibility ? 'ready' : 'warning',
        detail: overview.review_eligibility
          ? 'Reset Pro review state, intervention surfaces, and premium routes are visible in the controlled preview.'
          : 'Guided review is not available in this overview, so do not pitch Reset Pro review proof from this sample.',
      },
      {
        label: 'Append-proof exit',
        status: 'ready',
        detail: 'The walkthrough ends by sending the viewer to the upload/append path where live proof would have to be generated.',
      },
    ],
    pressureMetrics: [
      {
        label: 'Behavioral leak',
        value: overview.discipline_tax_30d,
        kind: 'money',
        detail: 'Estimated sample discipline tax over the latest cycle.',
      },
      {
        label: 'Ruin pressure',
        value: toPercent(overview.ruin_probability),
        kind: 'percent',
        detail: 'Sample drawdown guardrail pressure, shown as operating risk.',
      },
      {
        label: 'Review status',
        value: overview.review_summary?.next_review_type?.replace(/_/g, ' ') ?? 'first cycle review',
        kind: 'text',
        detail: overview.review_eligibility ? 'Guided review is visible in this private preview.' : 'Guided review stays locked outside Reset Pro.',
      },
    ],
    presenterRoute: buildPresenterRoute(steps, Boolean(originCard), Boolean(bridgeCard)),
    steps,
    proofArtifacts: [
      firstArtifact?.label ?? 'Baseline Brief',
      resetPacket?.label ?? 'Reset Pro Review Packet',
      'Next-session mandate',
      'Guided review checkpoint',
    ],
    originCard,
    bridgeCard,
    truthBoundary: 'This preview uses demo data only. Live Reset Pro requires payment, activation, first meaningful upload, generated backend artifacts, and account-specific review evidence.',
  }
}

function buildLiveSignalLabel(overview: DashboardOverview): string {
  const state = overview.analysis_summary?.state ?? overview.recovery_ladder
  const bqlScore = overview.bql_score

  if (state === 'loss_of_command' || bqlScore < 0.45 || overview.ruin_probability >= 0.08) {
    return 'RED: stop and protect'
  }

  if (state === 'under_pressure' || bqlScore < 0.65 || overview.ruin_probability >= 0.03) {
    return 'AMBER: pressure visible'
  }

  return 'GREEN: controlled enough to proceed'
}

function buildLivingMirror(
  overview: DashboardOverview,
  origin: ResetProDemoOrigin | undefined,
  nextSessionCommand: string,
): ResetProDemoLivingMirror {
  const fingerprintScores = buildPredictedFingerprint(
    createSignalFromPublicJourney({
      archetypeId: origin?.archetypeId,
      axisId: origin?.axisId,
      selectedPainAxisIds: origin?.selectedPainAxisIds,
      visitedSceneCount: origin?.visitedSceneCount,
    }),
  )
  const dominantAxis = getDominantFingerprintAxis(fingerprintScores)
  const decayedEdges = overview.edge_portfolio.filter((edge) => edge.status === 'DECAYED')
  const leadingEdge = decayedEdges[0] ?? overview.edge_portfolio[0]
  const publicFingerprintLabel = origin?.archetypeLabel || origin?.axisLabel
    ? `${origin?.archetypeLabel ?? 'public archetype not attached'} / ${origin?.axisLabel ?? dominantAxis.label}`
    : 'Direct Reset Pro sample fingerprint'

  return {
    headline: 'Story became the product: fingerprint, mandate, signal, proof loop.',
    body: 'RESET PRO LIVING MIRROR: the private workspace should feel like the public fingerprint became operational. It shows what to protect next, while keeping sample/live boundaries visible.',
    publicFingerprintLabel,
    dominantAxisLabel: origin?.axisLabel ?? dominantAxis.label,
    fingerprintScores,
    rows: [
      {
        label: 'Public fingerprint',
        value: publicFingerprintLabel,
        kind: 'text',
        body: origin?.storySource
          ? `Carried from ${origin.storySource} after ${origin.visitedSceneCount ?? 0} public scene${origin.visitedSceneCount === 1 ? '' : 's'}.`
          : 'No public story route is attached; this is a direct sample mirror only.',
      },
      {
        label: 'Discipline Tax',
        value: overview.discipline_tax_30d,
        kind: 'money',
        body: 'Shown as sample operating pressure here. Live values require backend-generated account artifacts.',
      },
      {
        label: 'Next Session Mandate',
        value: nextSessionCommand,
        kind: 'text',
        body: 'The mandate is the first private action text. It constrains behavior; it is not a trade signal.',
      },
      {
        label: 'LiveSignal',
        value: buildLiveSignalLabel(overview),
        kind: 'text',
        body: 'Workspace state language must move green, amber, or red before the trader acts. In demo mode this is sample state only.',
      },
      {
        label: 'Edge Portfolio',
        value: leadingEdge ? `${leadingEdge.status}: ${leadingEdge.name}` : 'No edge cards available',
        kind: 'text',
        body: 'The edge surface should separate what still pays from what only feels familiar.',
      },
      {
        label: 'Append proof',
        value: 'Required next evidence',
        kind: 'text',
        body: 'The next upload must confirm, reject, or update the mandate before improvement is claimed.',
      },
    ],
    boundary: 'This living mirror is sample workflow proof. It does not prove payment, live upload, generated artifacts, durable account deltas, or trader-specific improvement.',
  }
}

function buildCloseContract(
  origin: ResetProDemoOrigin | undefined,
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoCloseContract {
  const carriedQuestion = origin?.bridgeDecisionQuestion ?? origin?.lockedSectionTitle

  return {
    headline: 'Close on append proof without converting the demo into a live claim.',
    body: 'RESET PRO CLOSE CONTRACT: the last workspace move must send the viewer to the append path and keep the evidence boundary explicit.',
    rows: [
      {
        label: 'What this close proves',
        body: hasOriginCard
          ? 'The public report context can travel into a controlled Reset Pro sample workflow and end at the upload/append proof path.'
          : 'The direct sample workspace can demonstrate the Reset Pro operating loop and end at the upload/append proof path.',
      },
      {
        label: 'What remains unproven',
        body: 'Live upload, generated backend artifacts, durable account deltas, repeated append history, and trader-specific improvement remain unproven.',
      },
      {
        label: 'Required next evidence',
        body: hasBridgeCard && carriedQuestion
          ? `A live activated account must append real history before answering: ${carriedQuestion}`
          : 'A live activated account must complete first meaningful upload, generated artifact review, and repeat append history.',
      },
    ],
  }
}

function buildObjectionResponses(
  origin: ResetProDemoOrigin | undefined,
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoObjectionResponse[] {
  return [
    {
      prompt: 'Are these the viewer real trades?',
      response: hasOriginCard
        ? `No. The demo carried ${origin?.evidenceLabel ?? 'routing context'} from the public journey into a sample workspace.`
        : 'No. This is a cold sample workspace with no public report or upload packet attached.',
      boundary: 'Do not imply the sample account belongs to the viewer or that Shibuya analyzed their live history.',
    },
    {
      prompt: 'What would make this live proof?',
      response: 'Payment/activation, a real account, normalized trade history, generated backend artifacts, and repeat append history.',
      boundary: 'Until those exist, Reset Pro can show workflow structure only, not account-specific conclusions.',
    },
    {
      prompt: 'Is Shibuya telling the trader what to trade?',
      response: 'No. The workspace constrains decision state, rule pressure, sizing behavior, and review cadence; it does not provide buy/sell calls.',
      boundary: 'Keep every claim framed as trader operating support, not investment advice or performance prediction.',
    },
    {
      prompt: 'Where should the demo end?',
      response: hasBridgeCard
        ? 'End on append proof: the carried private question remains unanswered until the next real upload can confirm or reject it.'
        : 'End on append proof: the sample walkthrough stops where live evidence would have to start.',
      boundary: 'Do not end on a performance promise. End on the proof loop and the missing live evidence.',
    },
  ]
}

function buildDecisionPacket(
  origin: ResetProDemoOrigin | undefined,
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoDecisionPacket {
  const carriedEvidence = origin?.evidenceLabel ?? (hasOriginCard ? 'URL context only' : 'direct sample only')
  const carriedQuestion = origin?.bridgeDecisionQuestion ?? origin?.lockedSectionTitle

  return {
    statusLabel: hasOriginCard ? 'GO: CONTEXT CARRIED' : 'WARNING: COLD DEMO',
    headline: hasBridgeCard
      ? 'Open with the carried private question, then show only the sample operating loop.'
      : hasOriginCard
        ? 'Open with the carried report context, then state that the private answer remains unproven.'
        : 'Open as a generic sample workspace. Do not imply the public journey happened.',
    sayFirst: carriedQuestion
      ? `We are carrying one question forward: ${carriedQuestion}`
      : hasOriginCard
        ? `We are carrying public report context forward with evidence status: ${carriedEvidence}.`
        : 'This is a cold sample workspace. No public story, report, upload, or locked private question is attached.',
    proceedIf: [
      hasOriginCard
        ? `The evidence label is stated out loud: ${carriedEvidence}.`
        : 'The presenter says this is a generic sample account before showing any metric.',
      hasBridgeCard
        ? 'The locked private question is framed as what live data must prove.'
        : 'The operator avoids claiming a private question has already been asked.',
      'The demo closes on append proof instead of performance promises.',
    ],
    stopIf: [
      'Someone asks whether these are the viewer real trades.',
      'The presenter cannot explain that backend upload/payment proof is still missing.',
      'The conversation drifts toward profit, pass-rate, drawdown-reduction, or account-specific outcome claims.',
    ],
  }
}

function buildUnlockReceipt(
  origin: ResetProDemoOrigin | undefined,
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoUnlockReceipt {
  const facts = [
    origin?.unlockReceiptId ? `Receipt id: ${origin.unlockReceiptId}` : 'Receipt id: not stored',
    origin?.reportId ? `Report carried: ${origin.reportId}` : 'Report carried: none',
    origin?.lockedSectionTitle ? `Locked question: ${origin.lockedSectionTitle}` : 'Locked question: not attached',
    origin?.storySource
      ? `Story route: ${origin.storySource}; scenes ${origin.visitedSceneCount ?? 0}`
      : 'Story route: not attached',
    origin?.evidenceLabel
      ? `Evidence packet: ${origin.evidenceLabel}`
      : hasOriginCard
        ? 'Evidence packet: URL context only'
        : 'Evidence packet: direct demo only',
    origin?.signalMarkerLabels?.length
      ? `Public markers: ${origin.signalMarkerLabels.join(', ')}`
      : 'Public markers: not attached',
    origin?.privateGateChecksum
      ? `Private gate checksum: ${origin.privateGateChecksum}`
      : 'Private gate checksum: not attached',
    typeof origin?.engagementPrivateDemoIntentCount === 'number'
      ? `Engagement receipt: ${origin.engagementReportViewCount ?? 0} report view(s), ${origin.engagementLockedSectionClickCount ?? 0} locked click(s), ${origin.engagementPrivateDemoIntentCount} gate attempt(s)`
      : 'Engagement receipt: not attached',
  ]

  return {
    statusLabel: hasOriginCard ? 'UNLOCK RECEIPT' : 'DIRECT DEMO RECEIPT',
    headline: hasBridgeCard
      ? 'Reset Pro received the public question; the sample workspace can only show the operating loop.'
      : hasOriginCard
        ? 'Reset Pro received public routing context; the sample workspace can only show structure.'
        : 'Reset Pro opened without public context; frame this as a cold sample workspace.',
    facts,
    nextAction: 'Run Mission HQ first, inspect one intervention surface, then close on append proof.',
    boundary: origin?.unlockBoundary
      ?? 'This receipt proves the presenter gate carried context into the sample workspace. It does not prove live activation, live upload, generated artifacts, or account-specific conclusions.',
  }
}

function buildResetProDemoSteps(): ResetProDemoStep[] {
  return [
    {
      label: '1. Mission HQ',
      route: '/dashboard',
      routeLabel: 'Open HQ',
      proof: 'Frame the trader state, current enemy, and next-session mandate in under 30 seconds.',
    },
    {
      label: '2. Slump protocol',
      route: '/dashboard/slump',
      routeLabel: 'Show protocol',
      proof: 'Demonstrate how Shibuya converts pressure into constraints, not motivation.',
    },
    {
      label: '3. Alerts',
      route: '/dashboard/alerts',
      routeLabel: 'Show alerts',
      proof: 'Show crucial-moment and margin-of-safety warnings as intervention surfaces.',
    },
    {
      label: '4. Edge portfolio',
      route: '/dashboard/edges',
      routeLabel: 'Show edges',
      proof: 'Separate what still pays from what only feels familiar.',
    },
    {
      label: '5. Prop shadow boxing',
      route: '/dashboard/shadow-boxing',
      routeLabel: 'Show propOS angle',
      proof: 'Translate behavior into funded-account rulebook survivability.',
    },
    {
      label: '6. Append proof',
      route: '/dashboard/upload',
      routeLabel: 'Show upload',
      proof: 'Close the loop: the next session must produce evidence, not another story.',
    },
  ]
}

function buildPresenterRoute(
  steps: ResetProDemoStep[],
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoPresenterRouteItem[] {
  return steps.map((step, index) => {
    const isStart = index === 0
    const isClose = index === steps.length - 1

    return {
      ...step,
      phase: isStart ? 'start' : isClose ? 'close' : 'show',
      phaseLabel: isStart ? 'START HERE' : isClose ? 'CLOSE HERE' : 'SHOW NEXT',
      routeLabel: getPresenterRouteLabel(step, isStart, isClose),
      boundary: isStart
        ? hasOriginCard
          ? 'Use carried public context as the opening brief, not as account proof.'
          : 'Direct demo entry only; call out that no public report handoff is attached.'
        : isClose
          ? 'End on append-proof. Live improvement claims require account activation and repeated uploads.'
          : hasBridgeCard
            ? 'Show the surface as sample workflow answering the carried private question.'
            : 'Show product structure only; no account-specific conclusion is allowed.',
    }
  })
}

function getPresenterRouteLabel(step: ResetProDemoStep, isStart: boolean, isClose: boolean): string {
  if (isStart) {
    return 'Start Mission HQ'
  }

  if (isClose) {
    return 'Close On Append Proof'
  }

  return step.label
    .replace(/^\d+\.\s*/, 'Inspect ')
    .replace('Prop shadow boxing', 'PropOS Angle')
}

function buildProofLadder(
  origin: ResetProDemoOrigin | undefined,
  hasOriginCard: boolean,
  hasBridgeCard: boolean,
): ResetProDemoProofStage[] {
  return [
    {
      label: 'Public recognition',
      status: origin?.storySource ? 'ready' : 'warning',
      evidence: origin?.storySource
        ? `Story handoff: ${origin.storySource}; scenes ${origin.visitedSceneCount ?? 0}; axes ${origin.selectedPainAxisLabels?.join(', ') || 'none captured'}.`
        : 'No guided public story packet is attached to this demo entry.',
      boundary: 'Recognition routes the walkthrough. It is not account evidence.',
    },
    {
      label: 'Report handoff packet',
      status: hasOriginCard ? 'ready' : 'warning',
      evidence: origin?.evidenceLabel
        ? `${origin.evidenceLabel}${origin.reportSource ? ` from ${origin.reportSource}` : ''}.`
        : 'No local upload/sample validation packet is attached.',
      boundary: 'A report packet can explain the path; raw live analytics still require backend artifacts.',
    },
    {
      label: 'Locked private question',
      status: hasBridgeCard || origin?.lockedSectionTitle ? 'ready' : 'warning',
      evidence: origin?.bridgeDecisionQuestion ?? origin?.lockedSectionTitle ?? 'No locked module or Reset Pro bridge question was carried in.',
      boundary: 'The question is allowed in a demo. The answer is locked until live proof exists.',
    },
    {
      label: 'Sample command center',
      status: 'ready',
      evidence: 'Reset Pro preview workspace is explicitly marked demo data only.',
      boundary: 'This proves product structure, not account-specific trader truth.',
    },
    {
      label: 'Append-proof exit',
      status: 'locked',
      evidence: 'The next required proof is a live first upload plus append history.',
      boundary: 'The demo should end by showing the upload path, not by claiming improvement.',
    },
  ]
}

function buildBridgeCard(origin?: ResetProDemoOrigin): ResetProDemoBridgeCard | undefined {
  if (!origin?.bridgeHeadline && !origin?.bridgeDecisionQuestion) {
    return undefined
  }

  return {
    headline: origin.bridgeHeadline ?? 'Reset Pro bridge received from the public report.',
    decisionQuestion: origin.bridgeDecisionQuestion ?? 'Which behavior deserves the first private constraint?',
    whyNow: origin.bridgeWhyNow ?? 'The private workspace must prove the public question with live activation, upload, and append history.',
    liveProof: origin.bridgeLiveProof?.length
      ? origin.bridgeLiveProof
      : [
          'Live activation and first meaningful upload.',
          'A next-session mandate tied to behavior rather than market direction.',
          'Append-proof after the next session.',
        ],
    previewShows: origin.bridgePreviewShows?.length
      ? origin.bridgePreviewShows
      : [
          'Sample mandate and pressure map.',
          'Presenter talk track for the private workspace.',
          'The boundary between demo structure and live account evidence.',
        ],
  }
}

function buildOriginCard(origin?: ResetProDemoOrigin): ResetProDemoOriginCard | undefined {
  if (!origin?.reportId && !origin?.archetypeLabel && !origin?.axisLabel) {
    return undefined
  }

  const facts = [
    origin.reportId ? `Origin report: ${origin.reportId}` : 'Origin report: direct private demo entry',
    origin.archetypeLabel ? `Public archetype: ${origin.archetypeLabel}` : 'Public archetype: not provided',
    origin.axisLabel ? `Predicted axis: ${origin.axisLabel}` : 'Predicted axis: not provided',
    origin.reportSource ? `Public packet source: ${origin.reportSource}` : 'Public packet source: not available',
    origin.evidenceLabel ? `Handoff evidence: ${origin.evidenceLabel}` : 'Handoff evidence: URL context only',
    origin.validationSummary ? `Validation note: ${origin.validationSummary}` : 'Validation note: no local upload validation packet found',
    origin.storySource ? `Story handoff: ${origin.storySource}` : 'Story handoff: not available',
    typeof origin.visitedSceneCount === 'number' ? `Story scenes before upload: ${origin.visitedSceneCount}` : 'Story scenes before upload: not available',
    origin.selectedPainAxisLabels?.length
      ? `Public pain axes: ${origin.selectedPainAxisLabels.join(', ')}`
      : 'Public pain axes: not available',
    origin.signalMarkerLabels?.length
      ? `Public signal markers: ${origin.signalMarkerLabels.join(', ')}`
      : 'Public signal markers: not available',
    origin.privateGateChecksum
      ? `Private gate checksum: ${origin.privateGateChecksum}`
      : 'Private gate checksum: not available',
    typeof origin.engagementPrivateDemoIntentCount === 'number'
      ? `Engagement receipt: ${origin.engagementReportViewCount ?? 0} report view(s), ${origin.engagementLockedSectionClickCount ?? 0} locked click(s), ${origin.engagementPrivateDemoIntentCount} gate attempt(s)`
      : 'Engagement receipt: not available',
    origin.engagementBoundary
      ? `Engagement boundary: ${origin.engagementBoundary}`
      : 'Engagement boundary: not available',
    origin.lockedSectionTitle ? `Requested private insight: ${origin.lockedSectionTitle}` : 'Requested private insight: not provided',
    origin.bridgeDecisionQuestion ? `Bridge question: ${origin.bridgeDecisionQuestion}` : 'Bridge question: not provided',
  ]

  return {
    title: origin.source === 'locked_insight'
      ? 'Carried in from locked private insight'
      : origin.source === 'free_report'
        ? 'Carried in from the public report'
        : 'Private demo origin',
    body: 'This packet connects the public recognition moment to the private workspace demo. It is context for the walkthrough, not proof that the sample account belongs to the visitor.',
    facts,
  }
}
