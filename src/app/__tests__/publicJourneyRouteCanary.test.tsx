import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '../routes'
import { getPublicReportEngagement } from '../../lib/publicReportEngagement'
import {
  SHIBUYA_API_KEY_STORAGE_KEY,
  SHIBUYA_SAMPLE_API_KEY,
  SHIBUYA_SESSION_META_STORAGE_KEY,
} from '../../lib/runtime'

vi.unmock('../../components/AuthGuard')
vi.unmock('../../lib/runtime')
vi.unmock('../../pages/marketing/HomePage')
vi.unmock('../../pages/marketing/PublicUploadPage')
vi.unmock('../../pages/marketing/FreeReportPage')
vi.unmock('../../pages/marketing/LockedInsightPage')
vi.unmock('../../pages/marketing/PrivateDemoPage')
vi.unmock('../../pages/dashboard/OverviewPage')

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
})

describe('public Shibuya route canary', () => {
  test('guided public story unlocks through AppRoutes into the real Reset Pro command center', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'presenter-only')

    const app = (
      <MemoryRouter initialEntries={['/story?market=india']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    )

    render(app)

    expect((await screen.findAllByRole('heading', { name: /The market did not break you/i }, { timeout: 5000 })).length).toBeGreaterThan(0)
    expect(screen.getByText(/The first public job is recognition/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /I changed near the limit line/i }))
    expect(await screen.findByText(/Current hypothesis: Priya \/ Prop evaluation survivor with Drawdown Pressure/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: /Turn Mirror Into Evidence/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    })
    expect(await screen.findByRole('heading', { name: /Upload your trade history/i })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByText('Story-first context is attached.')).toBeInTheDocument()
    expect(screen.getByText('Report packet contract')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Use Sample History/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    })
    expect(await screen.findByRole('heading', { name: /Your baseline is forming/i }, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    expect(screen.getByText('Report-to-private handoff receipt')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro should decide whether pressure changes the account before the breach/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Continue Guided Storyline/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/insight/breach-sequence')
    })
    expect(await screen.findByRole('heading', { name: /This is where recognition becomes evidence/i }, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByText('Private insight decision gate')).toBeInTheDocument()
    expect(screen.getByText('Private gate handoff checksum')).toBeInTheDocument()
    expect(getPublicReportEngagement('sample-behavioral-leak-report')).toMatchObject({
      viewCount: 1,
      lockedSectionClicks: [
        expect.objectContaining({ sectionId: 'breach-sequence' }),
      ],
    })

    await user.click(screen.getByRole('link', { name: /Continue To Private Demo Gate/i }))

    expect(await screen.findByText('Private demo preflight')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('Presenter demo code configured')).toBeInTheDocument()
    expect(screen.getByText('Locked insight intent verified')).toBeInTheDocument()
    expect(screen.getByText(/Do not claim live activation, backend normalization, or account-specific improvement/i)).toBeInTheDocument()

    const demoCodeInput = screen.getByLabelText(/Demo code/i)
    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(demoCodeInput, 'presenter-only')
    expect(demoCodeInput).toHaveValue('presenter-only')
    fireEvent.submit(demoCodeInput.closest('form') as HTMLFormElement)
    expect(screen.queryByText(/That demo code does not unlock/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Acknowledge the evidence boundary/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Open a locked private insight/i)).not.toBeInTheDocument()
    await waitFor(() => {
      expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    })

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'india',
      samplePreview: 'reset_pro',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoLockedSectionId: 'breach-sequence',
      demoLockedSectionTitle: 'Breach sequence',
      demoEngagementReportViewCount: 1,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
    })

    cleanup()

    render(
      <MemoryRouter initialEntries={['/dashboard?market=india']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=india')
    expect(await screen.findByText('PRIVATE RESET PRO DEMO', undefined, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByText('RESET PRO UNLOCK RECEIPT')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro received the public question; the sample workspace can only show the operating loop.')).toBeInTheDocument()
    expect(screen.getByText('Requested private insight: Breach sequence')).toBeInTheDocument()
    expect(screen.getByText('Live Reset Pro must prove')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Append Proof' }).some((link) => link.getAttribute('href') === '/dashboard/upload?market=india')).toBe(true)
    expect(screen.getByText(/Live Reset Pro requires payment, activation, first meaningful upload/i)).toBeInTheDocument()

    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'india',
      samplePreview: 'reset_pro',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoLockedSectionId: 'breach-sequence',
      demoLockedSectionTitle: 'Breach sequence',
      demoEngagementReportViewCount: 1,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
    })
  })
})
