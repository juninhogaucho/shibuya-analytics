import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import StoryExperience from '../../../components/landing/StoryExperience'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import FreeReportPage from '../FreeReportPage'
import PrivateDemoPage from '../PrivateDemoPage'
import PublicUploadPage from '../PublicUploadPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('public Shibuya journey pages', () => {
  test('full public story flow can unlock a private Reset Pro demo with report context', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<StoryExperience />} />
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/private-demo" element={<PrivateDemoPage />} />
          <Route path="/dashboard" element={<div>Reset Pro dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Priya/i }))
    await user.click(screen.getByRole('button', { name: 'Drawdown Pressure' }))
    await user.click(screen.getByRole('button', { name: /Continue To Upload/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('archetype=priya')
    expect(screen.getByTestId('location')).toHaveTextContent('axis=drawdown_pressure')

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))

    expect(screen.getByRole('heading', { name: /Your baseline is forming/i })).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Private Demo Access/i }))

    expect(screen.getByText('Report handoff packet')).toBeInTheDocument()
    expect(screen.getAllByText(/sample-behavioral-leak-report/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Dominant axis:/i)).toHaveTextContent('Drawdown Pressure')
    expect(screen.getByText('Handoff evidence boundary')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Demo packet accepted/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard')
    expect(screen.getByText('Reset Pro dashboard route')).toBeInTheDocument()
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'india',
      samplePreview: 'reset_pro',
      caseStatus: 'sample_preview',
      demoSource: 'free_report',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
    })
  })

  test('upload page carries story signal into the sample free report', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/upload?market=india&archetype=priya&axis=drawdown_pressure']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Upload your trade history/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/report/sample-behavioral-leak-report?market=india&archetype=priya&axis=drawdown_pressure',
    )
    expect(screen.getByText('Public report packet')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/No production upload or account-specific analysis is claimed/i)).toBeInTheDocument()
  })

  test('free report keeps private demo access behind activation instead of public sample mode', () => {
    render(
      <MemoryRouter initialEntries={['/report/sample-free-report?market=global&archetype=marco&axis=edge_decay']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Your baseline is forming/i })).toBeInTheDocument()
    expect(screen.getByText('Locked until live workspace')).toBeInTheDocument()
    expect(screen.getByText('Private insight contract')).toBeInTheDocument()
    expect(screen.getByText(/The private layer separates real edge decay from ordinary variance/i)).toBeInTheDocument()
    expect(screen.getByText(/No guaranteed profit uplift/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.queryByRole('button', { name: /Preview Reset Pro/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Private Demo Access/i })).toHaveAttribute(
      'href',
      '/private-demo?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock Highest-cost state/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_report&section=highest-cost-state&market=global',
    )
  })
})
