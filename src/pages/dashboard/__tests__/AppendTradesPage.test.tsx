import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

const parseTradePasteMock = vi.fn()
const submitParsedTradesMock = vi.fn()
const uploadTradesCSVMock = vi.fn()
const getTradePasteMemoryMock = vi.fn()
const getTradingReportComparisonMock = vi.fn()
const logTraderLifecycleEventMock = vi.fn()
const isSampleModeMock = vi.fn()
const getShibuyaRuntimeContractMock = vi.fn()
const getStoredSessionMetaMock = vi.fn()
const isReadOnlySessionMock = vi.fn()
const updateSessionMetaMock = vi.fn()
const getTraderProfileContextMock = vi.fn()
let AppendTradesPage: typeof import('../AppendTradesPage').AppendTradesPage

vi.mock('../../../lib/api/trader', () => ({
  getTraderProfileContext: (...args: unknown[]) => getTraderProfileContextMock(...args),
  logTraderLifecycleEvent: (...args: unknown[]) => logTraderLifecycleEventMock(...args),
}))

vi.mock('../../../lib/api/dashboard', () => ({
  parseTradePaste: (...args: unknown[]) => parseTradePasteMock(...args),
  submitParsedTrades: (...args: unknown[]) => submitParsedTradesMock(...args),
  uploadTradesCSV: (...args: unknown[]) => uploadTradesCSVMock(...args),
  getTradePasteMemory: (...args: unknown[]) => getTradePasteMemoryMock(...args),
  getTradingReportComparison: (...args: unknown[]) => getTradingReportComparisonMock(...args),
}))

vi.mock('../../../lib/runtime', () => ({
  isSampleMode: () => isSampleModeMock(),
  getShibuyaRuntimeContract: () => getShibuyaRuntimeContractMock(),
  getStoredSessionMeta: () => getStoredSessionMetaMock(),
  isReadOnlySession: (...args: unknown[]) => isReadOnlySessionMock(...args),
  updateSessionMeta: (...args: unknown[]) => updateSessionMetaMock(...args),
}))

