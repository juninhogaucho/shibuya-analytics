import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import StoryExperience from '../../../components/landing/StoryExperience'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import FreeReportPage from '../FreeReportPage'
import LockedInsightPage from '../LockedInsightPage'
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
          <Route path="/insight/:section" element={<LockedInsightPage />} />
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
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
    expect(screen.getByText('Story handoff packet')).toBeInTheDocument()
    expect(screen.getByText('Guided StoryExperience route')).toBeInTheDocument()
    expect(screen.getByText('Selected public pain')).toBeInTheDocument()
    expect(screen.getAllByText('Drawdown Pressure').length).toBeGreaterThan(0)
    expect(screen.getByText('Current upload hypothesis')).toBeInTheDocument()
    expect(screen.getByText('Priya / Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Report packet contract')).toBeInTheDocument()
    expect(screen.getByText('What this upload step is allowed to prove.')).toBeInTheDocument()
    expect(screen.getByText(/Creates a local report handoff with source, market, archetype/i)).toBeInTheDocument()
    expect(screen.getByText(/Stores no raw trade rows in this public preview surface/i)).toBeInTheDocument()
    expect(screen.getByText(/Requires live backend normalization before any account-specific private claim/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))

    expect(screen.getByRole('heading', { name: /Your baseline is forming/i })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=1')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Public story handoff: guided StoryExperience route.')).toBeInTheDocument()
    expect(screen.getByText('Selected public pain axes: Drawdown Pressure.')).toBeInTheDocument()
    expect(screen.getByText('Prediction survival check')).toBeInTheDocument()
    expect(screen.getByText('What survived from the public story?')).toBeInTheDocument()
    expect(screen.getByText(/Guided StoryExperience signal: 1 scene viewed; public pain axes: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/This is a website-level handoff/i)).toBeInTheDocument()
    expect(screen.getByText(/Live workspace evidence must still prove the pattern/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText('What the private workspace must decide next.')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro should decide whether pressure changes the account before the breach/i)).toBeInTheDocument()
    expect(screen.getByText(/Does the trader become a different operator near the drawdown line/i)).toBeInTheDocument()
    expect(screen.getByText('Live workspace must prove')).toBeInTheDocument()
    expect(screen.getByText('Private demo may show')).toBeInTheDocument()
    expect(screen.getByText(/This bridge is a product handoff, not a live diagnosis/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Private Demo Access/i }))

    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getAllByText(/sample-behavioral-leak-report/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Dominant axis:/i)).toHaveTextContent('Drawdown Pressure')
    expect(screen.getByText('Evidence boundary')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText(/Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText(/Public pain axes: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('What Reset Pro preview receives after unlock.')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=india')
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
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 1,
      demoBridgeHeadline: 'Reset Pro should decide whether pressure changes the account before the breach.',
      demoBridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
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

    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report?market=india&archetype=priya&axis=drawdown_pressure')
    expect(screen.getByText('Public report packet')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Public story handoff: direct upload route.')).toBeInTheDocument()
    expect(screen.getByText(/No production upload or account-specific analysis is claimed/i)).toBeInTheDocument()
    expect(screen.getByText('Prediction survival check')).toBeInTheDocument()
    expect(screen.getByText(/Direct report route. No guided StoryExperience packet was attached/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText(/What the private workspace must decide next/i)).toBeInTheDocument()
  })

  test('global upload route keeps story and pricing navigation in the global market', () => {
    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Skip to paid ladder/i })).toHaveAttribute('href', '/pricing?market=global')
    expect(screen.getByRole('link', { name: /Back to story/i })).toHaveAttribute('href', '/global')
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
    expect(screen.getByText('Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro should separate real edge decay from normal variance/i)).toBeInTheDocument()
    expect(screen.getByText(/Is the trader defending a setup that no longer deserves the same risk/i)).toBeInTheDocument()
    expect(screen.getByText('Private insight contract')).toBeInTheDocument()
    expect(screen.getByText(/The private layer separates real edge decay from ordinary variance/i)).toBeInTheDocument()
    expect(screen.getByText(/No guaranteed profit uplift/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^Unlock Free Report First$/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=private_insight_gate&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^Start Reset Pro$/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^Start Psych Audit$/i })).toHaveAttribute(
      'href',
      '/checkout/psych-audit-live?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.queryByRole('button', { name: /Preview Reset Pro/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Private Demo Access/i })).toHaveAttribute(
      'href',
      '/private-demo?source=free_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock Highest-cost state/i })).toHaveAttribute(
      'href',
      '/insight/highest-cost-state?source=locked_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
  })

  test('free report preserves URL story context when local upload packet is missing', () => {
    render(
      <MemoryRouter initialEntries={['/report/shareable-report?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('No local upload packet found')).toBeInTheDocument()
    expect(screen.getByText(/Guided StoryExperience signal: 6 scenes viewed; public pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/URL story context only/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=free_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock Highest-cost state/i })).toHaveAttribute(
      'href',
      '/insight/highest-cost-state?source=locked_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
  })

  test('locked report section opens the private insight interstitial before checkout', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/report/sample-free-report?market=global&archetype=marco&axis=edge_decay']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /Unlock Highest-cost state/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/insight/highest-cost-state')
    expect(screen.getByRole('heading', { name: /This is where recognition becomes evidence/i })).toBeInTheDocument()
    expect(screen.getByText('Requested locked module')).toBeInTheDocument()
    expect(screen.getAllByText('Highest-cost state').length).toBeGreaterThan(0)
    expect(screen.getByText('Private module preview')).toBeInTheDocument()
    expect(screen.getByText('Live workspace shows')).toBeInTheDocument()
    expect(screen.getByText('Demo may preview')).toBeInTheDocument()
    expect(screen.getByText('Proof required')).toBeInTheDocument()
    expect(screen.getByText(/The behavioral state carrying the largest estimated cost/i)).toBeInTheDocument()
    expect(screen.getByText('Direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText(/no buy\/sell instruction/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=sample-free-report&archetype=marco&axis=edge_decay&section=highest-cost-state&market=global',
    )
  })

  test('locked insight preserves URL story context without claiming upload evidence', () => {
    render(
      <MemoryRouter initialEntries={['/insight/highest-cost-state?market=global&source=locked_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay']}>
        <Routes>
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText(/URL story context only: guided; scenes 6; axes 1/i)).toBeInTheDocument()
    expect(screen.getByText(/No local upload-step validation packet was found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=shareable-report&archetype=marco&axis=edge_decay&section=highest-cost-state&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
  })

  test('locked insight page preserves upload-step evidence when report session exists', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/upload?market=india&archetype=priya&axis=drawdown_pressure']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))
    await user.click(screen.getByRole('link', { name: /Unlock Highest-cost state/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/insight/highest-cost-state')
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText('Origin report')).toBeInTheDocument()
    expect(screen.getByText('sample-behavioral-leak-report')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to Free Report/i })).toHaveAttribute(
      'href',
      '/report/sample-behavioral-leak-report?archetype=priya&axis=drawdown_pressure&story=direct&scene_count=4&pain_axes=drawdown_pressure&market=india',
    )
  })

  test('locked insight intent survives into the private Reset Pro demo unlock', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    render(
      <MemoryRouter initialEntries={['/upload?market=india&archetype=priya&axis=drawdown_pressure']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/insight/:section" element={<LockedInsightPage />} />
          <Route path="/private-demo" element={<PrivateDemoPage />} />
          <Route path="/dashboard" element={<div>Reset Pro dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))
    await user.click(screen.getByRole('link', { name: /Unlock Highest-cost state/i }))
    await user.click(screen.getByRole('link', { name: /Open Private Demo Gate/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(screen.getByText('Locked insight intent')).toBeInTheDocument()
    expect(screen.getAllByText('Highest-cost state').length).toBeGreaterThan(0)
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=india')
    expect(screen.getByText('Reset Pro dashboard route')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoReportSource: 'sample',
      demoLockedSectionId: 'highest-cost-state',
      demoLockedSectionTitle: 'Highest-cost state',
      demoBridgeHeadline: 'Reset Pro should decide whether pressure changes the account before the breach.',
      demoBridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
    })
  })
})
