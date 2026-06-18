import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import PrivateDemoPage from '../PrivateDemoPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderPrivateDemo(initialEntry = '/private-demo?market=global') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/private-demo" element={<PrivateDemoPage />} />
        <Route path="/dashboard" element={null} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
})

describe('PrivateDemoPage', () => {
  test('refuses private demo unlock when no build-time code is configured', async () => {
    const user = userEvent.setup()

    renderPrivateDemo()

    expect(screen.getByText(/Private demo access is intentionally disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/3-minute path through Mission HQ/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Demo code/i), 'anything')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByText(/Private demo access is disabled in this build/i)).toBeInTheDocument()
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
  })

  test('unlocks reset pro sample preview only with the configured private code', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')
    persistPublicReportSession(buildPublicReportSession({
      reportId: 'free-report-123',
      market: 'global',
      archetypeId: 'priya',
      axisId: 'drawdown_pressure',
      source: 'sample',
    }))

    renderPrivateDemo('/private-demo?source=free_report&report=free-report-123&archetype=priya&axis=drawdown_pressure&market=global')

    expect(screen.getByText('Report handoff packet')).toBeInTheDocument()
    expect(screen.getByText(/free-report-123/i)).toBeInTheDocument()
    expect(screen.getByText(/Dominant axis:/i)).toHaveTextContent('Drawdown Pressure')
    expect(screen.getByText('Handoff evidence boundary')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Demo packet accepted/i)).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard')
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'global',
      samplePreview: 'reset_pro',
      caseStatus: 'sample_preview',
      demoSource: 'free_report',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
    })
  })

  test('keeps direct private-demo report links visibly weaker than upload handoffs', () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=free_report&report=free-report-123&archetype=priya&axis=drawdown_pressure&market=global')

    expect(screen.getByText('Handoff evidence boundary')).toBeInTheDocument()
    expect(screen.getByText('Direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText(/URL context only/i)).toBeInTheDocument()
    expect(screen.getByText(/Use the public upload page/i)).toBeInTheDocument()
  })
})
