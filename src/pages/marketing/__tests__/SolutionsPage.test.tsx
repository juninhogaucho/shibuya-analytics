import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { SolutionsPage } from '../SolutionsPage'

describe('SolutionsPage', () => {
  beforeAll(() => {
    class MockIntersectionObserver {
      root = null
      rootMargin = ''
      thresholds = []
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  test('renders B2C-first actor stories with proof boundaries', () => {
    render(
      <MemoryRouter>
        <SolutionsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /The Shibuya Trader Loop/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Same product loop. Different trader truth./i })).toBeInTheDocument()
    expect(screen.getByText(/Shibuya is B2C first/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Retail trader' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prop trader' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Broker trader' })).toBeInTheDocument()
    expect(screen.getByText(/What can Shibuya do for me before I risk another session/i)).toBeInTheDocument()
    expect(screen.getByText(/The display can change. The proof contract cannot./i)).toBeInTheDocument()
  })
})
