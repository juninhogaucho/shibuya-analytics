import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import StoryExperience from '../../../components/landing/StoryExperience'
import { getPublicReportEngagement } from '../../../lib/publicReportEngagement'
import {
  buildPublicReportSession,
  getPublicReportSession,
  hasCheckoutGradePublicReportSession,
  persistPublicReportSession,
} from '../../../lib/publicReportSession'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import { DemoLauncherPage } from '../DemoLauncherPage'
import FreeReportPage from '../FreeReportPage'
import LockedInsightPage from '../LockedInsightPage'
import PrivateDemoPage from '../PrivateDemoPage'
import PublicUploadPage from '../PublicUploadPage'

const publicReportMocks = vi.hoisted(() => ({
  generatePublicTeaserReport: vi.fn(),
  getPublicTeaserReport: vi.fn(),
  getPublicTeaserReportReadiness: vi.fn(),
}))

vi.mock('../../../lib/api/publicReport', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/api/publicReport')>('../../../lib/api/publicReport')

  return {
    ...actual,
    generatePublicTeaserReport: publicReportMocks.generatePublicTeaserReport,
    getPublicTeaserReport: publicReportMocks.getPublicTeaserReport,
    getPublicTeaserReportReadiness: publicReportMocks.getPublicTeaserReportReadiness,
  }
})

const BACKEND_PUBLIC_CONTEXT = {
  public_context: {
    market: 'global',
    story_source: 'guided',
    archetype_id: 'marco',
    axis_id: 'edge_decay',
    pain_axes: 'edge_decay,revenge_reentry',
    story_scene_count: '6',
    signal_markers: 'mirror_selected,upload_intent',
  },
}

const STORY_IDENTITY_ALLOWED_VALUES = {
  markets: ['global', 'india'],
  story_sources: ['direct', 'guided'],
  archetype_ids: ['john', 'marco', 'priya'],
  axis_ids: [
    'discipline_tax',
    'drawdown_pressure',
    'early_exit_bias',
    'edge_decay',
    'revenge_reentry',
    'session_fatigue',
    'size_escalation',
    'tilt_susceptibility',
  ],
  pain_axis_ids: [
    'discipline_tax',
    'drawdown_pressure',
    'early_exit_bias',
    'edge_decay',
    'revenge_reentry',
    'session_fatigue',
    'size_escalation',
    'tilt_susceptibility',
  ],
  signal_marker_ids: [
    'mirror_selected',
    'pain_axis_selected',
    'pricing_curiosity',
    'scene_depth_deep',
    'scene_depth_light',
    'upload_intent',
  ],
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  window.localStorage.clear()
  publicReportMocks.generatePublicTeaserReport.mockReset()
  publicReportMocks.getPublicTeaserReport.mockReset()
  publicReportMocks.getPublicTeaserReportReadiness.mockReset()
  vi.unstubAllEnvs()
})

