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
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          validationSummary: 'Verified by checkout success.',
          storySource: 'guided',
          visitedSceneCount: 6,
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

  test('rejects checkout-success activation handoffs with non-canonical story identity', () => {
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
          axisId: 'revenge',
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge'],
          signalMarkerIds: ['mirror_selected', 'fake_marker'],
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          validationSummary: 'Verified by checkout success.',
          storySource: 'guided',
          visitedSceneCount: 6,
        },
      },
    })

    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'edge-decay-map',
      archetypeId: 'marco',
      axisId: 'edge_decay',
    })).toBeNull()
  })

  test('rejects checkout-success activation handoffs without verified backend receipt proof', () => {
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
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Local preview only',
          productionArtifactProven: false,
          validationSummary: 'Verified by checkout success.',
          storySource: 'guided',
          visitedSceneCount: 6,
        },
      },
    })

    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'edge-decay-map',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      storySource: 'guided',
      visitedSceneCount: 6,
      selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })).toBeNull()
  })

  test('rejects canonical handoffs when route identity does not match checkout success identity', () => {
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
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          validationSummary: 'Verified by checkout success.',
          storySource: 'guided',
          visitedSceneCount: 6,
        },
      },
    })

    expect(getRecentActivationHandoffForIntent({
      source: 'locked_insight',
      reportId: 'public-teaser-verified',
      lockedSectionId: 'edge-decay-map',
      archetypeId: 'marco',
      axisId: 'revenge_reentry',
      storySource: 'guided',
      visitedSceneCount: 6,
      selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })).toBeNull()
  })
})
