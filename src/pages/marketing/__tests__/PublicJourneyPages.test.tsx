import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import FreeReportPage from '../FreeReportPage'
import PublicUploadPage from '../PublicUploadPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

describe('public Shibuya journey pages', () => {
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
