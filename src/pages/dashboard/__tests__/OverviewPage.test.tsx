import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getSampleWorkspaceOverview } from '../../../lib/sampleWorkspace'
import {
  SHIBUYA_API_KEY_STORAGE_KEY,
  SHIBUYA_SAMPLE_API_KEY,
  SHIBUYA_SESSION_META_STORAGE_KEY,
} from '../../../lib/runtime'
import { DashboardOverviewPage } from '../OverviewPage'

const apiMocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  getTradingReportComparison: vi.fn(),
  getTraderProfileContext: vi.fn(),
  logTraderLifecycleEvent: vi.fn(),
}))

vi.mock('../../../components/dashboard/DailyCommandDeck', () => ({
  DailyCommandDeck: () => <div>Daily command deck</div>,
}))

vi.mock('../../../components/dashboard/JourneyProgressCard', () => ({
  JourneyProgressCard: () => <div>Journey progress</div>,
}))

vi.mock('../../../components/dashboard/CampaignProofCard', () => ({
  CampaignProofCard: () => <div>Campaign proof</div>,
}))

vi.mock('../../../components/dashboard/FieldKitCard', () => ({
  FieldKitCard: () => <div>Field kit</div>,
}))

vi.mock('../../../components/dashboard/MissionBriefCard', () => ({
  MissionBriefCard: () => <div>Mission brief</div>,
}))

vi.mock('../../../components/charts/ChartCard', () => ({
  ChartCard: ({ title }: { title?: string }) => <div>{title ?? 'Chart card'}</div>,
}))

vi.mock('../../../components/charts/EquityCurve', () => ({
  EquityCurve: () => <div>Equity curve</div>,
  generateEquityData: () => [],
}))

vi.mock('../../../components/charts/DisciplineTaxTrend', () => ({
  DisciplineTaxTrend: () => <div>Discipline tax trend</div>,
  generateTaxTrendData: () => [],
}))

vi.mock('../../../lib/api/dashboard', () => ({
  getDashboardOverview: apiMocks.getDashboardOverview,
  getTradingReportComparison: apiMocks.getTradingReportComparison,
}))

vi.mock('../../../lib/api/trader', () => ({
  getTraderProfileContext: apiMocks.getTraderProfileContext,
  logTraderLifecycleEvent: apiMocks.logTraderLifecycleEvent,
}))

