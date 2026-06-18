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

export interface ResetProBridge {
  headline: string
  decisionQuestion: string
  whyNow: string
  liveWorkspaceMustProve: string[]
  privatePreviewShows: string[]
}

export interface FreeReportPreview {
  reportId: string
  archetype: TraderArchetype
  dominantAxis: FingerprintScore
  pressureIndex: number
  pressureBand: BehavioralPressureBand
  storyHandoff: {
    source: 'guided' | 'direct'
    selectedPainAxes: FingerprintAxis[]
    visitedSceneCount: number
    summary: string
    boundary: string
  }
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
  resetProBridge: ResetProBridge
  conversionLine: string
}

export interface LockedInsightPreview {
  sectionTitle: string
  thesis: string
  liveWorkspaceShows: string[]
  demoMayPreview: string[]
  proofRequired: string[]
}

export function toReportSectionSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function findLockedReportSectionBySlug(report: FreeReportPreview, sectionSlug?: string | null): FreeReportPreview['locked'][number] | null {
  if (!sectionSlug) {
    return null
  }

  return report.locked.find((section) => toReportSectionSlug(section.title) === sectionSlug) ?? null
}

export function getGuidedLockedSectionForAxis(report: FreeReportPreview): FreeReportPreview['locked'][number] {
  const preferredSlugByAxis: Partial<Record<FingerprintAxisId, string>> = {
    drawdown_pressure: 'breach-sequence',
    edge_decay: 'edge-decay-map',
    revenge_reentry: 'next-session-state-warning',
    size_escalation: 'next-session-state-warning',
    tilt_susceptibility: 'next-session-state-warning',
    session_fatigue: 'historical-fingerprint-trace',
  }
  const preferredSlug = preferredSlugByAxis[report.dominantAxis.id] ?? 'highest-cost-state'

  return findLockedReportSectionBySlug(report, preferredSlug) ?? report.locked[0]
}

