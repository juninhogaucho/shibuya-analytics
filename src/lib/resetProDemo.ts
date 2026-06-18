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

export interface ResetProDemoOrigin {
  source?: string
  reportId?: string
  archetypeLabel?: string
  axisLabel?: string
  reportSource?: string
  evidenceLabel?: string
  validationSummary?: string
}

export interface ResetProDemoOriginCard {
  title: string
  body: string
  facts: string[]
}

export interface ResetProDemoScript {
  headline: string
  subline: string
  demoThesis: string
  founderTalkTrack: string[]
  pressureMetrics: ResetProDemoMetric[]
  steps: ResetProDemoStep[]
  proofArtifacts: string[]
  originCard?: ResetProDemoOriginCard
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
    truthBoundary: 'This preview uses demo data only. Live Reset Pro requires payment, activation, first meaningful upload, generated backend artifacts, and account-specific review evidence.',
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
  ]

  return {
    title: origin.source === 'free_report' ? 'Carried in from the public report' : 'Private demo origin',
    body: 'This packet connects the public recognition moment to the private workspace demo. It is context for the walkthrough, not proof that the sample account belongs to the visitor.',
    facts,
  }
}
