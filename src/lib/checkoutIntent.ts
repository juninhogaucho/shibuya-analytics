export type CheckoutIntentSource = 'free_report' | 'locked_report' | 'locked_insight' | 'private_insight_gate'

export interface CheckoutIntent {
  source: CheckoutIntentSource
  reportId?: string
  lockedSectionId?: string
  archetypeId?: string
  axisId?: string
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
  }

  return intent
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
