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
    expect(screen.getByText(/not proof that the sample account belongs to the visitor/i)).toBeInTheDocument()
    expect(screen.getAllByText(/demo data only/i).length).toBeGreaterThan(0)
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
    expect(screen.queryByText('PRIVATE RESET PRO DEMO')).not.toBeInTheDocument()
  })
})
