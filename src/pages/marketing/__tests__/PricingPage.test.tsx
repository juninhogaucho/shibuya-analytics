import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import PricingPage from '../PricingPage'

vi.mock('../../../lib/api/checkout', () => ({
  trackAffiliateClick: vi.fn(),
}))

afterEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('PricingPage', () => {
  test('generic pricing does not expose a direct private demo bypass', () => {
    render(
      <MemoryRouter initialEntries={['/pricing?market=global']}>
        <PricingPage />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /Private Demo Access/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Generate Free Report First/i })).toHaveAttribute('href', '/upload?market=global')
    expect(screen.getByRole('link', { name: /^Start Reset Pro$/i })).toHaveAttribute('href', '/checkout/reset-pro-live?market=global')
    expect(screen.getByRole('link', { name: /^Start Psych Audit$/i })).toHaveAttribute('href', '/checkout/psych-audit-live?market=global')
  })

  test('locked insight pricing preserves context into checkout and private demo', () => {
    render(
      <MemoryRouter initialEntries={['/pricing?market=global&source=locked_insight&report=sample-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay']}>
        <PricingPage />
      </MemoryRouter>,
    )

    const expectedQuery = 'source=locked_insight&report=sample-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global'

    expect(screen.getByRole('link', { name: /^Start Reset Pro$/i })).toHaveAttribute(
      'href',
      `/checkout/reset-pro-live?${expectedQuery}`,
    )
    expect(screen.getByRole('link', { name: /^Start Psych Audit$/i })).toHaveAttribute(
      'href',
      `/checkout/psych-audit-live?${expectedQuery}`,
    )
    expect(screen.getByRole('link', { name: /Continue Private Demo Gate/i })).toHaveAttribute(
      'href',
      `/private-demo?${expectedQuery}`,
    )
  })
})
