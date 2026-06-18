import { describe, expect, test } from 'vitest'
import { appendCheckoutIntentToPath, describeCheckoutIntent, readCheckoutIntent } from '../checkoutIntent'

describe('checkout intent', () => {
  test('reads and sanitizes locked insight context from a query string', () => {
    expect(
      readCheckoutIntent(
        '?source=locked_insight&section=highest cost state&report=sample-free-report&archetype=marco&axis=edge_decay',
      ),
    ).toEqual({
      source: 'locked_insight',
      lockedSectionId: 'highest-cost-state',
      reportId: 'sample-free-report',
      archetypeId: 'marco',
      axisId: 'edge_decay',
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
      }),
    ).toBe(
      '/checkout/success?plan=shibuya_reset_pro_monthly&source=locked_insight&report=sample-free-report&section=highest-cost-state',
    )
  })

  test('describes intent with user-facing labels', () => {
    expect(describeCheckoutIntent({ source: 'locked_report' })).toBe('Locked report module')
  })
})
