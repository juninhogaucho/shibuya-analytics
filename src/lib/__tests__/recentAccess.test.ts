import { afterEach, describe, expect, test } from 'vitest'
import { getRecentActivationHandoffForIntent, rememberRecentOrderAccess } from '../recentAccess'

afterEach(() => {
  window.localStorage.clear()
})

describe('recent order access', () => {
  test('returns checkout-success activation handoff only for the matching report and locked section', () => {
    rememberRecentOrderAccess({
      email: 'founder@shibuya.test',
      orderCode: 'order_123',
      activationHandoff: {
        source: 'checkout_success',
        verifiedAt: '2026-06-23T00:00:00.000Z',
        checkoutIntent: {
          source: 'locked_insight',
          reportId: 'public-teaser-verified',
          lockedSectionId: 'edge-decay-map',
          archetypeId: 'marco',
          axisId: 'edge_decay',
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          validationSummary: 'Verified by checkout success.',
        },
      },
    })

    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'edge-decay-map',
    })).toMatchObject({
      source: 'checkout_success',
      checkoutIntent: {
        reportId: 'public-teaser-verified',
        lockedSectionId: 'edge-decay-map',
      },
    })

    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-other',
      lockedSectionId: 'edge-decay-map',
    })).toBeNull()
    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'highest-cost-state',
    })).toBeNull()
    expect(getRecentActivationHandoffForIntent({
      source: 'free_report',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'edge-decay-map',
    })).toBeNull()
  })
})
