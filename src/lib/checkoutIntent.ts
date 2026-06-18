export type CheckoutIntentSource = 'free_report' | 'locked_report' | 'locked_insight' | 'private_insight_gate'

export interface CheckoutIntent {
  source: CheckoutIntentSource
  reportId?: string
  lockedSectionId?: string
  archetypeId?: string
  axisId?: string
  storySource?: 'guided' | 'direct'
  visitedSceneCount?: number
  selectedPainAxisIds?: string[]
  signalMarkerIds?: string[]
}

const SOURCE_VALUES = new Set<CheckoutIntentSource>([
  'free_report',
  'locked_report',
  'locked_insight',
  'private_insight_gate',
])

const TOKEN_PATTERN = /[^a-zA-Z0-9._:-]/g

function cleanToken(value: string | null, maxLength = 96): string | undefined {
  const cleaned = value?.trim().replace(TOKEN_PATTERN, '-').slice(0, maxLength)
  return cleaned || undefined
}

function readSource(params: URLSearchParams): CheckoutIntentSource | undefined {
  const source = cleanToken(params.get('source')) as CheckoutIntentSource | undefined
  return source && SOURCE_VALUES.has(source) ? source : undefined
}

function readStorySource(params: URLSearchParams): CheckoutIntent['storySource'] {
  const source = cleanToken(params.get('story'))
  return source === 'guided' ? 'guided' : source === 'direct' ? 'direct' : undefined
}

function readVisitedSceneCount(params: URLSearchParams): number | undefined {
  const rawValue = Number(params.get('scene_count'))
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return undefined
  }

  return Math.max(1, Math.min(15, Math.floor(rawValue)))
}

function readSelectedPainAxisIds(params: URLSearchParams): string[] | undefined {
  const axisIds = (params.get('pain_axes') ?? '')
    .split(',')
    .map((value) => cleanToken(value, 64))
    .filter((value): value is string => Boolean(value))
  const uniqueAxisIds = [...new Set(axisIds)]

  return uniqueAxisIds.length ? uniqueAxisIds : undefined
}

function readSignalMarkerIds(params: URLSearchParams): string[] | undefined {
  const markerIds = (params.get('signals') ?? '')
    .split(',')
    .map((value) => cleanToken(value, 64))
    .filter((value): value is string => Boolean(value))
  const uniqueMarkerIds = [...new Set(markerIds)]

  return uniqueMarkerIds.length ? uniqueMarkerIds : undefined
}

export function readCheckoutIntent(search: string): CheckoutIntent | null {
  const params = new URLSearchParams(search)
  const source = readSource(params)

  if (!source) {
    return null
  }

  const intent: CheckoutIntent = {
    source,
    reportId: cleanToken(params.get('report')),
    lockedSectionId: cleanToken(params.get('section')),
    archetypeId: cleanToken(params.get('archetype')),
    axisId: cleanToken(params.get('axis')),
    storySource: readStorySource(params),
    visitedSceneCount: readVisitedSceneCount(params),
    selectedPainAxisIds: readSelectedPainAxisIds(params),
    signalMarkerIds: readSignalMarkerIds(params),
  }

  return intent
}

export function enrichCheckoutIntent(
  intent: CheckoutIntent | null,
  context?: {
    storySource?: 'guided' | 'direct'
    visitedSceneCount?: number
    selectedPainAxisIds?: string[]
    signalMarkerIds?: string[]
  } | null,
): CheckoutIntent | null {
  if (!intent) {
    return null
  }

  return {
    ...intent,
    storySource: intent.storySource ?? context?.storySource,
    visitedSceneCount: intent.visitedSceneCount ?? context?.visitedSceneCount,
    selectedPainAxisIds: intent.selectedPainAxisIds?.length ? intent.selectedPainAxisIds : context?.selectedPainAxisIds,
    signalMarkerIds: intent.signalMarkerIds?.length ? intent.signalMarkerIds : context?.signalMarkerIds,
  }
}

export function appendCheckoutIntentToPath(path: string, intent: CheckoutIntent | null): string {
  if (!intent) {
    return path
  }

  const params = new URLSearchParams()
  params.set('source', intent.source)

  if (intent.reportId) {
    params.set('report', intent.reportId)
  }
  if (intent.lockedSectionId) {
    params.set('section', intent.lockedSectionId)
  }
  if (intent.archetypeId) {
    params.set('archetype', intent.archetypeId)
  }
  if (intent.axisId) {
    params.set('axis', intent.axisId)
  }
  if (intent.storySource) {
    params.set('story', intent.storySource)
  }
  if (typeof intent.visitedSceneCount === 'number') {
    params.set('scene_count', String(intent.visitedSceneCount))
  }
  if (intent.selectedPainAxisIds?.length) {
    params.set('pain_axes', intent.selectedPainAxisIds.join(','))
  }
  if (intent.signalMarkerIds?.length) {
    params.set('signals', intent.signalMarkerIds.join(','))
  }

  return `${path}${path.includes('?') ? '&' : '?'}${params.toString()}`
}

export function describeCheckoutIntent(intent: CheckoutIntent): string {
  if (intent.source === 'locked_insight') {
    return 'Locked private insight'
  }
  if (intent.source === 'locked_report') {
    return 'Locked report module'
  }
  if (intent.source === 'private_insight_gate') {
    return 'Private insight gate'
  }
  return 'Free report'
}