export function buildLockedInsightPreview(report: FreeReportPreview, sectionSlug?: string | null): LockedInsightPreview {
  const section = findLockedReportSectionBySlug(report, sectionSlug) ?? report.locked[0]
  const slug = toReportSectionSlug(section.title)

  const commonProof = [
    'Live activation or explicitly labeled private demo mode.',
    'Visible upload/sample boundary before any private claim.',
    'No instrument-level trade recommendation.',
  ]

  switch (slug) {
    case 'breach-sequence':
      return {
        sectionTitle: section.title,
        thesis: 'The private layer reconstructs the decision chain that tends to appear before account damage, not just the final loss.',
        liveWorkspaceShows: [
          'Pre-breach decision sequence grouped by session state.',
          'Rulebook pressure points where size, timing, or re-entry changed.',
          'Which warning should fire before the next similar sequence.',
        ],
        demoMayPreview: [
          'Sample breach-style sequence and talk track.',
          'How the warning would be framed without pretending it is the visitor account.',
        ],
        proofRequired: [...commonProof, 'Normalized trades with timestamps, order sequence, and account/rule context.'],
      }
    case 'edge-decay-map':
      return {
        sectionTitle: section.title,
        thesis: 'The private layer separates real edge decay from ordinary variance so the trader stops defending setups that no longer pay.',
        liveWorkspaceShows: [
          'Setup clusters marked stable, watchlist, or decayed.',
          'Performance drift across repeated uploads instead of one sample.',
          'Where confidence stayed high while expectancy weakened.',
        ],
        demoMayPreview: [
          'Sample edge portfolio structure.',
          'How Shibuya talks about setup health without giving buy/sell calls.',
        ],
        proofRequired: [...commonProof, 'Enough historical trades to compare setup behavior across windows.'],
      }
    case 'next-session-state-warning':
      return {
        sectionTitle: section.title,
        thesis: 'The private layer turns the report into a pre-session warning, so the next order starts under a visible state constraint.',
        liveWorkspaceShows: [
          'The state most likely to contaminate the next session.',
          'A next-session mandate tied to behavior, not market direction.',
          'Append-proof comparison after the next upload.',
        ],
        demoMayPreview: [
          'Sample mandate and warning language.',
          'How the append-proof loop confirms improvement or relapse.',
        ],
        proofRequired: [...commonProof, 'At least one follow-up upload to compare mandate versus next-session behavior.'],
      }
    case 'historical-fingerprint-trace':
      return {
        sectionTitle: section.title,
        thesis: 'The private layer makes the fingerprint historical, showing whether the trader is changing or repeating the same leak under new language.',
        liveWorkspaceShows: [
          'Fingerprint movement across upload windows.',
          'Which axes improved, worsened, or stayed stubborn.',
          'Whether the paid loop is changing behavior or only creating insight.',
        ],
        demoMayPreview: [
          'Sample historical trace with demo data only.',
          'The progress narrative without claiming live persistence.',
        ],
        proofRequired: [...commonProof, 'Multiple uploaded windows or a durable account history.'],
      }
    case 'highest-cost-state':
    default:
      return {
        sectionTitle: section.title,
        thesis: 'The private layer identifies which trader state is doing the most account damage after trade history is normalized.',
        liveWorkspaceShows: [
          'The behavioral state carrying the largest estimated cost.',
          'How often that state appears before losses, givebacks, or rule pressure.',
          'Which next-session constraint should be visible first.',
        ],
        demoMayPreview: [
          'Sample cost-state card and founder talk track.',
          'How the dashboard prioritizes one expensive behavior instead of flooding the trader with metrics.',
        ],
        proofRequired: [...commonProof, 'Normalized trade history with enough rows to estimate repeat behavioral cost.'],
      }
  }
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
    body: 'Most traders keep changing entries, indicators, and rules. Shibuya starts one level earlier: what state were you in before the order, the hold, the exit, and the next mistake?',
    proof: 'If the same leak repeats across different setups, the setup is not the root cause. The repeatable state is.',
    visualCue: 'Start with recognition, then earn the upload.',
  },
  {
    id: 'pnl-lie',
    label: 'Scene 02',
    title: 'P&L tells you what happened. It does not tell you who you became before it happened.',
    body: 'A red day is not one event. It is usually a chain: pressure, hesitation, forced size, exit panic, re-entry, then damage. The outcome is the last frame.',
    proof: 'Shibuya is built to read the sequence before the final number, not to decorate the final number after the fact.',
    visualCue: 'Follow the decisions before the loss.',
  },
  {
    id: 'vaep',
    label: 'Scene 03',
    title: 'Trading still measures goals and assists. Shibuya measures the actions before the outcome.',
    body: 'In football, the best models value the pass before the assist. In trading, the same principle matters: the decision before the order often carries the real signal.',
    proof: 'The product should surface the states that increased or reduced account damage before a trader asks what to buy next.',
    visualCue: 'Value the sequence, not only the score.',
  },
  {
    id: 'archetypes',
    label: 'Scene 04',
    title: 'Which trader feels uncomfortably close?',
    body: 'The first useful moment is not "features." It is recognition. The trader should see a mirror: the beginner who escalates, the prop trader near limits, or the profitable trader whose edge is quietly decaying.',
    proof: 'A selected mirror becomes a provisional hypothesis. It is not proof until trade history challenges it.',
    visualCue: 'Pick the mirror that stings.',
  },
  {
    id: 'passive-signature',
    label: 'Scene 05',
    title: 'Your answers are forming a rough behavioral fingerprint.',
    body: 'Every tap leaves a small signal: the mirror you chose, the pain you selected, the scenes you replayed, and whether you move toward upload or avoid evidence.',
    proof: 'This is useful as routing context only. The private workspace still needs account data before making account-specific claims.',
    visualCue: 'The page is learning what to test.',
  },
  {
    id: 'fingerprint-axes',
    label: 'Scene 06',
    title: 'Eight axes, one provisional mirror.',
    body: 'Discipline Tax, Tilt Susceptibility, Drawdown Pressure, Revenge Re-entry, Early Exit Bias, Size Escalation, Edge Decay, and Session Fatigue describe behavior, not morality.',
    proof: 'The point is not to shame the trader. It is to name the leak precisely enough that the next session can be constrained.',
    visualCue: 'Build the fingerprint axis by axis.',
  },
  {
    id: 'no-coaching',
    label: 'Scene 07',
    title: 'Shibuya does not tell you what to trade.',
    body: 'The moat is not another AI signal feed. Shibuya is a trader operating mirror: it tells you when your decision state is contaminated, not whether EURUSD should go up or down.',
    proof: 'Bad: "take this trade." Good: "your late-session revenge pattern is active; no add-ons until reset criteria are met."',
    visualCue: 'Protect the decision, not the prediction.',
  },
  {
    id: 'engine-credibility',
    label: 'Scene 08',
    title: 'The model calculates. The language explains.',
    body: 'A trader can read the explanation, but the product has to be driven by measurable state: normalized history, behavioral quality, discipline cost, edge drift, and rule pressure.',
    proof: 'The public story can promise the workflow. The paid workspace must prove it with uploads, persistence, and generated artifacts.',
    visualCue: 'Math first, language second.',
  },
  {
    id: 'report-preview',
    label: 'Scene 09',
    title: 'Preview the free diagnostic before asking for the file.',
    body: 'The free report should give one sharp baseline: archetype, dominant leak, pressure band, and the locked modules that require real evidence.',
    proof: 'Locked does not mean vague. Highest-cost state, breach sequence, edge decay map, and next-session warnings must say what proof they need.',
    visualCue: 'Show the door before asking for payment.',
  },
  {
    id: 'predicted-reveal',
    label: 'Scene 10',
    title: 'Based only on how you moved through this page, Shibuya predicts this fingerprint.',
    body: 'The reveal is intentionally uncomfortable and intentionally limited. It should create enough recognition to make upload feel like the rational next step.',
    proof: 'The boundary stays visible: this is a website-level prediction until trade history confirms or rejects it.',
    visualCue: 'Recognition, then evidence.',
  },
  {
    id: 'upload-moment',
    label: 'Scene 11',
    title: 'Upload your trade history. See what the fingerprint gets right.',
    body: 'This is the conversion moment that matters. The trader is not buying a dashboard; they are trying to find out whether the mirror survives contact with their actual decisions.',
    proof: 'Upload should create a report packet with source, story context, and validation boundary carried through every next route.',
    visualCue: 'Evidence replaces opinion.',
  },
  {
    id: 'free-report',
    label: 'Scene 12',
    title: 'Your baseline is forming.',
    body: 'The report should not drown the trader in charts. It should identify the current baseline and make the next private question obvious.',
    proof: 'Unlocked: archetype, pressure band, dominant leak, one painful insight. Locked: the modules that require live account evidence.',
    visualCue: 'One baseline, clear next question.',
  },
  {
    id: 'pricing-ladder',
    label: 'Scene 13',
    title: 'Pricing is a maturity ladder, not a SaaS tier table.',
    body: 'The buyer is not comparing storage limits. They are choosing the level of pressure they need handled: see the leak, keep a monthly mirror, survive a high-pressure loop, or add guided review.',
    proof: 'Every plan should map to a trader state and a delivery promise, not a random bundle of features.',
    visualCue: 'Choose by pressure, not by feature count.',
  },
  {
    id: 'checkout-activation',
    label: 'Scene 14',
    title: 'Payment confirmed. Baseline unlocked. Daily Signal starts tomorrow.',
    body: 'The money path cannot be sloppy. Payment, verification, activation, return access, first upload, and first mandate must feel like one continuous trader journey.',
    proof: 'If activation fails, it should be visible and recoverable. If it succeeds, the workspace should know which public module the trader came from.',
    visualCue: 'Carry context through payment.',
  },
  {
    id: 'dashboard-transition',
    label: 'Scene 15',
    title: 'The story ends by becoming the product.',
    body: 'The live workspace is where the public mirror becomes an operating system: discipline tax, mandate, fingerprint, edge portfolio, campaign review, and append-proof loops.',
    proof: 'The demo can show the structure. Only a live activated account with uploads can prove persistent account-specific progress.',
    visualCue: 'From recognition to operating loop.',
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

export function normalizeFingerprintAxisIds(axisIds?: string[] | null): FingerprintAxisId[] {
  const seen = new Set<FingerprintAxisId>()

  for (const axisId of axisIds ?? []) {
    const axis = getFingerprintAxis(axisId)
    if (axis.id === axisId && !seen.has(axis.id)) {
      seen.add(axis.id)
    }
  }

  return [...seen]
}

function buildVisitedSceneIdsFromCount(count?: number | null): string[] {
  if (!Number.isFinite(count) || !count) {
    return ['cold-open', 'archetypes', 'predicted-reveal', 'upload-moment']
  }

  return STORY_SCENES.slice(0, Math.max(1, Math.min(STORY_SCENES.length, Math.floor(count)))).map((scene) => scene.id)
}

export function createSignalFromPublicJourney(params: {
  archetypeId?: string | null
  axisId?: string | null
  selectedPainAxisIds?: string[] | null
  visitedSceneCount?: number | null
  visitedSceneIds?: string[]
} = {}): StorySignalState {
  const archetype = getTraderArchetype(params.archetypeId)
  const axis = getFingerprintAxis(params.axisId)
  const selectedPainAxisIds = normalizeFingerprintAxisIds(params.selectedPainAxisIds)

  return {
    archetypeId: archetype.id,
    selectedPainAxes: selectedPainAxisIds.length ? selectedPainAxisIds : [axis.id],
    visitedSceneIds: params.visitedSceneIds?.length
      ? params.visitedSceneIds
      : buildVisitedSceneIdsFromCount(params.visitedSceneCount),
    pricingInterest: 0,
    uploadIntent: 1,
  }
}

export function buildFreeReportPreview(params: {
  reportId?: string
  archetypeId?: string | null
  axisId?: string | null
  selectedPainAxisIds?: string[] | null
  visitedSceneCount?: number | null
  storySource?: string | null
} = {}): FreeReportPreview {
  const signal = createSignalFromPublicJourney({
    archetypeId: params.archetypeId,
    axisId: params.axisId,
    selectedPainAxisIds: params.selectedPainAxisIds,
    visitedSceneCount: params.visitedSceneCount,
  })
  const scores = buildPredictedFingerprint(signal)
  const dominantAxis = getDominantFingerprintAxis(scores)
  const pressureIndex = buildBehavioralPressureIndex(scores)
  const pressureBand = getBehavioralPressureBand(pressureIndex)
  const archetype = getTraderArchetype(params.archetypeId)
  const recommendedPath = inferRecommendedProductPath(pressureIndex, dominantAxis.id)
  const storySource = params.storySource === 'guided' ? 'guided' : 'direct'
  const selectedPainAxes = signal.selectedPainAxes.map((axisId) => getFingerprintAxis(axisId))
  const visitedSceneCount = signal.visitedSceneIds.length
  const selectedPainLabel = selectedPainAxes.length
    ? selectedPainAxes.map((axis) => axis.label).join(', ')
    : 'none captured'

  return {
    reportId: params.reportId ?? 'sample-free-report',
    archetype,
    dominantAxis,
    pressureIndex,
    pressureBand,
    storyHandoff: {
      source: storySource,
      selectedPainAxes,
      visitedSceneCount,
      summary: storySource === 'guided'
        ? `Guided StoryExperience signal: ${visitedSceneCount} scene${visitedSceneCount === 1 ? '' : 's'} viewed; public pain axes: ${selectedPainLabel}.`
        : `Direct upload/report signal: public pain axes from URL or fallback model: ${selectedPainLabel}.`,
      boundary: 'This is a website-level handoff. It is not account-specific evidence until trade history is normalized by the live backend.',
    },
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
    resetProBridge: buildResetProBridge(archetype.id, dominantAxis.id, pressureBand),
    conversionLine: `${recommendedPath.body} Unlock the live workspace when you want uploads, report artifacts, mandate history, and Reset Pro review state to persist.`,
  }
}

function buildResetProBridge(
  archetypeId: StoryArchetypeId,
  axisId: FingerprintAxisId,
  pressureBand: BehavioralPressureBand,
): ResetProBridge {
  const commonLiveProof = [
    'First meaningful upload normalized by the live backend.',
    'A visible next-session mandate tied to behavior rather than market direction.',
    'Append-proof after the next session so improvement or relapse can be measured.',
  ]
  const commonPreview = [
    'Sample mandate and pressure map.',
    'Founder talk track for the private workspace.',
    'The exact boundary between demo structure and live account evidence.',
  ]

  if (archetypeId === 'priya' || axisId === 'drawdown_pressure') {
    return {
      headline: 'Reset Pro should decide whether pressure changes the account before the breach.',
      decisionQuestion: 'Does the trader become a different operator near the drawdown line?',
      whyNow: `${pressureBand.label} means the next product step should test pressure behavior, not add another generic chart.`,
      liveWorkspaceMustProve: [
        ...commonLiveProof,
        'Whether size, exit timing, or re-entry changes when rulebook pressure rises.',
      ],
      privatePreviewShows: [
        ...commonPreview,
        'How a prop-style drawdown warning becomes a pre-session operating constraint.',
      ],
    }
  }

  if (archetypeId === 'marco' || axisId === 'edge_decay') {
    return {
      headline: 'Reset Pro should separate real edge decay from normal variance.',
      decisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
      whyNow: `${pressureBand.label} means the private layer has to compare repeated windows before calling a setup decayed.`,
      liveWorkspaceMustProve: [
        ...commonLiveProof,
        'Enough repeated setup history to mark stable, watchlist, or decayed behavior.',
      ],
      privatePreviewShows: [
        ...commonPreview,
        'How the edge portfolio turns a vague feeling into a watchlist decision.',
      ],
    }
  }

  if (axisId === 'revenge_reentry' || axisId === 'size_escalation' || axisId === 'tilt_susceptibility') {
    return {
      headline: 'Reset Pro should catch the moment one loss becomes a second decision.',
      decisionQuestion: 'What state turns the next order into emotional recovery instead of planned risk?',
      whyNow: `${pressureBand.label} means the live workspace must prioritize session control before more performance narration.`,
      liveWorkspaceMustProve: [
        ...commonLiveProof,
        'The post-loss sequence where timing, frequency, or size stops matching the plan.',
      ],
      privatePreviewShows: [
        ...commonPreview,
        'How the warning appears before the trader has already paid for the relapse.',
      ],
    }
  }

  return {
    headline: 'Reset Pro should turn recognition into a repeatable operating loop.',
    decisionQuestion: 'Which behavior deserves the first constraint before the next real session?',
    whyNow: `${pressureBand.label} means the next step is evidence continuity, not a heavier public report.`,
    liveWorkspaceMustProve: [
      ...commonLiveProof,
      'Whether the detected leak stays visible across more than one upload window.',
    ],
    privatePreviewShows: [
      ...commonPreview,
      'How a simple baseline becomes mandate, review, and append-proof flow.',
    ],
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