describe('DashboardOverviewPage', () => {
  beforeEach(() => {
    apiMocks.getDashboardOverview.mockResolvedValue(getSampleWorkspaceOverview('reset_pro'))
    apiMocks.getTradingReportComparison.mockResolvedValue(null)
    apiMocks.getTraderProfileContext.mockResolvedValue(null)
    apiMocks.logTraderLifecycleEvent.mockResolvedValue(undefined)
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
    window.localStorage.setItem(
      SHIBUYA_SESSION_META_STORAGE_KEY,
      JSON.stringify({
        tier: 'sample',
        market: 'india',
        offerKind: 'sample',
        caseStatus: 'sample_preview',
        samplePreview: 'reset_pro',
        demoSource: 'free_report',
        demoReportId: 'sample-behavioral-leak-report',
        demoArchetypeId: 'priya',
        demoAxisId: 'drawdown_pressure',
        demoReportSource: 'sample',
        demoEvidenceLabel: 'Sample history packet',
        demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
        demoStorySource: 'guided',
        demoSelectedPainAxisIds: ['drawdown_pressure'],
        demoVisitedSceneCount: 4,
        demoLockedSectionId: 'highest-cost-state',
        demoLockedSectionTitle: 'Highest-cost state',
        demoBridgeHeadline: 'Reset Pro should decide whether pressure changes the account before the breach.',
        demoBridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
        demoBridgeWhyNow: 'Watchlist means the next product step should test pressure behavior, not add another generic chart.',
        demoBridgeLiveProof: [
          'First meaningful upload normalized by the live backend.',
          'Whether size, exit timing, or re-entry changes when rulebook pressure rises.',
        ],
        demoBridgePreviewShows: [
          'Sample mandate and pressure map.',
          'How a prop-style drawdown warning becomes a pre-session operating constraint.',
        ],
      }),
    )
  })

  test('renders the private Reset Pro demo with carried public report origin', async () => {
    render(
      <MemoryRouter>
        <DashboardOverviewPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('PRIVATE RESET PRO DEMO')).toBeInTheDocument()
    expect(screen.getByText('3-MINUTE PATH')).toBeInTheDocument()
    expect(screen.getByText('DEMO DATA ONLY')).toBeInTheDocument()
    expect(screen.getByText('Founder thesis')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO UNLOCK RECEIPT')).toBeInTheDocument()
    expect(screen.getByText('UNLOCK RECEIPT')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro received the public question; the sample workspace can only show the operating loop.')).toBeInTheDocument()
    expect(screen.getByText('Run Mission HQ first, inspect one intervention surface, then close on append proof.')).toBeInTheDocument()
    expect(screen.getByText('Report carried: sample-behavioral-leak-report')).toBeInTheDocument()
    expect(screen.getByText('Locked question: Highest-cost state')).toBeInTheDocument()
    expect(screen.getByText('Evidence packet: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/This receipt proves the founder gate carried context into the sample workspace/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO OPERATOR STRIP')).toBeInTheDocument()
    expect(screen.getByText('One guided path after unlock. No dashboard wandering.')).toBeInTheDocument()
    expect(screen.getByText(/The deeper cards below are supporting evidence/i)).toBeInTheDocument()
    expect(screen.getByText('FOUNDER SHOW SEQUENCE')).toBeInTheDocument()
    expect(screen.getByText('DEMO READINESS CHECKLIST')).toBeInTheDocument()
    expect(screen.getByText('Carried in from the public report')).toBeInTheDocument()
    expect(screen.getByText('Origin report: sample-behavioral-leak-report')).toBeInTheDocument()
    expect(screen.getByText('Public archetype: Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Predicted axis: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Public packet source: sample')).toBeInTheDocument()
    expect(screen.getByText('Handoff evidence: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Validation note: Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText('Story handoff: guided')).toBeInTheDocument()
    expect(screen.getByText('Story scenes before upload: 4')).toBeInTheDocument()
    expect(screen.getByText('Public pain axes: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Requested private insight: Highest-cost state')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO BRIDGE RECEIVED')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro should decide whether pressure changes the account before the breach.')).toBeInTheDocument()
    expect(screen.getAllByText('Does the trader become a different operator near the drawdown line?').length).toBeGreaterThan(0)
    expect(screen.getByText('Live Reset Pro must prove')).toBeInTheDocument()
    expect(screen.getByText('Whether size, exit timing, or re-entry changes when rulebook pressure rises.')).toBeInTheDocument()
    expect(screen.getAllByText(/not proof that the sample account belongs to the visitor/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/demo data only/i).length).toBeGreaterThan(0)
    expect(screen.getByText('MARKET: INDIA')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Append Proof' })).toHaveAttribute('href', '/dashboard/upload?market=india')
    expect(screen.getAllByRole('link', { name: /Start Mission HQ/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Inspect Slump protocol/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Close On Append Proof/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Inspect Upload Flow/i })).toHaveAttribute('href', '/dashboard/upload?market=india')
    expect(screen.getByText(/Live Reset Pro requires payment, activation, first meaningful upload/i)).toBeInTheDocument()
  })

  test('renders live activation origin separately from sample demo metadata', async () => {
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, 'live-token-123')
    window.localStorage.setItem(
      SHIBUYA_SESSION_META_STORAGE_KEY,
      JSON.stringify({
        tier: 'reset_pro',
        market: 'global',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
        activationSource: 'locked_insight',
        activationReportId: 'sample-free-report',
        activationArchetypeId: 'marco',
        activationAxisId: 'edge_decay',
        activationStorySource: 'guided',
        activationSelectedPainAxisIds: ['edge_decay'],
        activationVisitedSceneCount: 6,
        activationLockedSectionId: 'highest-cost-state',
        activationLockedSectionTitle: 'Highest-cost state',
        activationBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
        activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
        activationBridgeWhyNow: 'Watchlist means the private layer has to compare repeated windows before calling a setup decayed.',
        activationBridgeLiveProof: [
          'First meaningful upload normalized by the live backend.',
          'Enough repeated setup history to mark stable, watchlist, or decayed behavior.',
        ],
      }),
    )

    render(
      <MemoryRouter>
        <DashboardOverviewPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('LIVE ACTIVATION ORIGIN')).toBeInTheDocument()
    expect(screen.getByText('Activated from locked private insight')).toBeInTheDocument()
    expect(screen.getByText(/routing context for what the trader tried to unlock/i)).toBeInTheDocument()
    expect(screen.getByText('Highest-cost state')).toBeInTheDocument()
    expect(screen.getByText('sample-free-report')).toBeInTheDocument()
    expect(screen.getByText(/Marco: Profitable refiner - Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText('Story handoff')).toBeInTheDocument()
    expect(screen.getByText(/guided; scenes 6; axes Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO LIVE QUESTION')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro should separate real edge decay from normal variance.')).toBeInTheDocument()
    expect(screen.getByText('Is the trader defending a setup that no longer deserves the same risk?')).toBeInTheDocument()
    expect(screen.getByText(/Payment and activation preserved the question/i)).toBeInTheDocument()
    expect(screen.getByText('Enough repeated setup history to mark stable, watchlist, or decayed behavior.')).toBeInTheDocument()
    expect(screen.queryByText('PRIVATE RESET PRO DEMO')).not.toBeInTheDocument()
  })

  test('preserves live activation bridge context when backend overview is unavailable', async () => {
    apiMocks.getDashboardOverview.mockRejectedValue(new Error('Dashboard overview requires a configured Shibuya backend.'))
    window.localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, 'live-token-123')
    window.localStorage.setItem(
      SHIBUYA_SESSION_META_STORAGE_KEY,
      JSON.stringify({
        tier: 'reset_pro',
        market: 'global',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
        activationSource: 'locked_insight',
        activationReportId: 'sample-free-report',
        activationArchetypeId: 'marco',
        activationAxisId: 'edge_decay',
        activationStorySource: 'guided',
        activationSelectedPainAxisIds: ['edge_decay'],
        activationVisitedSceneCount: 6,
        activationLockedSectionId: 'highest-cost-state',
        activationLockedSectionTitle: 'Highest-cost state',
        activationBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
        activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
        activationBridgeWhyNow: 'Watchlist means the private layer has to compare repeated windows before calling a setup decayed.',
        activationBridgeLiveProof: [
          'First meaningful upload normalized by the live backend.',
          'Enough repeated setup history to mark stable, watchlist, or decayed behavior.',
        ],
      }),
    )

    render(
      <MemoryRouter>
        <DashboardOverviewPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('LIVE ACTIVATION ORIGIN')).toBeInTheDocument()
    expect(screen.getByText('Activated from locked private insight')).toBeInTheDocument()
    expect(screen.getByText(/The backend is not loaded, so no account analytics are shown/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO LIVE QUESTION')).toBeInTheDocument()
    expect(screen.getByText('Is the trader defending a setup that no longer deserves the same risk?')).toBeInTheDocument()
    expect(screen.getByText(/Payment and activation preserved the question/i)).toBeInTheDocument()
    expect(screen.getByText('Enough repeated setup history to mark stable, watchlist, or decayed behavior.')).toBeInTheDocument()
    expect(screen.getByText('Unable to load dashboard')).toBeInTheDocument()
    expect(screen.getByText('Dashboard overview requires a configured Shibuya backend.')).toBeInTheDocument()
  })
})
