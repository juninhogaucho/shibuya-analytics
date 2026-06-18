import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import { AppRoutes } from '../routes'

vi.mock('../../components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../pages/marketing/HomePage', () => ({
  default: () => <div>Home route</div>,
}))

vi.mock('../../pages/marketing/LaunchSignalPage', () => ({
  default: () => <div>Launch signal route</div>,
}))

vi.mock('../../pages/marketing/PricingPage', () => ({
  default: () => <div>Pricing route</div>,
}))

vi.mock('../../pages/marketing/PublicUploadPage', () => ({
  default: () => <div>Public upload route</div>,
}))

vi.mock('../../pages/marketing/FreeReportPage', () => ({
  default: () => <div>Free report route</div>,
}))

vi.mock('../../pages/marketing/LockedInsightPage', () => ({
  default: () => <div>Locked insight route</div>,
}))

vi.mock('../../pages/marketing/PartnersPage', () => ({
  PartnersPage: () => <div>Partners route</div>,
}))

describe('public route contract', () => {
  test('/signal serves the private launch signal while the full story is gated one click deeper', async () => {
    render(
      <MemoryRouter initialEntries={['/signal']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Launch signal route')).toBeInTheDocument()
  })

  test('/intl serves the global direct-trader homepage', async () => {
    render(
      <MemoryRouter initialEntries={['/intl']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Home route')).toBeInTheDocument()
  })

  test('/story serves the guided direct-trader homepage', async () => {
    render(
      <MemoryRouter initialEntries={['/story']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Home route')).toBeInTheDocument()
  })

  test('/checkout redirects to pricing instead of falling through', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Pricing route')).toBeInTheDocument()
  })

  test('/upload serves the public upload continuation after the story', async () => {
    render(
      <MemoryRouter initialEntries={['/upload?market=india&archetype=priya&axis=drawdown_pressure']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Public upload route')).toBeInTheDocument()
  })

  test('/report/:id serves the free report preview after upload', async () => {
    render(
      <MemoryRouter initialEntries={['/report/sample-free-report?market=india']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Free report route')).toBeInTheDocument()
  })

  test('/insight/:section serves the locked private insight interstitial', async () => {
    render(
      <MemoryRouter initialEntries={['/insight/highest-cost-state?market=india&report=sample-free-report']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Locked insight route')).toBeInTheDocument()
  })

  test('/private-demo serves the gated Reset Pro demo entry', async () => {
    render(
      <MemoryRouter initialEntries={['/private-demo?market=global']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Private demo preflight')).toBeInTheDocument()
  })

  test('/demo serves the controlled IFX demo launcher', async () => {
    render(
      <MemoryRouter initialEntries={['/demo?market=global']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /One controlled path from story to append-proof close/i })).toBeInTheDocument()
  })

  test('/ifx-demo serves the controlled IFX demo launcher alias', async () => {
    render(
      <MemoryRouter initialEntries={['/ifx-demo?market=india']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /One controlled path from story to append-proof close/i })).toBeInTheDocument()
  })

  test('/enterprise hands B2B traffic to the partner route', async () => {
    render(
      <MemoryRouter initialEntries={['/enterprise']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Partners route')).toBeInTheDocument()
  })

  test('/firms hands B2B traffic to the partner route', async () => {
    render(
      <MemoryRouter initialEntries={['/firms']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Partners route')).toBeInTheDocument()
  })
})
