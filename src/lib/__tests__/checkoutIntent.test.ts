import { describe, expect, test } from 'vitest'
import { appendCheckoutIntentToPath, describeCheckoutIntent, enrichCheckoutIntent, readCheckoutIntent } from '../checkoutIntent'

describe('checkout intent', () => {
  test('reads and sanitizes locked insight context from a query string', () => {
    expect(
      readCheckoutIntent(
        '?source=locked_insight&section=highest cost state&report=sample-free-report&archetype=marco&axis=edge_decay&story=guided&scene_count=99&pain_axes=edge_decay,not real,edge_decay',
      ),
    ).toEqual({
      source: 'locked_insight',
      lockedSectionId: 'highest-cost-state',
      reportId: 'sample-free-report',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      storySource: 'guided',
      visitedSceneCount: 15,
      selectedPainAxisIds: ['edge_decay', 'not-real'],
    })
  })

  test('ignores unknown sources instead of carrying unsafe funnel state', () => {
    expect(readCheckoutIntent('?source=unknown&section=highest-cost-state')).toBeNull()
  })

  test('appends intent without disturbing existing checkout params', () => {
    expect(
      appendCheckoutIntentToPath('/checkout/success?plan=shibuya_reset_pro_monthly', {
        source: 'locked_insight',
        reportId: 'sample-free-report',
        lockedSectionId: 'highest-cost-state',
        storySource: 'guided',
        visitedSceneCount: 6,
        selectedPainAxisIds: ['edge_decay'],
      }),
    ).toBe(
      '/checkout/success?plan=shibuya_reset_pro_monthly&source=locked_insight&report=sample-free-report&section=highest-cost-state&story=guided&scene_count=6&pain_axes=edge_decay',
    )
  })

  test('enriches a route intent with local report packet context', () => {
    expect(
      enrichCheckoutIntent(
        {
          source: 'locked_insight',
          reportId: 'sample-free-report',
          lockedSectionId: 'highest-cost-state',
        },
        {
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay'],
        },
      ),
    ).toEqual({
      source: 'locked_insight',
      reportId: 'sample-free-report',
      lockedSectionId: 'highest-cost-state',
      storySource: 'guided',
      visitedSceneCount: 6,
      selectedPainAxisIds: ['edge_decay'],
    })
  })

  test('describes intent with user-facing labels', () => {
    expect(describeCheckoutIntent({ source: 'locked_report' })).toBe('Locked report module')
  })
})
