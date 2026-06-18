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
    expect(screen.getByText(/not proof that the sample account belongs to the visitor/i)).toBeInTheDocument()
    expect(screen.getAllByText(/demo data only/i).length).toBeGreaterThan(0)
  })
})
