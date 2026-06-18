import { describe, expect, test } from 'vitest'
import { getSampleWorkspaceOverview } from '../sampleWorkspace'

describe('sample workspace overview', () => {
  test('keeps core sample mode clearly non-live and non-premium', () => {
    const overview = getSampleWorkspaceOverview('core')

    expect(overview.access_tier).toBe('sample')
    expect(overview.billing_status).toBe('sample')
    expect(overview.offer_kind).toBe('sample')
    expect(overview.case_status).toBe('sample_preview')
    expect(overview.guided_review_included).toBe(false)
    expect(overview.review_eligibility).toBe(false)
  })

  test('exposes Reset Pro review surfaces without changing the sample boundary', () => {
    const overview = getSampleWorkspaceOverview('reset_pro')

    expect(overview.access_tier).toBe('sample')
    expect(overview.billing_status).toBe('sample')
    expect(overview.offer_kind).toBe('sample')
    expect(overview.case_status).toBe('sample_preview')
    expect(overview.guided_review_included).toBe(true)
    expect(overview.review_eligibility).toBe(true)
    expect(overview.artifact_descriptors?.some((artifact) => artifact.kind === 'reset_pro_review_packet')).toBe(true)
    expect(overview.analysis_summary?.next_session_command).toContain('Reset Pro preview')
  })
})
