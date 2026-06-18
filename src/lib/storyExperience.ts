export type StoryArchetypeId = 'john' | 'priya' | 'marco'

export type FingerprintAxisId =
  | 'discipline_tax'
  | 'tilt_susceptibility'
  | 'drawdown_pressure'
  | 'revenge_reentry'
  | 'early_exit_bias'
  | 'size_escalation'
  | 'edge_decay'
  | 'session_fatigue'

export interface FingerprintAxis {
  id: FingerprintAxisId
  label: string
  shortLabel: string
  description: string
}

export interface TraderArchetype {
  id: StoryArchetypeId
  name: string
  title: string
  body: string
  axisWeights: Partial<Record<FingerprintAxisId, number>>
}

export interface StoryScene {
  id: string
  label: string
  title: string
  body: string
  proof: string
  visualCue: string
}

export interface StorySignalState {
  archetypeId: StoryArchetypeId | null
  selectedPainAxes: FingerprintAxisId[]
  visitedSceneIds: string[]
  pricingInterest: number
  uploadIntent: number
}

export interface FingerprintScore extends FingerprintAxis {
  score: number
}

export type BehavioralPressureBandId = 'watchlist' | 'pressure_building' | 'intervention_candidate'

export interface BehavioralPressureBand {
  id: BehavioralPressureBandId
  label: string
  description: string
  nextMove: string
}

export interface RecommendedProductPath {
  label: string
  body: string
  cta: string
}

export interface PrivateInsightGate {
  headline: string
  body: string
  primaryUnlock: string
  demoPromise: string
  evidenceRequired: string[]
  refusesToClaim: string[]
}

export interface FreeReportPreview {
  reportId: string
  archetype: TraderArchetype
  dominantAxis: FingerprintScore
  pressureIndex: number
  pressureBand: BehavioralPressureBand
  recommendedPath: RecommendedProductPath
  scores: FingerprintScore[]
  unlocked: Array<{
    label: string
    value: string
    body: string
  }>
  locked: Array<{
    title: string
    body: string
  }>
  privateInsightGate: PrivateInsightGate
  conversionLine: string
}

export function toReportSectionSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export const FINGERPRINT_AXES: FingerprintAxis[] = [
  {
    id: 'discipline_tax',
    label: 'Discipline Tax',
    shortLabel: 'Tax',
    description: 'How much behavior appears to be taxing otherwise usable trading decisions.',
  },
  {
    id: 'tilt_susceptibility',
    label: 'Tilt Susceptibility',
    shortLabel: 'Tilt',
    description: 'How quickly the trader state degrades after pressure, boredom, or loss.',
  },
  {
    id: 'drawdown_pressure',
    label: 'Drawdown Pressure',
    shortLabel: 'DD',
    description: 'How much the account changes behavior near loss limits or prop-style constraints.',
  },
  {
    id: 'revenge_reentry',
    label: 'Revenge Re-entry',
    shortLabel: 'Revenge',
    description: 'Whether losses tend to trigger low-quality re-entry instead of clean session closure.',
  },
  {
    id: 'early_exit_bias',
    label: 'Early Exit Bias',
    shortLabel: 'Exit',
    description: 'Whether winners are cut because the trader state cannot tolerate open profit risk.',
  },
  {
    id: 'size_escalation',
    label: 'Size Escalation',
    shortLabel: 'Size',
    description: 'Whether size increases after loss, frustration, or identity pressure.',
  },
  {
    id: 'edge_decay',
    label: 'Edge Decay',
    shortLabel: 'Decay',
    description: 'Whether once-productive setups appear to be losing usefulness or regime fit.',
  },
  {
    id: 'session_fatigue',
    label: 'Session Fatigue',
    shortLabel: 'Fatigue',
    description: 'Whether decision quality appears to degrade later in a session or after repeated decisions.',
  },
]