describe('AppendTradesPage', () => {
  beforeAll(async () => {
    vi.resetModules()
    AppendTradesPage = (await import('../AppendTradesPage')).AppendTradesPage
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <AppendTradesPage />
      </MemoryRouter>,
    )
  }

  beforeEach(() => {
    parseTradePasteMock.mockResolvedValue({
      rowsParsed: 2,
      symbols: ['NIFTY24JAN22500CE', 'BANKNIFTY24JAN48200PE'],
      trades: [{ symbol: 'NIFTY24JAN22500CE' }, { symbol: 'BANKNIFTY24JAN48200PE' }],
    })
    submitParsedTradesMock.mockResolvedValue({ status: 'sample', trades_uploaded: 2 })
    uploadTradesCSVMock.mockResolvedValue({ status: 'sample', trades_uploaded: 0, report: {} })
    getTradingReportComparisonMock.mockResolvedValue({
      has_comparison: false,
      baseline: null,
      latest: null,
      delta_summary: null,
      last_report_snapshot_id: null,
      append_proof: {
        status: 'awaiting_second_upload',
        upload_count: 1,
        proof_boundary: 'Append proof is not ready until this account has at least two durable upload snapshots.',
      },
    })
    logTraderLifecycleEventMock.mockResolvedValue(undefined)
    getTraderProfileContextMock.mockResolvedValue({
      capital_band: '50k_to_250k_inr',
      monthly_income_band: '25k_to_75k_inr',
      trader_focus: 'retail_fo',
      broker_platform: 'Sample broker',
      primary_instruments: ['nifty_options', 'banknifty_options'],
      trader_mode: 'retail_fn0_struggler',
      completed: true,
    })
    getStoredSessionMetaMock.mockReturnValue({
      tier: 'sample',
      market: 'india',
      offerKind: 'sample',
      caseStatus: 'sample_preview',
      samplePreview: 'reset_pro',
      demoLockedSectionTitle: 'Edge decay map',
      demoBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
      demoUnlockReceiptId: 'reset-pro-demo:india:locked-insight:free-report-123:marco:edge-decay:edge-decay-map',
      demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
      demoEngagementReportViewCount: 2,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoEngagementBoundary: 'Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.',
      demoEntryMode: 'append_proof_shortcut',
    })
    isReadOnlySessionMock.mockReturnValue(false)
    updateSessionMetaMock.mockReset()
    getShibuyaRuntimeContractMock.mockReturnValue({
      mode: 'sample',
      label: 'Sample workspace',
      canUseSampleData: true,
      canPersistTrades: false,
      persistence: 'local_only',
      requiresBackend: false,
      proofBoundary: 'Sample mode may demonstrate workflow only.',
    })
    getTradePasteMemoryMock.mockResolvedValue({
      has_previous: true,
      message: 'Comparing upload #3 to #2',
      deltas: [
        {
          metric: 'Win Rate',
          previous: '50.0%',
          current: '55.0%',
          delta: '+5.0pp',
          direction: 'up',
        },
      ],
    })
    getTradingReportComparisonMock.mockResolvedValue({
      has_comparison: true,
      baseline: {
        snapshot_id: 'snap_upload_002',
        discipline_tax: 420,
        bql_score: 0.62,
        bql_state: 'under_pressure',
        pnl_net: 500,
        pnl_gross: 920,
        total_trades: 10,
        winning_trades: 5,
        ruin_probability: 0.08,
        behavior_share: 0.45,
        breach_risk_score: 55,
      },
      latest: {
        snapshot_id: 'snap_upload_003',
        discipline_tax: 260,
        bql_score: 0.48,
        bql_state: 'in_control',
        pnl_net: 720,
        pnl_gross: 980,
        total_trades: 12,
        winning_trades: 7,
        ruin_probability: 0.04,
        behavior_share: 0.27,
        breach_risk_score: 35,
      },
      delta_summary: {
        discipline_tax_change: -160,
        revenge_change: -90,
        overtrading_change: -40,
        size_change: -30,
        edge_vs_behavior_shift: 'behavior improving',
        breach_risk_shift: 'risk improving',
        bql_change: -0.14,
      },
      last_report_snapshot_id: 'snap_upload_003',
      append_proof: {
        status: 'comparison_ready',
        upload_count: 3,
        baseline_snapshot_id: 'snap_upload_001',
        latest_snapshot_id: 'snap_upload_003',
        baseline_report_id: 'report_upload_001',
        latest_report_id: 'report_upload_003',
        latest_append_count: 3,
        latest_request_id: 'req_live_123',
        latest_artifact_status: 'generated',
        latest_trades_uploaded: 2,
        activation_teaser_request_id: 'TEASER-route-123',
        activation_teaser_trades_analyzed: 10,
        activation_teaser_worst_pattern: 'Revenge Trading',
        activation_teaser_verified: 'true',
        activation_teaser_verification_status: 'verified',
        activation_teaser_receipt_hash: 'e'.repeat(64),
        activation_teaser_verified_at: '2026-06-20T00:03:00Z',
        activation_source: 'locked_insight',
        activation_report_id: 'public-teaser-append',
        activation_locked_section_id: 'edge-decay-map',
        proof_boundary: 'Append proof is backed by at least two durable upload snapshots and the latest upload receipt.',
      },
    })
  })

  test('teaches the sample workspace without implying persistence', async () => {
    isSampleModeMock.mockReturnValue(true)
    const user = userEvent.setup()

    renderPage()

    expect(screen.getByText('RESET PRO PROOF EXIT')).toBeInTheDocument()
    expect(screen.getByText('LIVE PROOF READINESS')).toBeInTheDocument()
    expect(screen.getByText('Before this upload can become live proof.')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload')).toBeInTheDocument()
    expect(screen.getByText('Append history')).toBeInTheDocument()
    expect(screen.getByText('Public-to-private journey')).toBeInTheDocument()
    expect(screen.getByText('Append proof close')).toBeInTheDocument()
    expect(screen.getByText('Demo ends where live evidence must begin.')).toBeInTheDocument()
    expect(screen.getByText(/Close the sample Reset Pro demo on append proof/i)).toBeInTheDocument()
    expect(screen.getByText('This is the demo endpoint, not live evidence.')).toBeInTheDocument()
    expect(screen.getByText('Sample only')).toBeInTheDocument()
    expect(screen.getByText(/Sample mode does not persist uploads/i)).toBeInTheDocument()
    expect(screen.getByText('PRESENTER-GATED APPEND SHORTCUT')).toBeInTheDocument()
    expect(screen.getByText('This close was opened directly after the private gate.')).toBeInTheDocument()
    expect(screen.getByText(/Mission HQ was bypassed for append close/i)).toBeInTheDocument()
    expect(screen.getByText(/do not claim the full private workspace walkthrough happened/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO APPEND CLOSE CHECKLIST')).toBeInTheDocument()
    expect(screen.getByText('End the demo by proving the workflow, not the trader.')).toBeInTheDocument()
    expect(screen.getByText('Context carried')).toBeInTheDocument()
    expect(screen.getByText(/Close with the carried question: Is the trader defending a setup/i)).toBeInTheDocument()
    expect(screen.getByText('Workflow to show')).toBeInTheDocument()
    expect(screen.getByText(/Load sample trades, parse preview, confirm sample append/i)).toBeInTheDocument()
    expect(screen.getByText('Forbidden close')).toBeInTheDocument()
    expect(screen.getByText(/Do not claim persistence, backend analytics, trader improvement/i)).toBeInTheDocument()
    expect(screen.getByText('Live proof path')).toBeInTheDocument()
    expect(screen.getByText(/Activation, real upload, generated artifacts/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO SAMPLE APPEND PACKET')).toBeInTheDocument()
    expect(screen.getByText('Load the closing sample in one click.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Load Reset Pro Sample Trades/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Load Reset Pro Sample Trades/i }))

    expect(screen.getByLabelText('Trades')).toHaveValue(
      '2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20\n2024-01-15 11:45 BANKNIFTY24JAN48200PE SELL 1 210.00 184.35',
    )
    expect(screen.getByText(/Reset Pro sample append packet loaded/i)).toBeInTheDocument()
    expect(screen.getByText(/Question being preserved: Is the trader defending a setup that no longer deserves the same risk/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Parse and preview trades' }))

    expect(await screen.findByText('Sample workspace can preview the parser, but it will not write trades to a permanent account.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm upload (2 trades)' }))

    expect(await screen.findByText('Sample workspace processed 2 trades.')).toBeInTheDocument()
    expect(screen.getByText('Sample mode shows parsing and workflow only. It does not persist uploads or update your account history.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO APPEND PROOF RECEIPT')).toBeInTheDocument()
    expect(screen.getByText('The demo closed correctly: workflow shown, live proof still locked.')).toBeInTheDocument()
    expect(screen.getByText('Unlock receipt carried')).toBeInTheDocument()
    expect(screen.getByText(/reset-pro-demo:india:locked-insight:free-report-123:marco:edge-decay:edge-decay-map/i)).toBeInTheDocument()
    expect(screen.getByText(/Presenter code opened sample Reset Pro access only/i)).toBeInTheDocument()
    expect(screen.getByText('Engagement receipt carried')).toBeInTheDocument()
    expect(screen.getByText(/2 report view\(s\), 1 locked click\(s\), 1 gate attempt\(s\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Report engagement is local route continuity only/i)).toBeInTheDocument()
    expect(screen.getByText('Sample parse demonstrated')).toBeInTheDocument()
    expect(screen.getByText('Private question preserved')).toBeInTheDocument()
    expect(screen.getByText('Is the trader defending a setup that no longer deserves the same risk?')).toBeInTheDocument()
    expect(screen.getByText('Live proof still required')).toBeInTheDocument()
    expect(screen.getByText(/does not prove trader-specific improvement/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return To Mission HQ/i })).toHaveAttribute('href', '/dashboard?market=india')
    expect(screen.getByRole('link', { name: /Activate Live Reset Pro/i })).toHaveAttribute('href', '/pricing?upgrade=reset-pro&market=india')
    expect(getTradePasteMemoryMock).not.toHaveBeenCalled()
    expect(updateSessionMetaMock).not.toHaveBeenCalled()
  }, 15000)

  test('shows real trade-paste-memory deltas in live mode', async () => {
    isSampleModeMock.mockReturnValue(false)
    getShibuyaRuntimeContractMock.mockReturnValue({
      mode: 'live',
      label: 'Live trader account',
      canUseSampleData: false,
      canPersistTrades: true,
      persistence: 'backend',
      requiresBackend: true,
      proofBoundary: 'Live account data must come from the Medallion API and durable account records.',
    })
    getStoredSessionMetaMock.mockReturnValue({
      caseStatus: 'awaiting_upload',
      market: 'india',
      offerKind: 'psych_audit',
      activationSource: 'locked_insight',
      activationReportId: 'public-teaser-append',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'edge-decay-map',
      activationLockedSectionTitle: 'Edge Decay Map',
      activationBridgeHeadline: 'Stop defending dead edge.',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
      activationBridgeWhyNow: 'The public story recognized edge decay; the live workspace must prove it from real history.',
      activationBridgeLiveProof: ['Upload baseline history', 'Append the next session'],
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
      activationEngagementBoundary: 'Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.',
      activationTeaserRequestId: 'TEASER-route-123',
      activationTeaserTradesAnalyzed: 10,
      activationTeaserWorstPattern: 'Revenge Trading',
      activationTeaserVerified: 'true',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'e'.repeat(64),
      activationTeaserVerifiedAt: '2026-06-20T00:03:00Z',
    })
    submitParsedTradesMock.mockResolvedValue({
      status: 'ok',
      trades_uploaded: 2,
      report_snapshot_id: 'snap_upload_003',
      report_id: 'report_upload_003',
      artifact_status: 'generated',
      append_count: 3,
      request_id: 'req_live_123',
    })
    const user = userEvent.setup()

    renderPage()

    expect(screen.getByText('LIVE ACTIVATION PROOF TARGET')).toBeInTheDocument()
    expect(screen.getByText('LIVE PROOF READINESS')).toBeInTheDocument()
    expect(screen.getByText('Before this upload can become live proof.')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload turns this from carried context into account evidence.')).toBeInTheDocument()
    expect(screen.getByText('Activated from locked report module')).toBeInTheDocument()
    expect(screen.getByText('public-teaser-append')).toBeInTheDocument()
    expect(screen.getByText('Edge Decay Map')).toBeInTheDocument()
    expect(screen.getByText('Marco: Profitable refiner - Edge Decay')).toBeInTheDocument()
    expect(screen.getByText('guided; scenes 6; axes Edge Decay')).toBeInTheDocument()
    expect(screen.getByText('Mirror selected, Evidence intent')).toBeInTheDocument()
    expect(screen.getByText('Backend teaser receipt')).toBeInTheDocument()
    expect(screen.getByText('TEASER-route-123; 10 trades; Revenge Trading; verification verified')).toBeInTheDocument()
    expect(screen.getByText('Activation engagement receipt')).toBeInTheDocument()
    expect(screen.getByText('2 report view(s), 1 locked click(s), 1 gate attempt(s)')).toBeInTheDocument()
    expect(screen.getByText(/Engagement boundary: Report engagement is local route continuity only/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO LIVE QUESTION')).toBeInTheDocument()
    expect(screen.getByText('Is the trader defending a setup that no longer deserves the same risk?')).toBeInTheDocument()
    expect(screen.queryByText('This is the demo endpoint, not live evidence.')).not.toBeInTheDocument()
    expect(screen.queryByText('RESET PRO SAMPLE APPEND PACKET')).not.toBeInTheDocument()
    expect(screen.getByText('RESET PRO PROOF EXIT')).toBeInTheDocument()
    expect(screen.getByText('This is where the live proof loop starts.')).toBeInTheDocument()
    expect(screen.getByText('Live write')).toBeInTheDocument()
    expect(screen.getByText(/Confirmed uploads write to the live account/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Trades'), {
      target: { value: '2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20' },
    })
    await user.click(screen.getByRole('button', { name: 'Parse and preview trades' }))
    await user.click(screen.getByRole('button', { name: 'Confirm upload (2 trades)' }))

    expect(await screen.findByText('Uploaded 2 trades to your live account.')).toBeInTheDocument()
    expect(screen.getByText('LIVE APPEND PROOF RECEIPT')).toBeInTheDocument()
    expect(screen.getByText('Backend artifact generated for this account.')).toBeInTheDocument()
    expect(screen.getAllByText('snap_upload_003').length).toBeGreaterThan(0)
    expect(screen.getAllByText('report_upload_003').length).toBeGreaterThan(0)
    expect(screen.getByText('Generated artifact snapshot: snap_upload_003.')).toBeInTheDocument()
    expect(screen.getByText('Report artifact: report_upload_003.')).toBeInTheDocument()
    expect(screen.getByText('Durable upload count for this account: 3.')).toBeInTheDocument()
    expect(screen.getByText('Backend request receipt: req_live_123.')).toBeInTheDocument()
    expect(screen.getByText('Comparing upload #3 to #2')).toBeInTheDocument()
    expect(screen.getByText('Win Rate: 50.0% -> 55.0% (+5.0pp)')).toBeInTheDocument()
    expect(screen.getByText('Append proof comparison is ready.')).toBeInTheDocument()
    expect(screen.getByText('Append proof is backed by at least two durable upload snapshots and the latest upload receipt.')).toBeInTheDocument()
    expect(screen.getByText('Baseline snapshot snap_upload_001 -> latest snapshot snap_upload_003.')).toBeInTheDocument()
    expect(screen.getByText('Latest report artifact: report_upload_003.')).toBeInTheDocument()
    expect(screen.getByText('Latest append request receipt: req_live_123.')).toBeInTheDocument()
    expect(screen.getByText('Activation teaser receipt: TEASER-route-123; 10 trades; Revenge Trading; verification verified.')).toBeInTheDocument()

    await waitFor(() => {
      expect(getTradePasteMemoryMock).toHaveBeenCalledTimes(1)
    })
    expect(getTradingReportComparisonMock).toHaveBeenCalledTimes(1)
    expect(logTraderLifecycleEventMock).toHaveBeenCalledWith({
      event_name: 'first_upload_completed',
      market: 'india',
      tier: undefined,
      metadata: {
        uploadTransport: 'paste',
        tradesUploaded: 2,
        reportSnapshotId: 'snap_upload_003',
        reportId: 'report_upload_003',
        artifactStatus: 'generated',
        appendCount: 3,
        requestId: 'req_live_123',
        activationSource: 'locked_insight',
        activationReportId: 'public-teaser-append',
        activationArchetypeId: 'marco',
        activationAxisId: 'edge_decay',
        activationStorySource: 'guided',
        activationVisitedSceneCount: 6,
        activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
        activationLockedSectionId: 'edge-decay-map',
        activationTeaserRequestId: 'TEASER-route-123',
        activationTeaserTradesAnalyzed: 10,
        activationTeaserWorstPattern: 'Revenge Trading',
        activationTeaserVerified: 'true',
        activationTeaserVerificationStatus: 'verified',
        activationTeaserReceiptHash: 'e'.repeat(64),
        activationTeaserVerifiedAt: '2026-06-20T00:03:00Z',
      },
    })
    const expectedReceipt = {
      upload_transport: 'paste',
      trades_uploaded: 2,
      report_snapshot_id: 'snap_upload_003',
      report_id: 'report_upload_003',
      artifact_status: 'generated',
      append_count: 3,
      request_id: 'req_live_123',
    }
    expect(updateSessionMetaMock).toHaveBeenCalledWith({
      caseStatus: 'baseline_ready',
      lastReportSnapshotId: 'snap_upload_003',
      firstUploadReceipt: expectedReceipt,
      latestUploadReceipt: expectedReceipt,
      uploadReceiptHistory: [expectedReceipt],
    })
  }, 15000)
})
