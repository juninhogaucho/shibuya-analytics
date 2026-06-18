import { describe, expect, test } from 'vitest'
import {
  PUBLIC_JOURNEY_CONTRACT,
  PUBLIC_JOURNEY_CONTRACT_MODE,
  getPublicJourneyStage,
  getPublicJourneyStageState,
} from '../publicJourneyContract'

describe('public journey contract', () => {
  test('codifies the corrected product order from public story to private Reset Pro demo', () => {
    expect(PUBLIC_JOURNEY_CONTRACT_MODE).toBe(
      'public StoryExperience -> locked upload/report/private insight -> private Reset Pro workspace demo',
    )
    expect(PUBLIC_JOURNEY_CONTRACT.map((stage) => stage.id)).toEqual([
      'story',
      'upload',
      'report',
      'insight',
      'demo',
      'append',
    ])
  })

  test('keeps every stage tied to a user job and proof contract', () => {
    for (const stage of PUBLIC_JOURNEY_CONTRACT) {
      expect(stage.userJob.length).toBeGreaterThan(12)
      expect(stage.proofContract.length).toBeGreaterThan(20)
    }

    expect(getPublicJourneyStage('story')).toMatchObject({
      boundary: 'Website-level recognition only.',
      proofContract: 'May carry public interaction context; cannot claim account-specific evidence.',
    })
    expect(getPublicJourneyStage('demo')).toMatchObject({
      boundary: 'Presenter-gated sample workspace.',
    })
    expect(getPublicJourneyStage('append').proofContract).toContain('first meaningful upload')
  })

  test('marks prior stages complete, the current stage active, and future stages locked', () => {
    expect(getPublicJourneyStageState('story', 'insight')).toBe('complete')
    expect(getPublicJourneyStageState('insight', 'insight')).toBe('active')
    expect(getPublicJourneyStageState('demo', 'insight')).toBe('locked')
  })
})
