import type { DashboardOverview } from './types'

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
  archetypeLabel?: string
  axisLabel?: string
  reportSource?: string
  evidenceLabel?: string
  validationSummary?: string
  storySource?: string
  selectedPainAxisLabels?: string[]
  visitedSceneCount?: number
  lockedSectionId?: string
  lockedSectionTitle?: string
  bridgeHeadline?: string
  bridgeDecisionQuestion?: string
  bridgeWhyNow?: string
  bridgeLiveProof?: string[]
  bridgePreviewShows?: string[]
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

export interface ResetProDemoProofStage {
  label: string
  status: 'ready' | 'warning' | 'locked'
  evidence: string
  boundary: string
}

export interface ResetProDemoScript {
  headline: string
  subline: string
  demoThesis: string
  founderTalkTrack: string[]
  showSequence: ResetProDemoShowMoment[]
  proofLadder: ResetProDemoProofStage[]
  readinessChecklist: ResetProDemoChecklistItem[]
  pressureMetrics: ResetProDemoMetric[]
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
  const proofLadder = buildProofLadder(origin, Boolean(originCard), Boolean(bridgeCard))

  return {
    headline: 'Private Reset Pro command center',
    subline: 'A controlled founder demo of the paid workspace: leak detection, next-session mandate, premium intervention, guided review, and proof loop.',
    demoThesis: 'Shibuya does not tell the trader what to buy or sell. It turns their trading history into a behavioral operating system that protects the next decision.',
    founderTalkTrack: [
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
    proofLadder,
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
    steps: [
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
    ],
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
          'Founder talk track for the private workspace.',
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
