import { describe, expect, test } from 'vitest'
import {
  appendPublicStoryHandoffParams,
  readPublicStoryHandoff,
} from '../publicStoryHandoff'

describe('public story URL handoff', () => {
  test('reads sanitized guided story context from route query params', () => {
    expect(readPublicStoryHandoff('?story=guided&scene_count=99&pain_axes=drawdown_pressure,bad-axis,edge_decay,drawdown_pressure')).toEqual({
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure', 'edge_decay'],
      visitedSceneCount: 15,
    })
  })

  test('returns null when no public story signal is present', () => {
    expect(readPublicStoryHandoff('?market=global&archetype=marco')).toBeNull()
  })

  test('appends only canonical story context to existing params', () => {
    const params = appendPublicStoryHandoffParams(
      new URLSearchParams({ source: 'free_report', report: 'sample-report' }),
      {
        storySource: 'guided',
        selectedPainAxisIds: ['edge_decay'],
        visitedSceneCount: 6,
      },
    )

    expect(params.toString()).toBe('source=free_report&report=sample-report&story=guided&scene_count=6&pain_axes=edge_decay')
  })
})
