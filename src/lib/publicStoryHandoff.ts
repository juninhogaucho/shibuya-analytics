import {
  normalizeFingerprintAxisIds,
  type FingerprintAxisId,
} from './storyExperience'

export interface PublicStoryHandoff {
  storySource: 'guided' | 'direct'
  selectedPainAxisIds: FingerprintAxisId[]
  visitedSceneCount: number
}

function normalizeVisitedSceneCount(value: string | number | null | undefined): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 0
  }

  return Math.max(0, Math.min(15, Math.floor(numericValue)))
}

function readPainAxes(value: string | null): FingerprintAxisId[] {
  return normalizeFingerprintAxisIds(
    (value ?? '')
      .split(',')
      .map((axisId) => axisId.trim())
      .filter(Boolean),
  )
}

export function readPublicStoryHandoff(search: string): PublicStoryHandoff | null {
  const params = new URLSearchParams(search)
  const story = params.get('story')
  const selectedPainAxisIds = readPainAxes(params.get('pain_axes'))
  const visitedSceneCount = normalizeVisitedSceneCount(params.get('scene_count'))
  const hasStorySignal = story === 'guided' || story === 'direct' || selectedPainAxisIds.length > 0 || visitedSceneCount > 0

  if (!hasStorySignal) {
    return null
  }

  return {
    storySource: story === 'guided' ? 'guided' : 'direct',
    selectedPainAxisIds,
    visitedSceneCount,
  }
}

export function appendPublicStoryHandoffParams(
  params: URLSearchParams,
  handoff?: PublicStoryHandoff | null,
): URLSearchParams {
  if (!handoff) {
    return params
  }

  params.set('story', handoff.storySource)

  if (handoff.visitedSceneCount > 0) {
    params.set('scene_count', String(handoff.visitedSceneCount))
  }

  if (handoff.selectedPainAxisIds.length > 0) {
    params.set('pain_axes', handoff.selectedPainAxisIds.join(','))
  }

  return params
}
