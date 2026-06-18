import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import StoryExperience from '../../../components/landing/StoryExperience'
import { getPublicReportEngagement } from '../../../lib/publicReportEngagement'
import { getPublicReportSession } from '../../../lib/publicReportSession'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import { DemoLauncherPage } from '../DemoLauncherPage'
import FreeReportPage from '../FreeReportPage'
import LockedInsightPage from '../LockedInsightPage'
import PrivateDemoPage from '../PrivateDemoPage'
import PublicUploadPage from '../PublicUploadPage'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  window.localStorage.clear()
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
    expect(screen.getByText('Why this hypothesis followed you here')).toBeInTheDocument()
    expect(screen.getByText('Mirror selected')).toBeInTheDocument()
    expect(screen.getByText('Pain axis tapped')).toBeInTheDocument()
    expect(screen.getByText('Evidence intent')).toBeInTheDocument()
    expect(screen.getByText(/These are public website markers only/i)).toBeInTheDocument()
    expect(screen.getByText('Prediction survival test')).toBeInTheDocument()
    expect(screen.getByText('What is allowed to survive from story to report.')).toBeInTheDocument()
    expect(screen.getByText('Public prediction')).toBeInTheDocument()
    expect(screen.getByText('Priya: Prop evaluation survivor / Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText(/Carried from the guided StoryExperience after 1 scene/i)).toBeInTheDocument()
    expect(screen.getByText('What survives upload')).toBeInTheDocument()
    expect(screen.getByText('Still locked')).toBeInTheDocument()
    expect(screen.getByText('Account-specific conclusion')).toBeInTheDocument()
    expect(screen.getByText(/Survival rule: if a claim requires account-specific proof/i)).toBeInTheDocument()
    expect(screen.getByText('Report packet contract')).toBeInTheDocument()
    expect(screen.getByText('What this upload step is allowed to prove.')).toBeInTheDocument()
    expect(screen.getByText(/Creates a local report handoff with source, market, archetype/i)).toBeInTheDocument()
    expect(screen.getByText(/Stores no raw trade rows in this public preview surface/i)).toBeInTheDocument()
    expect(screen.getByText(/Requires live backend normalization before any account-specific private claim/i)).toBeInTheDocument()
    expect(screen.getByText('Sample handoff receipt')).toBeInTheDocument()
    expect(screen.getByText('Before the click, this is exactly what the sample report will carry.')).toBeInTheDocument()
    expect(screen.getByText('Packet source')).toBeInTheDocument()
    expect(screen.getByText('Local sample history packet')).toBeInTheDocument()
    expect(screen.getByText('Carries forward')).toBeInTheDocument()
    expect(screen.getByText('INDIA / Priya / Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText(/Story guided; scenes 1; pain Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText('Report unlock path')).toBeInTheDocument()
    expect(screen.getByText('Free report -> locked insight -> private demo gate')).toBeInTheDocument()
    expect(screen.getByText('Refuses to claim')).toBeInTheDocument()
    expect(screen.getByText('No raw rows, no production normalization, no account-specific conclusion.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate Guided Sample Report/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))

    expect(screen.getByRole('heading', { name: /Your baseline is forming/i })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=1')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Public story handoff: guided StoryExperience route.')).toBeInTheDocument()
    expect(screen.getByText('Selected public pain axes: Drawdown Pressure.')).toBeInTheDocument()
    expect(screen.getByText('Website-level signal markers: Mirror selected, Pain axis tapped, Evidence intent.')).toBeInTheDocument()
    expect(screen.getByText('Report-to-private handoff receipt')).toBeInTheDocument()
    expect(screen.getByText('The report can carry context. It cannot carry the answer.')).toBeInTheDocument()
    expect(screen.getByText('Private question carried')).toBeInTheDocument()
    expect(screen.getByText('Proof remains locked')).toBeInTheDocument()
    expect(screen.getByText(/the locked insight inherits the question and evidence status only/i)).toBeInTheDocument()
    expect(screen.getByText('Report engagement ledger')).toBeInTheDocument()
    expect(screen.getByText('Conversion intent is tracked locally. It is not trader evidence.')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('1 time')).toBeInTheDocument()
    })
    expect(screen.getByText('No locked click yet')).toBeInTheDocument()
    expect(screen.getByText(/report views, locked-section clicks, and private-demo intent are stored as local routing metadata only/i)).toBeInTheDocument()
    expect(screen.getByText('Prediction survival check')).toBeInTheDocument()
    expect(screen.getByText('What survived from the public story?')).toBeInTheDocument()
    expect(screen.getByText(/Guided StoryExperience signal: 1 scene viewed; public pain axes: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText('Why this report path exists')).toBeInTheDocument()
    expect(screen.getByText(/This is a website-level handoff/i)).toBeInTheDocument()
    expect(screen.getByText(/Live workspace evidence must still prove the pattern/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText('What the private workspace must decide next.')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro should decide whether pressure changes the account before the breach/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Does the trader become a different operator near the drawdown line/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Live workspace must prove')).toBeInTheDocument()
    expect(screen.getByText('Private demo may show')).toBeInTheDocument()
    expect(screen.getByText(/This bridge is a product handoff, not a live diagnosis/i)).toBeInTheDocument()
    expect(screen.getByText('IFX guided continuation')).toBeInTheDocument()
    expect(screen.getByText('The next click should answer one private question.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/breach-sequence?source=guided_report&report=sample-behavioral-leak-report&archetype=priya&axis=drawdown_pressure&story=guided&scene_count=1&pain_axes=drawdown_pressure&signals=mirror_selected%2Cpain_axis_selected%2Cupload_intent&market=india',
    )

    await user.click(screen.getByRole('link', { name: /Continue Guided Storyline/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/insight/breach-sequence')
    expect(getPublicReportEngagement('sample-behavioral-leak-report')).toMatchObject({
      viewCount: 1,
      lockedSectionClicks: [
        expect.objectContaining({ sectionId: 'breach-sequence' }),
      ],
    })
    expect(screen.getByRole('heading', { name: /This is where recognition becomes evidence/i })).toBeInTheDocument()
    expect(screen.getByText('Private insight decision gate')).toBeInTheDocument()
    expect(screen.getByText('Locked insight presenter guardrail')).toBeInTheDocument()
    expect(screen.getByText('Keep the story sharp without pretending the answer is live.')).toBeInTheDocument()
    expect(screen.getByText('Say')).toBeInTheDocument()
    expect(screen.getByText('This page carries the exact private question the public story earned.')).toBeInTheDocument()
    expect(screen.getByText('Do not say')).toBeInTheDocument()
    expect(screen.getByText('Do not say Shibuya has answered that question from URL context or sample data.')).toBeInTheDocument()
    expect(screen.getByText('Next click')).toBeInTheDocument()
    expect(screen.getByText('Open the private demo gate only after naming the proof still missing.')).toBeInTheDocument()
    expect(screen.getByText(/the locked insight is a proof contract, not a private conclusion/i)).toBeInTheDocument()
    expect(screen.getByText('Requested locked module')).toBeInTheDocument()
    expect(screen.getAllByText('Breach sequence').length).toBeGreaterThan(0)
    expect(screen.getByText('Private gate handoff checksum')).toBeInTheDocument()
    expect(screen.getByText('Verify the route before opening Reset Pro.')).toBeInTheDocument()
    expect(screen.getByText('Route identity')).toBeInTheDocument()
    expect(screen.getByText('source=locked_insight; report=sample-behavioral-leak-report; section=breach-sequence')).toBeInTheDocument()
    expect(screen.getByText('Trader question')).toBeInTheDocument()
    expect(screen.getByText('archetype=priya; axis=drawdown_pressure')).toBeInTheDocument()
    expect(screen.getByText('Story evidence context')).toBeInTheDocument()
    expect(screen.getByText('story=guided; scene_count=1; pain_axes=drawdown_pressure; signals=mirror_selected,pain_axis_selected,upload_intent')).toBeInTheDocument()
    expect(screen.getByText('Claim boundary')).toBeInTheDocument()
    expect(screen.getByText('sample route, not live answer')).toBeInTheDocument()
    expect(screen.getByText(/the founder gate may preserve route identity/i)).toBeInTheDocument()
    expect(screen.getByText('Locked insight engagement ledger')).toBeInTheDocument()
    expect(screen.getByText('The click proves intent. It does not prove the answer.')).toBeInTheDocument()
    expect(screen.getByText('1 click')).toBeInTheDocument()
    expect(screen.getByText(/route evidence only, never trading evidence/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Continue To Private Demo Gate/i }))

    expect(getPublicReportEngagement('sample-behavioral-leak-report')).toMatchObject({
      privateDemoIntentCount: 1,
    })
    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getAllByText(/sample-behavioral-leak-report/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Dominant axis:/i)).toHaveTextContent('Drawdown Pressure')
    expect(screen.getByText('Locked insight intent')).toBeInTheDocument()
    expect(screen.getAllByText('Breach sequence').length).toBeGreaterThan(0)
    expect(screen.getByText('Evidence boundary')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Demo packet accepted/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Public pain axes: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('What Reset Pro preview receives after unlock.')).toBeInTheDocument()
    expect(screen.getByText('Public signal markers')).toBeInTheDocument()
    expect(screen.getAllByText('Mirror selected, Pain axis tapped, Evidence intent').length).toBeGreaterThan(0)

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=india')
    expect(screen.getByText('Reset Pro dashboard route')).toBeInTheDocument()
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'india',
      samplePreview: 'reset_pro',
      caseStatus: 'sample_preview',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 1,
      demoSignalMarkerIds: ['mirror_selected', 'pain_axis_selected', 'upload_intent'],
      demoLockedSectionId: 'breach-sequence',
      demoLockedSectionTitle: 'Breach sequence',
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
    expect(screen.getByText('Prediction survival test')).toBeInTheDocument()
    expect(screen.getByText('Priya: Prop evaluation survivor / Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Selected on this upload page without a guided story packet.')).toBeInTheDocument()
    expect(screen.getByText(/Only secret-free metadata survives in this public preview/i)).toBeInTheDocument()

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
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/breach-sequence?source=guided_report&report=sample-behavioral-leak-report&archetype=priya&axis=drawdown_pressure&story=direct&scene_count=4&pain_axes=drawdown_pressure&market=india',
    )
  })

  test('controlled launcher upload creates an explicit demo launcher sample report packet', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/upload?market=global&demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,pain_axis_selected,scene_depth_light,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText(/This route is marked as a controlled launcher sample/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Generate Guided Sample Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    expect(screen.getByTestId('location')).toHaveTextContent('demo_packet=launcher_sample')
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Demo launcher initialized this sample packet from an explicit shared-link flag.')).toBeInTheDocument()
    expect(screen.getByText('No visitor file, raw trade row, production upload, or account-specific analysis is claimed.')).toBeInTheDocument()
    expect(screen.getByText(/Guided StoryExperience signal: 6 scenes viewed; public pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&demo_packet=launcher_sample&market=global',
    )

    await waitFor(() => {
      expect(getPublicReportSession('sample-behavioral-leak-report')?.evidenceLabel).toBe('Demo launcher sample packet')
    })
  })

  test('IFX launcher upload path carries controlled sample context into Reset Pro dashboard metadata', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    render(
      <MemoryRouter initialEntries={['/demo?market=global']}>
        <Routes>
          <Route path="/demo" element={<DemoLauncherPage />} />
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/insight/:section" element={<LockedInsightPage />} />
          <Route path="/private-demo" element={<PrivateDemoPage />} />
          <Route path="/dashboard" element={<div>Reset Pro dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /Open Upload/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('demo_packet=launcher_sample')
    expect(screen.getByText(/This route is marked as a controlled launcher sample/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Generate Guided Sample Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    expect(screen.getByTestId('location')).toHaveTextContent('demo_packet=launcher_sample')
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('link', { name: /Continue Guided Storyline/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/insight/edge-decay-map')
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Private insight decision gate')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Continue To Private Demo Gate/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('guided; scenes 6')).toBeInTheDocument()
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(1)

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    await user.type(screen.getByLabelText(/Demo code/i), 'founder-only')
    await user.click(screen.getByRole('button', { name: /Unlock Reset Pro Preview/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    expect(screen.getByText('Reset Pro dashboard route')).toBeInTheDocument()
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'global',
      samplePreview: 'reset_pro',
      caseStatus: 'sample_preview',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'marco',
      demoAxisId: 'edge_decay',
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Demo launcher sample packet',
      demoValidationSummary: 'Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['edge_decay'],
      demoVisitedSceneCount: 6,
      demoSignalMarkerIds: ['mirror_selected', 'pain_axis_selected', 'scene_depth_light', 'upload_intent'],
      demoLockedSectionId: 'edge-decay-map',
      demoLockedSectionTitle: 'Edge decay map',
      demoBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      demoBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
    })
  })

  test('upload paste validation rejects prose and accepts a trade table', async () => {
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

    const sampleInput = screen.getByLabelText(/Or paste a small trade sample/i)

    expect(screen.getByText(/Pasted samples need a header row plus one trade row/i)).toBeInTheDocument()

    await user.type(sampleInput, 'I overtrade during volatility and need this to become a report even though it is not a table.')
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=india&archetype=priya&axis=drawdown_pressure')
    expect(screen.getByText(/Paste a table-like sample, not free text/i)).toBeInTheDocument()

    await user.clear(sampleInput)
    await user.type(sampleInput, 'date,symbol,side,size,entry,exit,pnl\n2026-06-18,NIFTY,buy,1,100,101,50')
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/report/free-report-')
    expect(screen.getByText('Public report packet')).toBeInTheDocument()
    expect(screen.getAllByText('Pasted trade sample').length).toBeGreaterThan(0)
    expect(screen.getByText(/Pasted sample passed local structure check/i)).toBeInTheDocument()
    expect(screen.getByText(/Raw file contents and pasted trade rows are not stored/i)).toBeInTheDocument()
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
    expect(screen.getAllByText(/Is the trader defending a setup that no longer deserves the same risk/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Private insight contract')).toBeInTheDocument()
    expect(screen.getByText(/The private layer separates real edge decay from ordinary variance/i)).toBeInTheDocument()
    expect(screen.getByText(/No guaranteed profit uplift/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Open Private Demo Gate/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Via Locked Insight/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^Open Locked Insight First$/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^Open Edge decay map$/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /^View Paid Ladder$/i })).toHaveAttribute(
      'href',
      '/pricing?market=global',
    )
    expect(screen.queryByRole('link', { name: /^Start Reset Pro$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Start Psych Audit$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Preview Reset Pro/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Private Insight Gate/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
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
    expect(screen.queryByRole('link', { name: /Open Private Demo Gate/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Via Locked Insight/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock Highest-cost state/i })).toHaveAttribute(
      'href',
      '/insight/highest-cost-state?source=locked_report&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
  })

  test('demo launcher report link seeds an explicit sample packet without claiming live upload', async () => {
    render(
      <MemoryRouter initialEntries={['/report/sample-behavioral-leak-report?market=global&demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.').length).toBeGreaterThan(0)
    expect(screen.getByText('Demo launcher initialized this sample packet from an explicit shared-link flag.')).toBeInTheDocument()
    expect(screen.getByText('No visitor file, raw trade row, production upload, or account-specific analysis is claimed.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&demo_packet=launcher_sample&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock Highest-cost state/i })).toHaveAttribute(
      'href',
      '/insight/highest-cost-state?source=locked_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&demo_packet=launcher_sample&market=global',
    )

    await waitFor(() => {
      expect(getPublicReportSession('sample-behavioral-leak-report')?.evidenceLabel).toBe('Demo launcher sample packet')
    })
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
    expect(screen.getByText('Private insight decision gate')).toBeInTheDocument()
    expect(screen.getByText('This page carries a question, not an answer.')).toBeInTheDocument()
    expect(screen.getByText('Locked insight presenter guardrail')).toBeInTheDocument()
    expect(screen.getByText(/Open the private demo gate only after naming the proof still missing/i)).toBeInTheDocument()
    expect(screen.getByText('Public packet')).toBeInTheDocument()
    expect(screen.getByText('Private question')).toBeInTheDocument()
    expect(screen.getByText('Proof missing')).toBeInTheDocument()
    expect(screen.getByText('Requested locked module')).toBeInTheDocument()
    expect(screen.getAllByText('Highest-cost state').length).toBeGreaterThan(0)
    expect(screen.getByText('Private module preview')).toBeInTheDocument()
    expect(screen.getByText('Live workspace shows')).toBeInTheDocument()
    expect(screen.getByText('Demo may preview')).toBeInTheDocument()
    expect(screen.getByText('Proof required')).toBeInTheDocument()
    expect(screen.getByText(/The behavioral state carrying the largest estimated cost/i)).toBeInTheDocument()
    expect(screen.getByText('Direct-link fallback only')).toBeInTheDocument()
    expect(screen.getByText(/no buy\/sell instruction/i)).toBeInTheDocument()
    expect(screen.getByText('Founder demo continuation')).toBeInTheDocument()
    expect(screen.getByText('Carry this locked question into Reset Pro.')).toBeInTheDocument()
    expect(screen.getByText('Private gate handoff checksum')).toBeInTheDocument()
    expect(screen.getByText('Verify the route before opening Reset Pro.')).toBeInTheDocument()
    expect(screen.getByText('source=locked_insight; report=sample-free-report; section=highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('archetype=marco; axis=edge_decay')).toBeInTheDocument()
    expect(screen.getByText('story context not attached')).toBeInTheDocument()
    expect(screen.getByText('sample route, not live answer')).toBeInTheDocument()
    expect(screen.getByText(/Demo packet to carry/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Pro decision-room handoff')).toBeInTheDocument()
    expect(screen.getByText('Turn the locked question into a demo route, not a claim.')).toBeInTheDocument()
    expect(screen.getByText('Opening line')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro is not answering "Is the trader defending a setup that no longer deserves the same risk\?" yet/i)).toBeInTheDocument()
    expect(screen.getByText('One surface to show')).toBeInTheDocument()
    expect(screen.getAllByText('Sample cost-state card and founder talk track.').length).toBeGreaterThan(1)
    expect(screen.getByText('Evidence checkpoint')).toBeInTheDocument()
    expect(screen.getAllByText('Normalized trade history with enough rows to estimate repeat behavioral cost.').length).toBeGreaterThan(1)
    expect(screen.getByText('Close condition')).toBeInTheDocument()
    expect(screen.getByText(/End on append proof\. The question stays unresolved/i)).toBeInTheDocument()
    expect(screen.getByText(/Decision-room rule: the private demo can show workflow relevance/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue To Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=sample-free-report&archetype=marco&axis=edge_decay&section=highest-cost-state&market=global',
    )
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
    expect(screen.getByText('Private insight decision gate')).toBeInTheDocument()
    expect(screen.getByText(/Blocks the answer until activation, upload, generated artifacts, and append history exist/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Pro decision-room handoff')).toBeInTheDocument()
    expect(screen.getByText(/Turn the locked question into a demo route, not a claim/i)).toBeInTheDocument()
    expect(screen.getByText(/only live data can answer the carried private question/i)).toBeInTheDocument()
    expect(screen.getByText('Private gate handoff checksum')).toBeInTheDocument()
    expect(screen.getByText('story=guided; scene_count=6; pain_axes=edge_decay; signals=none')).toBeInTheDocument()
    expect(screen.getByText(/URL story context only: guided; scenes 6; axes 1/i)).toBeInTheDocument()
    expect(screen.getByText(/No local upload-step validation packet was found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue To Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=shareable-report&archetype=marco&axis=edge_decay&section=highest-cost-state&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=shareable-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=shareable-report&archetype=marco&axis=edge_decay&section=highest-cost-state&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
  })

  test('demo launcher locked insight link seeds the same sample packet before private demo', async () => {
    render(
      <MemoryRouter initialEntries={['/insight/edge-decay-map?market=global&demo_packet=launcher_sample&source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.').length).toBeGreaterThan(0)
    expect(screen.getByText(/sample demo artifact/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue To Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&demo_packet=launcher_sample&market=global',
    )

    await waitFor(() => {
      expect(getPublicReportSession('sample-behavioral-leak-report')?.evidenceLabel).toBe('Demo launcher sample packet')
    })
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
    expect(screen.getAllByText(/Demo packet accepted/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Origin report')).toBeInTheDocument()
    expect(screen.getByText('sample-behavioral-leak-report')).toBeInTheDocument()
    expect(screen.getByText('Founder demo continuation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue To Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=sample-behavioral-leak-report&archetype=priya&axis=drawdown_pressure&section=highest-cost-state&story=direct&scene_count=4&pain_axes=drawdown_pressure&market=india',
    )
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
    await user.click(screen.getByRole('link', { name: /Continue To Private Demo Gate/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(screen.getByText('Locked insight intent')).toBeInTheDocument()
    expect(screen.getAllByText('Highest-cost state').length).toBeGreaterThan(0)
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
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
