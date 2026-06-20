import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { getSampleWorkspaceOverview } from '../../../lib/sampleWorkspace'

const apiMocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  getTradingReport: vi.fn(),
  getTradingReportComparison: vi.fn(),
  getTradingReports: vi.fn(),
  getTraderProfileContext: vi.fn(),
}))

const runtimeMocks = vi.hoisted(() => ({
  getStoredSessionMeta: vi.fn(),
  hasPremiumAccess: vi.fn(),
  isSampleMode: vi.fn(),
}))

vi.mock('../../../components/dashboard/MissionBriefCard', () => ({
  MissionBriefCard: () => <div>Mission brief</div>,
}))

vi.mock('../../../lib/api/dashboard', () => ({
  getDashboardOverview: apiMocks.getDashboardOverview,
  getTradingReport: apiMocks.getTradingReport,
  getTradingReportComparison: apiMocks.getTradingReportComparison,
  getTradingReports: apiMocks.getTradingReports,
}))

vi.mock('../../../lib/api/trader', () => ({
  getTraderProfileContext: apiMocks.getTraderProfileContext,
}))

vi.mock('../../../lib/runtime', () => ({
  getStoredSessionMeta: runtimeMocks.getStoredSessionMeta,
  hasPremiumAccess: runtimeMocks.hasPremiumAccess,
  isSampleMode: runtimeMocks.isSampleMode,
}))

let ReportsPage: typeof import('../ReportsPage').ReportsPage

describe('ReportsPage', () => {
  beforeAll(async () => {
    vi.resetModules()
    ReportsPage = (await import('../ReportsPage')).ReportsPage
  })

  beforeEach(() => {
    runtimeMocks.getStoredSessionMeta.mockReturnValue({
      customerId: 'cust_1',
      market: 'global',
      tier: 'reset_pro',
      offerKind: 'reset_pro_live',
    })
    runtimeMocks.hasPremiumAccess.mockReturnValue(true)
    runtimeMocks.isSampleMode.mockReturnValue(false)
    apiMocks.getDashboardOverview.mockResolvedValue({
      ...getSampleWorkspaceOverview('reset_pro'),
      customer_id: 'cust_1',
      access_tier: 'reset_pro',
      offer_kind: 'reset_pro_live',
      case_status: 'baseline_ready',
    })
    apiMocks.getTraderProfileContext.mockResolvedValue(null)
    apiMocks.getTradingReportComparison.mockResolvedValue(null)
    apiMocks.getTradingReports.mockResolvedValue({
      status: 'success',
      count: 1,
      reports: [
        {
          id: 'report_live_123',
          customer_id: 'cust_1',
          name: 'Live Baseline Brief',
          discipline_score: 72,
          emotional_cost: 420,
          primary_pattern: 'Tilt after first red trade',
          created_at: '2026-06-20T09:15:00Z',
          updated_at: '2026-06-20T09:16:00Z',
        },
      ],
    })
    apiMocks.getTradingReport.mockResolvedValue({
      status: 'success',
      report: {
        id: 'report_live_123',
        customer_id: 'cust_1',
        name: 'Live Baseline Brief',
        discipline_score: 72,
        emotional_cost: 420,
        primary_pattern: 'Tilt after first red trade',
        created_at: '2026-06-20T09:15:00Z',
        updated_at: '2026-06-20T09:16:00Z',
      },
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  test('downloads an archived report through the live report detail endpoint', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Live Baseline Brief')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Download archived artifact/i }))

    await waitFor(() => {
      expect(apiMocks.getTradingReport).toHaveBeenCalledWith('report_live_123')
    })
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
  })
})
