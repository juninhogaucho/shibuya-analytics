import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, describe, expect, test } from 'vitest'
import { AuthGuard } from '../AuthGuard'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../lib/runtime'

afterEach(() => {
  window.localStorage.clear()
})

describe('AuthGuard', () => {
  test('renders children for live users', () => {
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, 'live-token')

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected workspace')).toBeInTheDocument()
  })

  test('renders children for private Reset Pro sample users with an unlock receipt', () => {
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
    window.localStorage.setItem(
      SHIBUYA_SESSION_META_STORAGE_KEY,
      JSON.stringify({
        tier: 'sample',
        market: 'global',
        offerKind: 'sample',
        caseStatus: 'sample_preview',
        samplePreview: 'reset_pro',
        demoSource: 'locked_insight',
        demoReportId: 'sample-behavioral-leak-report',
        demoPrivateGateChecksum: 'source=locked_insight; report=sample-behavioral-leak-report; sample route, not live answer',
        demoUnlockReceiptId: 'reset-pro-demo:global:locked-insight:sample-behavioral-leak-report:marco:edge-decay:edge-decay-map',
        demoUnlockBoundary: 'Founder code opened sample Reset Pro access only.',
      }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected workspace')).toBeInTheDocument()
  })

  test('redirects anonymous users to activation', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
          <Route path="/activate" element={<div>Activation page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Activation page')).toBeInTheDocument()
  })

  test('redirects stale sample users back to the private demo gate', () => {
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
    window.localStorage.setItem(
      SHIBUYA_SESSION_META_STORAGE_KEY,
      JSON.stringify({
        tier: 'sample',
        market: 'global',
        offerKind: 'sample',
        caseStatus: 'sample_preview',
        samplePreview: 'reset_pro',
      }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
          <Route path="/private-demo" element={<div>Private demo gate</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Private demo gate')).toBeInTheDocument()
  })
})
