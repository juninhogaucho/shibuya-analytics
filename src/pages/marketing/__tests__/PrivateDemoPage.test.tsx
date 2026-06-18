import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { buildPublicReportSession, getPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import PrivateDemoPage from '../PrivateDemoPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
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
    expect(screen.getByText('Private demo preflight')).toBeInTheDocument()
    expect(screen.getByText('Check the handoff before unlocking the workspace.')).toBeInTheDocument()
    expect(screen.getByText('Direct private-demo entry')).toBeInTheDocument()
    expect(screen.getByText('Private demo disabled in this build')).toBeInTheDocument()
    expect(screen.getByText('Still missing by design')).toBeInTheDocument()
    expect(screen.getByText(/3-minute path through Mission HQ/i)).toBeInTheDocument()
    expect(screen.getByText('Operator runbook after unlock')).toBeInTheDocument()
    expect(screen.getByText('Four beats. Do not browse the workspace randomly.')).toBeInTheDocument()
    expect(screen.getByText('1. Open Mission HQ')).toBeInTheDocument()
    expect(screen.getByText('2. Show the private question')).toBeInTheDocument()
    expect(screen.getByText('3. Inspect intervention surfaces')).toBeInTheDocument()
    expect(screen.getByText('4. Close on append proof')).toBeInTheDocument()
    expect(screen.getByText(/presentation discipline/i)).toBeInTheDocument()

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
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure'],
      visitedSceneCount: 4,
    }))

    renderPrivateDemo('/private-demo?source=free_report&report=free-report-123&archetype=priya&axis=drawdown_pressure&market=global')

    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getByText('Private demo preflight')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(1)
    expect(screen.getByText('Private demo code configured')).toBeInTheDocument()
    expect(screen.getByText('Operator runbook after unlock')).toBeInTheDocument()
    expect(screen.getAllByText(/free-report-123/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Dominant axis:/i)).toHaveTextContent('Drawdown Pressure')
    expect(screen.getByText('Evidence boundary')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Demo packet accepted/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Story handoff: guided/i)).toBeInTheDocument()
    expect(screen.getByText(/Public pain axes: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('What Reset Pro preview receives after unlock.')).toBeInTheDocument()
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('free_report')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
    expect(screen.getAllByText('free-report-123').length).toBeGreaterThan(0)
    expect(screen.getByText('Market')).toBeInTheDocument()
    expect(screen.getAllByText('global').length).toBeGreaterThan(0)
    expect(screen.getByText('Archetype')).toBeInTheDocument()
    expect(screen.getByText('Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Dominant axis')).toBeInTheDocument()
    expect(screen.getByText('Story handoff')).toBeInTheDocument()
    expect(screen.getByText('guided; scenes 4')).toBeInTheDocument()
    expect(screen.getByText('Evidence packet')).toBeInTheDocument()
    expect(screen.getByText('Bridge question')).toBeInTheDocument()
    expect(screen.getAllByText(/Does the trader become a different operator near the drawdown line/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/demo routing context/i).length).toBeGreaterThan(0)
    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
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
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 4,
      demoBridgeHeadline: 'Reset Pro should decide whether pressure changes the account before the breach.',
      demoBridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
    })
  })

  test('requires presenter acknowledgement before unlocking with a valid private code', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=locked_insight&report=free-report-123&archetype=marco&axis=edge_decay&section=edge-decay-map&market=global')

    expect(screen.getByLabelText(/I acknowledge the private demo boundary/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByText(/Acknowledge the evidence boundary before unlocking/i)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
  })

  test('keeps direct private-demo report links visibly weaker than upload handoffs', () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=free_report&report=free-report-123&archetype=priya&axis=drawdown_pressure&story=guided&scene_count=6&pain_axes=drawdown_pressure&market=global')

    expect(screen.getByText('Evidence boundary')).toBeInTheDocument()
    expect(screen.getByText('Direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText('URL context only')).toBeInTheDocument()
    expect(screen.getAllByText(/URL context only/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Use the public upload page/i)).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided/i)).toHaveTextContent('URL context only')
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText('guided; scenes 6')).toBeInTheDocument()
  })

  test('carries URL-only story context into sample metadata without upload evidence', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=locked_insight&report=free-report-123&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&market=global')

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      demoSource: 'locked_insight',
      demoReportId: 'free-report-123',
      demoReportSource: 'direct_link',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['edge_decay'],
      demoVisitedSceneCount: 6,
      demoLockedSectionId: 'edge-decay-map',
      demoBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      demoBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
    })
  })

  test('demo launcher private gate link seeds explicit sample packet context', async () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?market=global&demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent')

    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.').length).toBeGreaterThan(0)
    expect(screen.getByText(/sample demo artifact/i)).toBeInTheDocument()
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('guided; scenes 6')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Activate Paid Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=sample-behavioral-leak-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&demo_packet=launcher_sample&market=global',
    )

    await waitFor(() => {
      expect(getPublicReportSession('sample-behavioral-leak-report')?.evidenceLabel).toBe('Demo launcher sample packet')
    })
  })

  test('carries locked insight intent into the Reset Pro sample metadata', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=locked_insight&report=free-report-123&archetype=marco&axis=edge_decay&section=edge-decay-map&market=global')

    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getByText('Locked insight intent')).toBeInTheDocument()
    expect(screen.getAllByText('Edge decay map').length).toBeGreaterThan(0)
    expect(screen.getByText(/Which setup still deserves risk/i)).toBeInTheDocument()
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getAllByText('locked_insight').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Edge decay map').length).toBeGreaterThan(1)

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      demoSource: 'locked_insight',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'marco',
      demoAxisId: 'edge_decay',
      demoReportSource: 'direct_link',
      demoLockedSectionId: 'edge-decay-map',
      demoLockedSectionTitle: 'Edge decay map',
      demoBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      demoBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
    })
  })

  test('preserves report handoff context on the paid activation link', () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    renderPrivateDemo('/private-demo?source=locked_insight&report=free-report-123&archetype=marco&axis=edge_decay&section=edge-decay-map&market=global')

    expect(screen.getByRole('link', { name: /Activate Paid Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=free-report-123&section=edge-decay-map&archetype=marco&axis=edge_decay&market=global',
    )
  })
})