export const TRADER_ARCHETYPES: TraderArchetype[] = [
  {
    id: 'john',
    name: 'John',
    title: 'Retail F&O struggler',
    body: 'Starts with a decent setup, gives back early wins, then escalates size or frequency when the session stops feeling clean.',
    axisWeights: {
      discipline_tax: 14,
      revenge_reentry: 18,
      size_escalation: 15,
      session_fatigue: 10,
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    title: 'Prop evaluation survivor',
    body: 'Can trade, but her nervous system changes near drawdown limits. Winners become fragile, losers become identity threats.',
    axisWeights: {
      drawdown_pressure: 20,
      early_exit_bias: 15,
      tilt_susceptibility: 12,
      revenge_reentry: 8,
    },
  },
  {
    id: 'marco',
    name: 'Marco',
    title: 'Profitable refiner',
    body: 'Not a beginner. The issue is subtle: edge decay, regime mismatch, and confidence drift after stability.',
    axisWeights: {
      edge_decay: 20,
      discipline_tax: 8,
      early_exit_bias: 8,
      session_fatigue: 8,
    },
  },
]

export const STORY_SCENES: StoryScene[] = [
  {
    id: 'cold-open',
    label: 'Scene 01',
    title: 'You do not have a strategy problem. You have a state problem.',
    body: 'The first screen should feel like a quiet diagnostic mirror, not a generic SaaS hero.',
    proof: 'The page opens with upload as the earned destination, not as a random conversion button.',
    visualCue: 'Breathing fingerprint in the background.',
  },
  {
    id: 'pnl-lie',
    label: 'Scene 02',
    title: 'P&L tells you what happened. It does not tell you who you became before it happened.',
    body: 'The site reframes P&L as an outcome, not the explanation.',
    proof: 'Entry, hold, stop move, size add, early exit, re-entry, tilt cluster, loss.',
    visualCue: 'Decision path before final P&L.',
  },
  {
    id: 'vaep',
    label: 'Scene 03',
    title: 'Trading still measures goals and assists. Shibuya measures the actions before the outcome.',
    body: 'The VAEP analogy explains why the sequence matters more than the final score alone.',
    proof: 'Tiny decision points light up before the P&L appears.',
    visualCue: 'Sequence value map.',
  },
  {
    id: 'archetypes',
    label: 'Scene 04',
    title: 'Which trader feels uncomfortably close?',
    body: 'John, Priya, and Marco are not personas for marketing. They are entry points into a behavioral signature.',
    proof: 'The user selection feeds a provisional website-level fingerprint.',
    visualCue: 'Three trader mirrors.',
  },
  {
    id: 'passive-signature',
    label: 'Scene 05',
    title: 'Your answers are forming a rough behavioral fingerprint.',
    body: 'The site can collect archetype clicks, pain taps, repeated sections, pricing curiosity, and upload intent.',
    proof: 'The prediction must stay explicitly provisional until trade history confirms it.',
    visualCue: 'Signal trace accumulating.',
  },
  {
    id: 'fingerprint-axes',
    label: 'Scene 06',
    title: 'Eight axes, one provisional mirror.',
    body: 'Discipline Tax, Tilt, Drawdown Pressure, Revenge Re-entry, Early Exit Bias, Size Escalation, Edge Decay, and Session Fatigue.',
    proof: 'The user should be able to tap axes and understand what each one means.',
    visualCue: 'Radar/fingerprint component.',
  },
  {
    id: 'no-coaching',
    label: 'Scene 07',
    title: 'Shibuya does not tell you what to trade.',
    body: 'It tells you what state you are in when you trade. The product describes state; it does not prescribe buy/sell decisions.',
    proof: 'Bad: do not take this trade. Good: your late-session revenge pattern is active.',
    visualCue: 'State language boundary.',
  },
  {
    id: 'engine-credibility',
    label: 'Scene 08',
    title: 'The model calculates. The language explains.',
    body: 'The public site must never feel like an LLM guessing from a CSV.',
    proof: 'Upload, normalize, BQL state, DEAN discipline tax, AFMA edge drift, breach probability, report.',
    visualCue: 'Engine pipeline.',
  },
  {
    id: 'report-preview',
    label: 'Scene 09',
    title: 'Preview the free diagnostic before asking for the file.',
    body: 'The site should show archetype, discipline tax estimate, risk timing pattern, repeat failure mode, and one uncomfortable insight.',
    proof: 'Locked sections are visible but honest: highest-cost state, breach sequence, edge decay map, next-session state warning.',
    visualCue: 'Report cards with locks.',
  },
  {
    id: 'predicted-reveal',
    label: 'Scene 10',
    title: 'Based only on how you moved through this page, Shibuya predicts this fingerprint.',
    body: 'This is the required recognition moment before upload.',
    proof: 'Disclaimer: this is not your report. Upload trade history to see what survives contact with real data.',
    visualCue: 'Predicted fingerprint reveal.',
  },
  {
    id: 'upload-moment',
    label: 'Scene 11',
    title: 'Upload your trade history. See what the fingerprint gets right.',
    body: 'The upload CTA is now earned because the user wants to confirm or reject the provisional mirror.',
    proof: 'Supported formats and validation failures must be specific and fixable.',
    visualCue: 'Upload surface.',
  },
  {
    id: 'free-report',
    label: 'Scene 12',
    title: 'Your baseline is forming.',
    body: 'The free report should create one sharp recognition point, not a data dump.',
    proof: 'Unlocked: archetype, discipline tax estimate, risk timing, repeat failure mode, one painful insight.',
    visualCue: 'Report generation sequence.',
  },
  {
    id: 'pricing-ladder',
    label: 'Scene 13',
    title: 'Pricing is a maturity ladder, not a SaaS tier table.',
    body: 'I need to see the leak, I need a monthly mirror, I am in a prop/high-pressure loop, I want deeper review.',
    proof: 'Each offer maps to a trader state and delivery promise.',
    visualCue: 'Behavioral product ladder.',
  },
  {
    id: 'checkout-activation',
    label: 'Scene 14',
    title: 'Payment confirmed. Baseline unlocked. Daily Signal starts tomorrow.',
    body: 'Checkout and activation must be treated as one money path: payment, verification, workspace unlock, return access.',
    proof: 'Activation failures are detected and routed, never silently tolerated.',
    visualCue: 'LEDGER to COMPASS path.',
  },
  {
    id: 'dashboard-transition',
    label: 'Scene 15',
    title: 'The story ends by becoming the product.',
    body: 'The dashboard should feel like the homepage fingerprint became the user operating mirror.',
    proof: 'Discipline Tax, Next Session Mandate, Behavioral Fingerprint, LiveSignal, Edge Portfolio, Campaign Review.',
    visualCue: 'Homepage fingerprint becomes dashboard.',
  },
]

const BASE_SCORE = 34
const PAIN_AXIS_WEIGHT = 18
const PRICING_WEIGHT = 4
const UPLOAD_WEIGHT = 6
const PRESSURE_WEIGHTS: Record<FingerprintAxisId, number> = {
  discipline_tax: 1,
  tilt_susceptibility: 1.1,
  drawdown_pressure: 1.2,
  revenge_reentry: 1.15,
  early_exit_bias: 0.75,
  size_escalation: 1.1,
  edge_decay: 0.75,
  session_fatigue: 0.85,
}

export function createInitialStorySignal(): StorySignalState {
  return {
    archetypeId: null,
    selectedPainAxes: [],
    visitedSceneIds: [],
    pricingInterest: 0,
    uploadIntent: 0,
  }
}

export function recordSceneView(state: StorySignalState, sceneId: string): StorySignalState {
  if (state.visitedSceneIds.includes(sceneId)) {
    return state
  }

  return {
    ...state,
    visitedSceneIds: [...state.visitedSceneIds, sceneId],
  }
}

export function selectArchetype(state: StorySignalState, archetypeId: StoryArchetypeId): StorySignalState {
  return {
    ...state,
    archetypeId,
  }
}

export function togglePainAxis(state: StorySignalState, axisId: FingerprintAxisId): StorySignalState {
  const selected = state.selectedPainAxes.includes(axisId)

  return {
    ...state,
    selectedPainAxes: selected
      ? state.selectedPainAxes.filter((candidate) => candidate !== axisId)
      : [...state.selectedPainAxes, axisId],
  }
}

export function recordPricingInterest(state: StorySignalState): StorySignalState {
  return {
    ...state,
    pricingInterest: state.pricingInterest + 1,
  }
}

export function recordUploadIntent(state: StorySignalState): StorySignalState {
  return {
    ...state,
    uploadIntent: state.uploadIntent + 1,
  }
}

export function buildPredictedFingerprint(state: StorySignalState): FingerprintScore[] {
  const archetype = TRADER_ARCHETYPES.find((candidate) => candidate.id === state.archetypeId)

  return FINGERPRINT_AXES.map((axis) => {
    const archetypeWeight = archetype?.axisWeights[axis.id] ?? 0
    const painWeight = state.selectedPainAxes.includes(axis.id) ? PAIN_AXIS_WEIGHT : 0
    const pricingWeight = state.pricingInterest > 0 && ['drawdown_pressure', 'edge_decay'].includes(axis.id)
      ? Math.min(12, state.pricingInterest * PRICING_WEIGHT)
      : 0
    const uploadWeight = state.uploadIntent > 0 && ['discipline_tax', 'revenge_reentry'].includes(axis.id)
      ? Math.min(12, state.uploadIntent * UPLOAD_WEIGHT)
      : 0
    const sceneWeight = Math.min(10, Math.floor(state.visitedSceneIds.length / 2))

    return {
      ...axis,
      score: clampScore(BASE_SCORE + archetypeWeight + painWeight + pricingWeight + uploadWeight + sceneWeight),
    }
  })
}

export function getDominantFingerprintAxis(scores: FingerprintScore[]): FingerprintScore {
  return scores.reduce((current, candidate) => (candidate.score > current.score ? candidate : current), scores[0])
}

export function buildBehavioralPressureIndex(scores: FingerprintScore[]): number {
  const totalWeight = scores.reduce((sum, axis) => sum + PRESSURE_WEIGHTS[axis.id], 0)
  const weightedScore = scores.reduce((sum, axis) => sum + axis.score * PRESSURE_WEIGHTS[axis.id], 0)
  const wholeFingerprintPressure = weightedScore / totalWeight
  const pressureCluster = [...scores]
    .sort((a, b) => b.score * PRESSURE_WEIGHTS[b.id] - a.score * PRESSURE_WEIGHTS[a.id])
    .slice(0, 4)
  const clusterWeight = pressureCluster.reduce((sum, axis) => sum + PRESSURE_WEIGHTS[axis.id], 0)
  const clusterPressure = pressureCluster.reduce((sum, axis) => sum + axis.score * PRESSURE_WEIGHTS[axis.id], 0) / clusterWeight

  return Math.round(wholeFingerprintPressure * 0.35 + clusterPressure * 0.65)
}

export function getBehavioralPressureBand(index: number): BehavioralPressureBand {
  if (index >= 68) {
    return {
      id: 'intervention_candidate',
      label: 'Intervention Candidate',
      description: 'The public signal suggests the trader may need a harder operating loop before the same state repeats.',
      nextMove: 'Use Reset Pro when the issue is high-pressure behavior, prop-style breach pressure, or repeated relapse after insight.',
    }
  }

  if (index >= 52) {
    return {
      id: 'pressure_building',
      label: 'Pressure Building',
      description: 'The public signal suggests the leak is active enough to deserve a persistent monthly mirror.',
      nextMove: 'Use Psych Audit when the trader needs continuity, repeat uploads, and a next-session mandate without guided intervention yet.',
    }
  }

  return {
    id: 'watchlist',
    label: 'Watchlist',
    description: 'The public signal is not severe enough to justify a hard claim. Trade history should decide whether this is noise or a real leak.',
    nextMove: 'Use the free report first, then decide from uploaded evidence instead of website-level recognition.',
  }
}

export function getFingerprintAxis(axisId?: string | null): FingerprintAxis {
  return FINGERPRINT_AXES.find((axis) => axis.id === axisId) ?? FINGERPRINT_AXES[0]
}

export function getTraderArchetype(archetypeId?: string | null): TraderArchetype {
  return TRADER_ARCHETYPES.find((archetype) => archetype.id === archetypeId) ?? TRADER_ARCHETYPES[0]
}

export function createSignalFromPublicJourney(params: {
  archetypeId?: string | null
  axisId?: string | null
  visitedSceneIds?: string[]
} = {}): StorySignalState {
  const archetype = getTraderArchetype(params.archetypeId)
  const axis = getFingerprintAxis(params.axisId)

  return {
    archetypeId: archetype.id,
    selectedPainAxes: [axis.id],
    visitedSceneIds: params.visitedSceneIds?.length ? params.visitedSceneIds : ['cold-open', 'archetypes', 'predicted-reveal', 'upload-moment'],
    pricingInterest: 0,
    uploadIntent: 1,
  }
}

export function buildFreeReportPreview(params: {
  reportId?: string
  archetypeId?: string | null
  axisId?: string | null
} = {}): FreeReportPreview {
  const signal = createSignalFromPublicJourney({
    archetypeId: params.archetypeId,
    axisId: params.axisId,
  })
  const scores = buildPredictedFingerprint(signal)
  const dominantAxis = getDominantFingerprintAxis(scores)
  const pressureIndex = buildBehavioralPressureIndex(scores)
  const pressureBand = getBehavioralPressureBand(pressureIndex)
  const archetype = getTraderArchetype(params.archetypeId)
  const recommendedPath = inferRecommendedProductPath(pressureIndex, dominantAxis.id)

  return {
    reportId: params.reportId ?? 'sample-free-report',
    archetype,
    dominantAxis,
    pressureIndex,
    pressureBand,
    recommendedPath,
    scores,
    unlocked: [
      {
        label: 'Trader archetype',
        value: `${archetype.name}: ${archetype.title}`,
        body: archetype.body,
      },
      {
        label: 'Discipline tax estimate',
        value: dominantAxis.score >= 70 ? 'High pressure candidate' : 'Moderate pressure candidate',
        body: 'This is a website-level estimate. The real number requires uploaded trade history and generated backend artifacts.',
      },
      {
        label: 'Behavioral Pressure Index',
        value: `${pressureIndex}/100 - ${pressureBand.label}`,
        body: `${pressureBand.description} ${pressureBand.nextMove}`,
      },
      {
        label: 'Risk timing pattern',
        value: dominantAxis.label,
        body: dominantAxis.description,
      },
      {
        label: 'Repeat failure mode',
        value: inferRepeatFailureMode(dominantAxis.id),
        body: 'The free report shows the likely state pattern. Paid/live workspace evidence is required before turning this into an operating record.',
      },
      {
        label: 'One uncomfortable insight',
        value: inferPainfulInsight(archetype.id, dominantAxis.id),
        body: 'The useful question is not whether this sounds true. It is whether your trade history confirms it.',
      },
    ],
    locked: [
      {
        title: 'Highest-cost state',
        body: 'Which behavioral state appears to cost the most actual money once trade history is normalized.',
      },
      {
        title: 'Breach sequence',
        body: 'The sequence of decisions that tends to appear before a prop challenge breach or account damage event.',
      },
      {
        title: 'Edge decay map',
        body: 'Which setup still deserves risk, which is stable, and which should be treated as decayed until proven otherwise.',
      },
      {
        title: 'Next-session state warning',
        body: 'The state to watch before the next order. This describes state, not what to buy or sell.',
      },
      {
        title: 'Historical fingerprint trace',
        body: 'How the fingerprint changes across repeated uploads instead of one isolated diagnosis.',
      },
    ],
    privateInsightGate: buildPrivateInsightGate(archetype.id, dominantAxis.id, recommendedPath),
    conversionLine: `${recommendedPath.body} Unlock the live workspace when you want uploads, report artifacts, mandate history, and Reset Pro review state to persist.`,
  }
}

function buildPrivateInsightGate(
  archetypeId: StoryArchetypeId,
  axisId: FingerprintAxisId,
  path: RecommendedProductPath,
): PrivateInsightGate {
  return {
    headline: inferPrivateInsightHeadline(archetypeId, axisId),
    body: `The private insight layer turns this public recognition into an operating record. ${path.body} The live workspace must prove the pattern from uploaded history before it presents it as trader-specific truth.`,
    primaryUnlock: path.label,
    demoPromise: 'Reset Pro demo access shows the private workspace structure with sample data only: mandate, pressure map, review packet, and append-proof loop.',
    evidenceRequired: [
      'A live activation or explicitly labeled private demo session.',
      'A normalized upload packet or sample workspace boundary visible in the UI.',
      'A next-session mandate linked to the detected state, not to a buy/sell recommendation.',
      'A repeatable append path so the next session can confirm improvement or relapse.',
    ],
    refusesToClaim: [
      'No guaranteed profit uplift.',
      'No instrument-level trade recommendation.',
      'No account-specific diagnosis from the public page alone.',
      'No hidden persistence claim when the flow is still local/sample.',
    ],
  }
}

function inferPrivateInsightHeadline(archetypeId: StoryArchetypeId, axisId: FingerprintAxisId): string {
  if (archetypeId === 'priya' || axisId === 'drawdown_pressure') {
    return 'The private layer tests whether pressure changes the account before the breach.'
  }

  if (archetypeId === 'marco' || axisId === 'edge_decay') {
    return 'The private layer separates real edge decay from ordinary variance.'
  }

  if (axisId === 'revenge_reentry' || axisId === 'size_escalation') {
    return 'The private layer catches the moment one loss becomes a second decision.'
  }

  return 'The private layer turns recognition into a repeatable operating loop.'
}

function inferRecommendedProductPath(index: number, axisId: FingerprintAxisId): RecommendedProductPath {
  if (
    index >= 68 ||
    ['drawdown_pressure', 'revenge_reentry', 'size_escalation', 'tilt_susceptibility'].includes(axisId)
  ) {
    return {
      label: 'Reset Pro',
      body: 'This pattern belongs in the higher-pressure reset path if uploaded history confirms it.',
      cta: 'Start Reset Pro',
    }
  }

  if (index >= 52 || ['discipline_tax', 'session_fatigue'].includes(axisId)) {
    return {
      label: 'Psych Audit',
      body: 'This pattern likely needs continuity before it needs guided intervention.',
      cta: 'Start Psych Audit',
    }
  }

  return {
    label: 'Free Report First',
    body: 'This pattern should be validated against trade history before a paid path is justified.',
    cta: 'Generate Free Report',
  }
}

function inferRepeatFailureMode(axisId: FingerprintAxisId): string {
  switch (axisId) {
    case 'drawdown_pressure':
      return 'The account changes personality near the line.'
    case 'revenge_reentry':
      return 'Losses become arguments that the next trade tries to settle.'
    case 'early_exit_bias':
      return 'Open profit starts feeling like risk before the trade has finished working.'
    case 'size_escalation':
      return 'Risk expands when the state is least qualified to handle it.'
    case 'edge_decay':
      return 'A once-useful setup may be getting treated like it still pays.'
    case 'session_fatigue':
      return 'Decision quality appears to decay after too many repetitions.'
    case 'tilt_susceptibility':
      return 'The trader state changes faster than the strategy does.'
    case 'discipline_tax':
    default:
      return 'The leak is not one bad trade. It is repeatable behavioral cost.'
  }
}

function inferPainfulInsight(archetypeId: StoryArchetypeId, axisId: FingerprintAxisId): string {
  if (archetypeId === 'priya' || axisId === 'drawdown_pressure') {
    return 'Your rulebook may not be the problem. Your state near the rulebook may be.'
  }
  if (archetypeId === 'marco' || axisId === 'edge_decay') {
    return 'Being profitable does not protect you from trading a decayed edge too long.'
  }
  return 'You may already know enough strategy. The leak may be what happens after the first emotional trade.'
}

function clampScore(value: number): number {
  return Math.max(12, Math.min(92, value))
}
