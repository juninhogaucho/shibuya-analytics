import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { getSampleWorkspaceOverview } from '../../../lib/sampleWorkspace'

const apiMocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  getTraderProfileContext: vi.fn(),
}))

const runtimeMocks = vi.hoisted(() => ({
  getSessionDaysRemaining: vi.fn(),
  getStoredSessionMeta: vi.fn(),
  hasPremiumAccess: vi.fn(),
  isOneTimeOffer: vi.fn(),
  isReadOnlySession: vi.fn(),
  isSampleMode: vi.fn(),
}))

vi.mock('../../../components/dashboard/JourneyProgressCard', () => ({
  JourneyProgressCard: () => <div>Journey progress</div>,
}))

vi.mock('../../../lib/api/dashboard', () => ({
  getDashboardOverview: apiMocks.getDashboardOverview,
}))

vi.mock('../../../lib/api/trader', () => ({
  getTraderProfileContext: apiMocks.getTraderProfileContext,
}))

vi.mock('../../../lib/runtime', () => ({
  getSessionDaysRemaining: runtimeMocks.getSessionDaysRemaining,
  getStoredSessionMeta: runtimeMocks.getStoredSessionMeta,
  hasPremiumAccess: runtimeMocks.hasPremiumAccess,
  isOneTimeOffer: runtimeMocks.isOneTimeOffer,
  isReadOnlySession: runtimeMocks.isReadOnlySession,
  isSampleMode: runtimeMocks.isSampleMode,
}))

let WorkspacePage: typeof import('../WorkspacePage').WorkspacePage

describe('WorkspacePage', () => {
  beforeAll(async () => {
    vi.resetModules()
    WorkspacePage = (await import('../WorkspacePage')).WorkspacePage
  })

  beforeEach(() => {
    runtimeMocks.getStoredSessionMeta.mockReturnValue({
      tier: 'reset_pro',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'baseline_ready',
    })
    runtimeMocks.isSampleMode.mockReturnValue(false)
    runtimeMocks.hasPremiumAccess.mockReturnValue(true)
    runtimeMocks.isOneTimeOffer.mockReturnValue(false)
    runtimeMocks.isReadOnlySession.mockReturnValue(false)
    runtimeMocks.getSessionDaysRemaining.mockReturnValue(null)
    apiMocks.getTraderProfileContext.mockResolvedValue({
      capital_band: '50k_to_250k_inr',
      monthly_income_band: '25k_to_75k_inr',
      trader_focus: 'prop_eval',
      broker_platform: 'MT5',
      primary_instruments: ['nifty_options'],
      trader_mode: 'funded_account_operator',
      completed: true,
    })
    apiMocks.getDashboardOverview.mockResolvedValue({
      ...getSampleWorkspaceOverview('reset_pro'),
      customer_id: 'cust_1',
      access_tier: 'reset_pro',
      offer_kind: 'reset_pro_live',
      case_status: 'baseline_ready',
      upload_count: 1,
      latest_upload_receipt: {
        completed_at: '2026-06-20T09:15:00Z',
        upload_transport: 'api',
        trades_uploaded: 24,
        report_snapshot_id: 'snap_upload_024',
        report_id: 'report_upload_024',
        artifact_status: 'generated',
        append_count: 1,
        request_id: 'req_live_123',
      },
    })
  })

  test('shows persisted upload proof receipt from dashboard overview', async () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Upload proof receipt')).toBeInTheDocument()
    expect(screen.getByText(/Backend persisted this receipt/i)).toBeInTheDocument()
    expect(screen.getByText('snap_upload_024')).toBeInTheDocument()
    expect(screen.getByText('report_upload_024')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('generated')).toBeInTheDocument()
    expect(screen.getByText('req_live_123')).toBeInTheDocument()
  })
})