describe('public Shibuya journey pages', () => {
  beforeEach(() => {
    publicReportMocks.getPublicTeaserReportReadiness.mockResolvedValue({
      status: 'ready',
      service: 'shibuya-public-teaser-report',
      accepts_csv_upload: true,
      persists_teaser_receipts: true,
      retrieves_teaser_receipts: true,
      report_type: 'teaser',
      artifact_status_required: 'backend_teaser_persisted',
      production_artifact_proven: false,
      raw_trade_rows_stored: false,
      live_private_artifact_proven: false,
      persists_story_identity: true,
      story_identity_fields: ['market', 'story_source', 'archetype_id', 'axis_id', 'pain_axes', 'story_scene_count', 'signal_markers'],
      story_identity_allowed_values: STORY_IDENTITY_ALLOWED_VALUES,
      min_trade_rows: 10,
      max_file_size_mb: 5,
      retrieval_identity: ['report_id', 'request_id'],
      blockers: [],
    })
  })

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
    await user.click(screen.getByRole('link', { name: /Continue To Upload/i }))

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
    expect(screen.getByText(/Creates a report handoff with source, market, archetype/i)).toBeInTheDocument()
    expect(screen.getByText(/Stores no raw trade rows in this public preview surface/i)).toBeInTheDocument()
    expect(screen.getByText(/Generate Free Report requires a persisted backend teaser receipt/i)).toBeInTheDocument()
    expect(screen.getByText('Live proof gap ledger')).toBeInTheDocument()
    expect(screen.getByText('Live proof has a backend target, but still needs evidence.')).toBeInTheDocument()
    expect(screen.getByText(/This ledger is stored into the report packet/i)).toBeInTheDocument()
    expect(screen.getAllByText('Backend target').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Activation').length).toBeGreaterThan(0)
    expect(screen.getAllByText('First meaningful upload').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Append history').length).toBeGreaterThan(0)
    expect(screen.getByText(/a public report may carry this ledger forward/i)).toBeInTheDocument()
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
    expect(screen.getByText('Report live-proof gap')).toBeInTheDocument()
    expect(screen.getByText(/machine-readable proof gap/i)).toBeInTheDocument()
    expect(screen.getByText(/required evidence stays incomplete until a live/i)).toBeInTheDocument()
    expect(screen.getByText('Report reveal sequence')).toBeInTheDocument()
    expect(screen.getByText('Keep the report cinematic: one baseline, one packet, one private question.')).toBeInTheDocument()
    expect(screen.getByText('0:00 / Baseline reveal')).toBeInTheDocument()
    expect(screen.getByText('0:40 / Evidence receipt')).toBeInTheDocument()
    expect(screen.getByText('1:20 / Private question')).toBeInTheDocument()
    expect(screen.getByText('2:10 / Reset Pro bridge')).toBeInTheDocument()
    expect(screen.getByText(/do not let the report become a dashboard tour/i)).toBeInTheDocument()
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
    expect(screen.getByText('Guided continuation')).toBeInTheDocument()
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
    expect(screen.getByText('Locked insight decision-room sequence')).toBeInTheDocument()
    expect(screen.getByText('Treat this page like the door into Reset Pro, not another report card.')).toBeInTheDocument()
    expect(screen.getByText('0:00 / Question lock')).toBeInTheDocument()
    expect(screen.getByText('0:35 / Proof wall')).toBeInTheDocument()
    expect(screen.getByText('1:15 / Demo route')).toBeInTheDocument()
    expect(screen.getByText('2:20 / Append close')).toBeInTheDocument()
    expect(screen.getByText(/the locked insight may carry the question into Reset Pro/i)).toBeInTheDocument()
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
    expect(screen.getByText(/the presenter gate may preserve route identity/i)).toBeInTheDocument()
    expect(screen.getByText('Locked insight engagement ledger')).toBeInTheDocument()
    expect(screen.getByText('The click proves intent. It does not prove the answer.')).toBeInTheDocument()
    expect(screen.getByText('1 click')).toBeInTheDocument()
    expect(screen.getByText(/route evidence only, never trading evidence/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Continue To Private Demo Gate/i }))

    expect(getPublicReportEngagement('sample-behavioral-leak-report')).toMatchObject({
      privateDemoIntentCount: 1,
    })
    expect(screen.getByText('Public-to-private handoff')).toBeInTheDocument()
    expect(screen.getByText('Private demo gate sequence')).toBeInTheDocument()
    expect(screen.getByText('Unlock Reset Pro like an evidence handoff, not a password wall.')).toBeInTheDocument()
    expect(screen.getByText('0:00 / Verify route')).toBeInTheDocument()
    expect(screen.getByText('0:35 / Name boundary')).toBeInTheDocument()
    expect(screen.getByText('1:10 / Store receipt')).toBeInTheDocument()
    expect(screen.getByText('1:50 / Open workspace')).toBeInTheDocument()
    expect(screen.getByText(/the code may open a sample workspace only after route integrity/i)).toBeInTheDocument()
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
    expect(screen.getByText('Private gate engagement receipt')).toBeInTheDocument()
    expect(screen.getByText('Intent survived into the presenter gate. It still is not evidence.')).toBeInTheDocument()
    expect(screen.getByText(/route continuity only, never trader proof/i)).toBeInTheDocument()
    expect(screen.getAllByText('1 time').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1 click').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1 gate attempt').length).toBeGreaterThan(0)
    expect(screen.getByText(/views, locked clicks, and gate attempts can explain routing intent only/i)).toBeInTheDocument()

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
      demoEngagementReportViewCount: 1,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementCurrentSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
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
    expect(screen.getByText('Upload route integrity')).toBeInTheDocument()
    expect(screen.getByText('Cold upload is recovery-only.')).toBeInTheDocument()
    expect(screen.getByText('Direct upload recovery route')).toBeInTheDocument()
    expect(screen.getByText('direct-public')).toBeInTheDocument()
    expect(screen.getByText(/No guided public story packet is attached/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Run StoryExperience First/i })).toHaveAttribute('href', '/')
    expect(screen.getByText('Prediction survival test')).toBeInTheDocument()
    expect(screen.getByText('Live proof gap ledger')).toBeInTheDocument()
    expect(screen.getByText(/This ledger is stored into the report packet/i)).toBeInTheDocument()
    expect(screen.getByText('Priya: Prop evaluation survivor / Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Selected on this upload page without a guided story packet.')).toBeInTheDocument()
    expect(screen.getByText(/Only secret-free metadata survives in this public preview/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report?market=india&archetype=priya&axis=drawdown_pressure')
    expect(screen.getByText('Public report packet')).toBeInTheDocument()
    expect(screen.getByText('Report live-proof gap')).toBeInTheDocument()
    expect(screen.getAllByText(/Artifact status/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Sample demo only/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Live/private artifact').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not proven').length).toBeGreaterThan(0)
    expect(screen.getByText(/Gap ledger rule/i)).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText('Public story handoff: direct upload recovery route; no guided StoryExperience packet was attached.')).toBeInTheDocument()
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

  test('eligible public paste generates a backend teaser receipt before free report', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 10 }, (_, index) => {
      const pnl = index % 2 === 0 ? 35 + index : -20 - index
      return `2026-06-${String(10 + index).padStart(2, '0')},XAUUSD,${index % 2 === 0 ? 'buy' : 'sell'},1,2300,2310,${pnl}`
    })
    const pasteBody = ['date,symbol,side,size,entry,exit,pnl', ...rows].join('\n')

    publicReportMocks.generatePublicTeaserReport.mockImplementation(async (file: File) => {
      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('public-teaser-upload.csv')

      return {
        status: 'success',
        report_type: 'teaser',
        report_id: 'public-teaser-route-123',
        request_id: 'TEASER-route-123',
        artifact_status: 'backend_teaser_persisted',
        production_artifact_proven: false,
        receipt_hash: 'b'.repeat(64),
        trades_analyzed: 10,
        headline: {
          total_pnl: 420,
          discipline_tax: 120,
          win_rate: 60,
          worst_pattern: 'Revenge Trading',
          hook: '$120 discipline tax detected before activation.',
        },
        metrics: {
          winners: 6,
          losers: 4,
          avg_win: 85,
          avg_loss: -42.5,
          max_loss_streak: 3,
          ...BACKEND_PUBLIC_CONTEXT,
        },
        patterns_detected: [
          { pattern: 'Revenge Trading', count: 2, cost: 84 },
          { pattern: 'Overtrading', count: 1, cost: 0 },
        ],
        processing_time_seconds: 0.42,
      }
    })

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/Or paste a small trade sample/i), {
      target: { value: pasteBody },
    })
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/report/public-teaser-route-123')
    })

    expect(publicReportMocks.generatePublicTeaserReport).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('Backend teaser persisted').length).toBeGreaterThan(0)
    expect(screen.getByText('Not proven')).toBeInTheDocument()
    expect(screen.getByText('Backend teaser persisted: report public-teaser-route-123; request TEASER-route-123; 10 trades analyzed.')).toBeInTheDocument()
    expect(screen.getByText(`Backend teaser receipt hash: ${'b'.repeat(64)}.`)).toBeInTheDocument()
    expect(screen.getByText('Backend teaser hook: $120 discipline tax detected before activation.')).toBeInTheDocument()
    expect(screen.getByText('Backend teaser evidence')).toBeInTheDocument()
    expect(screen.getByText('Medallion returned aggregate proof for this public report.')).toBeInTheDocument()
    expect(screen.getByText('Trades analyzed')).toBeInTheDocument()
    expect(screen.getAllByText('Discipline tax estimate').length).toBeGreaterThan(0)
    expect(screen.getByText('120 P&L units')).toBeInTheDocument()
    expect(screen.getByText('Winner / loser split')).toBeInTheDocument()
    expect(screen.getByText('6 / 4')).toBeInTheDocument()
    expect(screen.getByText('Max loss streak')).toBeInTheDocument()
    expect(screen.getAllByText('Revenge Trading').length).toBeGreaterThan(0)
    expect(screen.getByText(/Count 2; cost 84 P&L units/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Backend teaser receipt persisted/i).length).toBeGreaterThan(0)

    const reportId = screen.getByTestId('location').textContent?.match(/\/report\/([^?]+)/)?.[1]
    expect(reportId).toBe('public-teaser-route-123')
    const stored = getPublicReportSession(reportId)
    expect(stored).toMatchObject({
      reportId: 'public-teaser-route-123',
      source: 'backend_teaser',
      evidenceLabel: 'Persisted backend teaser receipt',
      artifactStatus: 'backend_teaser_persisted',
      artifactStatusLabel: 'Backend teaser persisted',
      productionArtifactProven: false,
      backendTeaser: {
        reportId: 'public-teaser-route-123',
        requestId: 'TEASER-route-123',
        artifactStatus: 'backend_teaser_persisted',
        receiptHash: 'b'.repeat(64),
        tradesAnalyzed: 10,
        disciplineTax: 120,
        winners: 6,
        losers: 4,
        avgWin: 85,
        avgLoss: -42.5,
        maxLossStreak: 3,
        patternsDetected: [
          { pattern: 'Revenge Trading', count: 2, cost: 84 },
          { pattern: 'Overtrading', count: 1, cost: 0 },
        ],
      },
    })
    expect(hasCheckoutGradePublicReportSession(stored)).toBe(true)
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1') ?? '').not.toContain('XAUUSD')
  })

  test('eligible public paste requires a persisted backend teaser receipt shape', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 10 }, (_, index) => {
      const pnl = index % 2 === 0 ? 35 + index : -20 - index
      return `2026-06-${String(10 + index).padStart(2, '0')},XAUUSD,${index % 2 === 0 ? 'buy' : 'sell'},1,2300,2310,${pnl}`
    })
    const pasteBody = ['date,symbol,side,size,entry,exit,pnl', ...rows].join('\n')

    publicReportMocks.generatePublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-weak-123',
      request_id: 'TEASER-weak-123',
      artifact_status: 'backend_teaser_generated',
      production_artifact_proven: false,
      receipt_hash: 'c'.repeat(64),
      trades_analyzed: 10,
      headline: {
        discipline_tax: 120,
      },
    })

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/Or paste a small trade sample/i), {
      target: { value: pasteBody },
    })
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    await waitFor(() => {
      expect(screen.getByText(/Medallion did not return a persisted teaser receipt/i)).toBeInTheDocument()
    })

    expect(publicReportMocks.generatePublicTeaserReport).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay&story=guided')
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
  })

  test('eligible public paste blocks report creation when backend readiness is not proven', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 10 }, (_, index) => {
      const pnl = index % 2 === 0 ? 35 + index : -20 - index
      return `2026-06-${String(10 + index).padStart(2, '0')},XAUUSD,${index % 2 === 0 ? 'buy' : 'sell'},1,2300,2310,${pnl}`
    })
    const pasteBody = ['date,symbol,side,size,entry,exit,pnl', ...rows].join('\n')

    publicReportMocks.getPublicTeaserReportReadiness.mockResolvedValue({
      status: 'blocked',
      service: 'shibuya-public-teaser-report',
      accepts_csv_upload: true,
      persists_teaser_receipts: false,
      retrieves_teaser_receipts: false,
      report_type: 'teaser',
      artifact_status_required: 'backend_teaser_persisted',
      production_artifact_proven: false,
      raw_trade_rows_stored: false,
      live_private_artifact_proven: false,
      min_trade_rows: 10,
      max_file_size_mb: 5,
      retrieval_identity: ['report_id', 'request_id'],
      blockers: ['storage_missing_methods:store_public_teaser_report'],
    })

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Medallion public report boundary is blocked.')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Or paste a small trade sample/i), {
      target: { value: pasteBody },
    })
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/Medallion public report service is not ready to persist teaser receipts/i).length).toBeGreaterThan(1)
    })

    expect(publicReportMocks.getPublicTeaserReportReadiness).toHaveBeenCalled()
    expect(publicReportMocks.generatePublicTeaserReport).not.toHaveBeenCalled()
    expect(screen.getByText(/Blockers: storage_missing_methods:store_public_teaser_report/i)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay&story=guided')
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
  })

  test('eligible public paste blocks report creation when backend readiness disallows the story identity', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 10 }, (_, index) => {
      const pnl = index % 2 === 0 ? 38 + index : -22 - index
      return `2026-06-${String(10 + index).padStart(2, '0')},XAUUSD,${index % 2 === 0 ? 'buy' : 'sell'},1,2300,2310,${pnl}`
    })
    const pasteBody = ['date,symbol,side,size,entry,exit,pnl', ...rows].join('\n')

    publicReportMocks.getPublicTeaserReportReadiness.mockResolvedValue({
      status: 'ready',
      service: 'shibuya-public-teaser-report',
      accepts_csv_upload: true,
      persists_teaser_receipts: true,
      retrieves_teaser_receipts: true,
      report_type: 'teaser',
      artifact_status_required: 'backend_teaser_persisted',
      production_artifact_proven: false,
      raw_trade_rows_stored: false,
      live_private_artifact_proven: false,
      persists_story_identity: true,
      story_identity_fields: ['market', 'story_source', 'archetype_id', 'axis_id', 'pain_axes', 'story_scene_count', 'signal_markers'],
      story_identity_allowed_values: {
        ...STORY_IDENTITY_ALLOWED_VALUES,
        axis_ids: ['drawdown_pressure'],
        pain_axis_ids: ['drawdown_pressure'],
      },
      min_trade_rows: 10,
      max_file_size_mb: 5,
      retrieval_identity: ['report_id', 'request_id'],
      blockers: [],
    })

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Medallion public story identity contract is blocked.')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Or paste a small trade sample/i), {
      target: { value: pasteBody },
    })
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/does not allow public story axis_id "edge_decay"/i).length).toBeGreaterThan(1)
    })

    expect(publicReportMocks.generatePublicTeaserReport).not.toHaveBeenCalled()
    expect(screen.getByText(/Blockers: story_identity_context_not_allowed/i)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay&story=guided')
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
  })

  test('eligible public paste blocks report creation when backend teaser fails', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 10 }, (_, index) => {
      const pnl = index % 2 === 0 ? 40 + index : -18 - index
      return `2026-07-${String(10 + index).padStart(2, '0')},NQ,${index % 2 === 0 ? 'buy' : 'sell'},1,19000,19020,${pnl}`
    })
    const pasteBody = ['date,symbol,side,size,entry,exit,pnl', ...rows].join('\n')

    publicReportMocks.generatePublicTeaserReport.mockRejectedValue(new Error('teaser backend unavailable'))

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/Or paste a small trade sample/i), {
      target: { value: pasteBody },
    })
    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    await waitFor(() => {
      expect(screen.getByText(/Medallion teaser generation failed: teaser backend unavailable/i)).toBeInTheDocument()
    })

    expect(publicReportMocks.generatePublicTeaserReport).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay&story=guided')
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1') ?? '').not.toContain('NQ,buy')
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

    expect(screen.getByText('Upload route integrity')).toBeInTheDocument()
    expect(screen.getByText('Story-first context is attached.')).toBeInTheDocument()
    expect(screen.getByText('Guided StoryExperience handoff')).toBeInTheDocument()
    expect(screen.getByText('story-carried')).toBeInTheDocument()
    expect(screen.getByText(/This route is marked as a controlled launcher sample/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Generate Guided Sample Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    expect(screen.getByTestId('location')).toHaveTextContent('demo_packet=launcher_sample')
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Controlled launcher sample only/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Live/private artifact').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Not proven').length).toBeGreaterThan(0)
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

  test('demo launcher upload path carries controlled sample context into Reset Pro dashboard metadata', async () => {
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

  test('upload paste validation rejects prose and blocks thin trade tables', async () => {
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

    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=india&archetype=priya&axis=drawdown_pressure')
    expect(screen.getByText(/A real free report now requires at least 10 validated trade rows/i)).toBeInTheDocument()
    expect(screen.getByText(/Current validated rows: 1/i)).toBeInTheDocument()
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(publicReportMocks.generatePublicTeaserReport).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
  })

  test('upload file validation reads CSV structure before blocking a thin report packet', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    const fileInput = screen.getByLabelText(/Trade file/i)
    const csvFile = new File(
      ['date,symbol,side,size,entry,exit,pnl\n2026-06-18,EURUSD,buy,1,1.0800,1.0830,30'],
      'reset-pro-export.csv',
      { type: 'text/csv' },
    )

    await user.upload(fileInput, csvFile)

    await waitFor(() => {
      expect(screen.getByText(/Selected: reset-pro-export.csv. Selected file passed the local public structure check/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay')
    expect(screen.getByText(/A real free report now requires at least 10 validated trade rows/i)).toBeInTheDocument()
    expect(screen.getByText(/Current validated rows: 1/i)).toBeInTheDocument()
    expect(screen.queryByText('Public report packet')).not.toBeInTheDocument()
    expect(publicReportMocks.generatePublicTeaserReport).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1')).toBeNull()
  })

  test('upload file validation blocks unsupported spreadsheet files without a pasted table', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/upload?market=global&archetype=marco&axis=edge_decay']}>
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    const fileInput = screen.getByLabelText(/Trade file/i)
    const spreadsheetFile = new File(['not-readable-by-public-preview'], 'broker-export.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await user.upload(fileInput, spreadsheetFile)

    expect(screen.getByText(/Selected: broker-export.xlsx. This public preview cannot inspect spreadsheet\/binary files/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Generate Free Report/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload?market=global&archetype=marco&axis=edge_decay')
    expect(screen.getAllByText(/Export CSV\/TXT or paste a small trade table/i).length).toBeGreaterThan(0)
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

  test('free report recovers a persisted backend teaser receipt without local browser session state', async () => {
    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-share-123',
      request_id: 'TEASER-share-123',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'c'.repeat(64),
      trades_analyzed: 10,
      headline: {
        total_pnl: 310,
        discipline_tax: 95,
        win_rate: 60,
        worst_pattern: 'Revenge Trading',
        hook: '$95 discipline tax recovered from the persisted teaser.',
      },
      metrics: {
        winners: 6,
        losers: 4,
        avg_win: 72,
        avg_loss: -30,
        max_loss_streak: 2,
        ...BACKEND_PUBLIC_CONTEXT,
      },
      patterns_detected: [
        { pattern: 'Revenge Trading', count: 1, cost: 30 },
      ],
      processing_time_seconds: 0.31,
      created_at: '2026-06-20T22:00:00Z',
    })

    render(
      <MemoryRouter initialEntries={['/report/public-teaser-share-123?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-share-123')
      expect(screen.getAllByText('Persisted backend teaser receipt').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('Backend teaser persisted').length).toBeGreaterThan(0)
    expect(screen.getByText('Backend teaser recovered: report public-teaser-share-123; request TEASER-share-123; 10 trades analyzed.')).toBeInTheDocument()
    expect(screen.getByText(`Backend teaser receipt hash: ${'c'.repeat(64)}.`)).toBeInTheDocument()
    expect(screen.getByText('Backend teaser hook: $95 discipline tax recovered from the persisted teaser.')).toBeInTheDocument()
    expect(screen.getByText('Backend teaser evidence')).toBeInTheDocument()
    expect(screen.getByText('95 P&L units')).toBeInTheDocument()
    expect(screen.getByText('6 / 4')).toBeInTheDocument()
    expect(screen.getByText(/Count 1; cost 30 P&L units/i)).toBeInTheDocument()
    expect(screen.getByText(/Recovered from Medallion by report id\/request id/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Backend teaser receipt recovered from Medallion/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=public-teaser-share-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )

    expect(getPublicReportSession('public-teaser-share-123')).toMatchObject({
      reportId: 'public-teaser-share-123',
      source: 'backend_teaser',
      evidenceLabel: 'Persisted backend teaser receipt',
      artifactStatus: 'backend_teaser_persisted',
      productionArtifactProven: false,
      backendTeaser: {
        reportId: 'public-teaser-share-123',
        requestId: 'TEASER-share-123',
        receiptHash: 'c'.repeat(64),
        tradesAnalyzed: 10,
        winners: 6,
        losers: 4,
        patternsDetected: [
          { pattern: 'Revenge Trading', count: 1, cost: 30 },
        ],
      },
    })
    expect(window.localStorage.getItem('shibuya_public_report_sessions_v1') ?? '').not.toContain('XAUUSD')
  })

  test('free report canonicalizes request-id recovery before private handoff links', async () => {
    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-canonical-share',
      request_id: 'TEASER-canonical-share',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'e'.repeat(64),
      trades_analyzed: 11,
      headline: {
        discipline_tax: 120,
        worst_pattern: 'Edge Decay',
        hook: 'Canonical report identity recovered from the request id.',
      },
      metrics: BACKEND_PUBLIC_CONTEXT,
    })

    render(
      <MemoryRouter initialEntries={['/report/TEASER-canonical-share?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('TEASER-canonical-share')
      expect(screen.getAllByText('Persisted backend teaser receipt').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Backend teaser recovered: report public-teaser-canonical-share; request TEASER-canonical-share; 11 trades analyzed.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue Guided Storyline/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?source=guided_report&report=public-teaser-canonical-share&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
    expect(getPublicReportSession('public-teaser-canonical-share')).toMatchObject({
      reportId: 'public-teaser-canonical-share',
      backendTeaser: {
        requestId: 'TEASER-canonical-share',
      },
    })
    expect(getPublicReportSession('TEASER-canonical-share')).toMatchObject({
      reportId: 'public-teaser-canonical-share',
      backendTeaser: {
        reportId: 'public-teaser-canonical-share',
        requestId: 'TEASER-canonical-share',
      },
    })
  })

  test('free report refuses weak backend teaser recovery before storing report session', async () => {
    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-weak-123',
      request_id: 'TEASER-weak-123',
      artifact_status: 'backend_teaser_generated',
      production_artifact_proven: false,
      receipt_hash: 'f'.repeat(64),
      trades_analyzed: 10,
      headline: {
        hook: 'This should not become checkout-grade evidence.',
      },
    })

    render(
      <MemoryRouter initialEntries={['/report/public-teaser-weak-123?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/report/:id" element={<FreeReportPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-weak-123')
      expect(screen.getByText(/Backend teaser recovery failed: Medallion did not return a persisted teaser receipt/i)).toBeInTheDocument()
    })

    expect(screen.getByText('No local upload packet found')).toBeInTheDocument()
    expect(screen.getAllByText('URL context only').length).toBeGreaterThan(0)
    expect(screen.queryByText('Persisted backend teaser receipt')).not.toBeInTheDocument()
    expect(screen.queryByText('This should not become checkout-grade evidence.')).not.toBeInTheDocument()
    expect(getPublicReportSession('public-teaser-weak-123')).toBeNull()
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
    expect(screen.getByText('Locked insight decision-room sequence')).toBeInTheDocument()
    expect(screen.getByText('Treat this page like the door into Reset Pro, not another report card.')).toBeInTheDocument()
    expect(screen.getByText('0:00 / Question lock')).toBeInTheDocument()
    expect(screen.getByText('0:35 / Proof wall')).toBeInTheDocument()
    expect(screen.getByText('1:15 / Demo route')).toBeInTheDocument()
    expect(screen.getByText('2:20 / Append close')).toBeInTheDocument()
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
    expect(screen.getByText('Presenter demo continuation')).toBeInTheDocument()
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
    expect(screen.getAllByText('Sample cost-state card and presenter talk track.').length).toBeGreaterThan(1)
    expect(screen.getByText('Evidence checkpoint')).toBeInTheDocument()
    expect(screen.getAllByText('Normalized trade history with enough rows to estimate repeat behavioral cost.').length).toBeGreaterThan(1)
    expect(screen.getByText('Close condition')).toBeInTheDocument()
    expect(screen.getByText(/End on append proof\. The question stays unresolved/i)).toBeInTheDocument()
    expect(screen.getByText(/Decision-room rule: the private demo can show workflow relevance/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Continue To Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=sample-free-report&archetype=marco&axis=edge_decay&section=highest-cost-state&market=global',
    )
    expect(screen.getByText('Paid activation boundary')).toBeInTheDocument()
    expect(screen.getByText(/Paid activation is blocked on this page until the locked insight is backed by a persisted Medallion teaser receipt/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Unlock with Reset Pro/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlock with Reset Pro requires backend teaser receipt/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Start Psych Audit requires backend teaser receipt/i })).toBeDisabled()
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
    expect(screen.getByText('Paid activation boundary')).toBeInTheDocument()
    expect(screen.getByText(/Paid activation is blocked on this page until the locked insight is backed by a persisted Medallion teaser receipt/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Unlock with Reset Pro/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unlock with Reset Pro requires backend teaser receipt/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Start Psych Audit requires backend teaser receipt/i })).toBeDisabled()
    expect(screen.getByRole('link', { name: /Open Private Demo Gate/i })).toHaveAttribute(
      'href',
      '/private-demo?source=locked_insight&report=shareable-report&archetype=marco&axis=edge_decay&section=highest-cost-state&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
    )
  })

  test('locked insight recovers persisted backend teaser evidence before private handoff', async () => {
    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-lock-123',
      request_id: 'TEASER-lock-123',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'd'.repeat(64),
      trades_analyzed: 12,
      headline: {
        discipline_tax: 125,
        worst_pattern: 'Tilt Spirals',
        hook: '$125 discipline tax recovered before private handoff.',
      },
      metrics: BACKEND_PUBLIC_CONTEXT,
      processing_time_seconds: 0.28,
    })

    render(
      <MemoryRouter initialEntries={['/insight/highest-cost-state?market=global&source=locked_report&report=public-teaser-lock-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent']}>
        <Routes>
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-lock-123')
      expect(screen.getAllByText('Persisted backend teaser receipt').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText(/Backend teaser receipt recovered from Medallion/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/persisted backend teaser receipt and secret-free handoff metadata/i)).toBeInTheDocument()
    expect(screen.getByText('Evidence status: Persisted backend teaser receipt.')).toBeInTheDocument()
    expect(screen.getByText(/source=locked_insight; report=public-teaser-lock-123; section=highest-cost-state/i)).toBeInTheDocument()
    expect(screen.getByText(/Paid activation can carry this persisted backend teaser receipt into checkout/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=public-teaser-lock-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Start Psych Audit/i })).toHaveAttribute(
      'href',
      '/checkout/psych-audit-live?source=locked_insight&section=highest-cost-state&report=public-teaser-lock-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
    expect(getPublicReportSession('public-teaser-lock-123')).toMatchObject({
      source: 'backend_teaser',
      artifactStatus: 'backend_teaser_persisted',
      backendTeaser: {
        requestId: 'TEASER-lock-123',
        tradesAnalyzed: 12,
        worstPattern: 'Tilt Spirals',
      },
    })
  })

  test('locked insight uses recovered backend teaser identity instead of tampered URL identity', async () => {
    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-lock-identity-123',
      request_id: 'TEASER-lock-identity-123',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'f'.repeat(64),
      trades_analyzed: 15,
      headline: {
        discipline_tax: 145,
        worst_pattern: 'Edge Decay',
        hook: '$145 discipline tax recovered before private handoff.',
      },
      metrics: BACKEND_PUBLIC_CONTEXT,
      processing_time_seconds: 0.31,
    })

    render(
      <MemoryRouter initialEntries={['/insight/highest-cost-state?market=global&source=locked_report&report=public-teaser-lock-identity-123&archetype=priya&axis=drawdown_pressure&story=guided&scene_count=2&pain_axes=drawdown_pressure&signals=mirror_selected']}>
        <Routes>
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-lock-identity-123')
      expect(screen.getAllByText('Persisted backend teaser receipt').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('archetype=marco; axis=edge_decay')).toBeInTheDocument()
    expect(screen.queryByText('archetype=priya; axis=drawdown_pressure')).not.toBeInTheDocument()
    expect(screen.getByText('story=guided; scene_count=6; pain_axes=edge_decay,revenge_reentry; signals=mirror_selected,upload_intent')).toBeInTheDocument()
    expect(screen.getByText(/Paid activation can carry this persisted backend teaser receipt into checkout/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=public-teaser-lock-identity-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Start Psych Audit/i })).toHaveAttribute(
      'href',
      '/checkout/psych-audit-live?source=locked_insight&section=highest-cost-state&report=public-teaser-lock-identity-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
  })

  test('locked insight upgrades stale local report session with recovered backend teaser evidence', async () => {
    persistPublicReportSession(
      buildPublicReportSession({
        reportId: 'public-teaser-shadow-123',
        market: 'global',
        archetypeId: 'marco',
        axisId: 'edge_decay',
        source: 'sample',
        storySource: 'guided',
        selectedPainAxisIds: ['edge_decay'],
        visitedSceneCount: 6,
        signalMarkerIds: ['mirror_selected'],
      }),
    )
    expect(getPublicReportSession('public-teaser-shadow-123')).toMatchObject({
      source: 'sample',
      artifactStatus: 'sample_demo_only',
    })

    publicReportMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-shadow-123',
      request_id: 'TEASER-shadow-123',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'a'.repeat(64),
      trades_analyzed: 14,
      headline: {
        discipline_tax: 140,
        worst_pattern: 'Edge Decay',
        hook: '$140 discipline tax recovered over stale local state.',
      },
      metrics: BACKEND_PUBLIC_CONTEXT,
      processing_time_seconds: 0.33,
    })

    render(
      <MemoryRouter initialEntries={['/insight/highest-cost-state?market=global&source=locked_report&report=public-teaser-shadow-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected']}>
        <Routes>
          <Route path="/insight/:section" element={<LockedInsightPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(publicReportMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-shadow-123')
      expect(screen.getAllByText('Persisted backend teaser receipt').length).toBeGreaterThan(0)
    })

    const upgradedSession = getPublicReportSession('public-teaser-shadow-123')
    expect(upgradedSession).toMatchObject({
      source: 'backend_teaser',
      artifactStatus: 'backend_teaser_persisted',
      backendTeaser: {
        requestId: 'TEASER-shadow-123',
        tradesAnalyzed: 14,
      },
    })
    expect(hasCheckoutGradePublicReportSession(upgradedSession)).toBe(true)
    expect(screen.getByText(/Paid activation can carry this persisted backend teaser receipt into checkout/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Unlock with Reset Pro/i })).toHaveAttribute(
      'href',
      '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=public-teaser-shadow-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
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
    expect(screen.getByText('Presenter demo continuation')).toBeInTheDocument()
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
    expect(screen.getByText('Private demo gate sequence')).toBeInTheDocument()
    expect(screen.getByText('Unlock Reset Pro like an evidence handoff, not a password wall.')).toBeInTheDocument()
    expect(screen.getAllByText('Highest-cost state').length).toBeGreaterThan(0)
    expect(screen.getByText('Workspace handoff packet')).toBeInTheDocument()
    expect(screen.getByText('Private gate engagement receipt')).toBeInTheDocument()
    expect(screen.getByText('Intent survived into the presenter gate. It still is not evidence.')).toBeInTheDocument()
    expect(screen.getByText('1 gate attempt')).toBeInTheDocument()
    expect(screen.getByText(/route continuity only, never trader proof/i)).toBeInTheDocument()

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
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementCurrentSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
    })
  })
})
