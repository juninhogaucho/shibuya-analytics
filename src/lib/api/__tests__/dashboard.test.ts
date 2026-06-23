import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  window.localStorage.clear()
  vi.resetModules()
  vi.doUnmock('../../constants')
  vi.doUnmock('../httpClient')
})

describe('dashboard API boundary', () => {
  test('serves sample workspace data only in sample mode', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const {
      getDashboardOverview,
      getLiveUploadAppendReadiness,
      getTradeHistory,
      getTradingReportComparison,
      parseTradePaste,
      submitParsedTrades,
      uploadTradesCSV,
    } = await import('../dashboard')

    enterSampleMode({ preview: 'reset_pro' })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      data_source: 'sample_dataset',
      case_status: 'sample_preview',
      guided_review_included: true,
    })
    await expect(getTradeHistory()).resolves.toMatchObject({
      total_count: 18,
    })
    await expect(parseTradePaste({ body: '2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20' })).resolves.toMatchObject({
      rowsParsed: 1,
      symbols: ['NIFTY24JAN22500CE'],
      issues: [expect.stringContaining('Sample parser preview only')],
    })
    await expect(submitParsedTrades({ trades: [], rawText: 'row-1\nrow-2' })).resolves.toMatchObject({
      status: 'sample',
      trades_uploaded: 2,
    })
    await expect(uploadTradesCSV(new File(['date,symbol,pnl\n2024-01-01,NIFTY,100'], 'trades.csv'))).resolves.toMatchObject({
      status: 'sample',
      trades_uploaded: 0,
      report: {
        message: expect.stringContaining('Upload disabled in sample workspace'),
      },
    })
    await expect(getLiveUploadAppendReadiness()).resolves.toMatchObject({
      status: 'blocked',
      service: 'shibuya-live-upload-append',
      persists_upload_receipts: false,
      generates_account_artifacts: false,
      blockers: ['sample_mode_no_live_persistence'],
    })
    await expect(getTradingReportComparison()).resolves.toMatchObject({
      has_comparison: true,
    })
  })

  test('fails every live dashboard request when backend config is impossible', async () => {
    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api-not-configured.invalid',
      isApiBaseConfiguredForLive: () => false,
    }))

    const { setLiveApiKey } = await import('../../runtime')
    const {
      getDashboardAlerts,
      getDashboardOverview,
      getEdgePortfolio,
      getLiveUploadAppendReadiness,
      getShadowBoxing,
      getSlumpPrescription,
      getTradeHistory,
      getTradePasteMemory,
      getTradingReport,
      getTradingReportComparison,
      getTradingReports,
      parseTradePaste,
      submitParsedTrades,
      uploadTradesCSV,
    } = await import('../dashboard')

    setLiveApiKey('live_123', { tier: 'psych_audit' })

    const missingBackendError = /VITE_API_BASE is missing/

    await expect(parseTradePaste({ body: 'row' })).rejects.toThrow(missingBackendError)
    await expect(getTradePasteMemory()).rejects.toThrow(missingBackendError)
    await expect(getTradeHistory()).rejects.toThrow(missingBackendError)
    await expect(getTradingReports()).rejects.toThrow(missingBackendError)
    await expect(getTradingReport('report_live_123')).rejects.toThrow(missingBackendError)
    await expect(getTradingReportComparison()).rejects.toThrow(missingBackendError)
    await expect(getDashboardOverview()).rejects.toThrow(missingBackendError)
    await expect(getLiveUploadAppendReadiness()).rejects.toThrow(missingBackendError)
    await expect(getDashboardAlerts()).rejects.toThrow(missingBackendError)
    await expect(getEdgePortfolio()).rejects.toThrow(missingBackendError)
    await expect(getSlumpPrescription()).rejects.toThrow(missingBackendError)
    await expect(getShadowBoxing()).rejects.toThrow(missingBackendError)
    await expect(uploadTradesCSV(new File(['date,symbol,pnl\n2024-01-01,NIFTY,100'], 'trades.csv'))).rejects.toThrow(
      missingBackendError,
    )
    await expect(submitParsedTrades({ trades: [], rawText: 'row' })).rejects.toThrow(
      missingBackendError,
    )
  })

  test('rejects live persistence when backend is configured but session identity is local-only', async () => {
    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api.shibuya.example',
      isApiBaseConfiguredForLive: () => true,
    }))

    const { setLiveApiKey } = await import('../../runtime')
    const { getDashboardOverview, getLiveUploadAppendReadiness, submitParsedTrades, uploadTradesCSV } = await import('../dashboard')

    setLiveApiKey('live_local_only', { tier: 'reset_pro', market: 'global' })

    const unverifiedSessionError = /backend-verified live session identity/
    await expect(getDashboardOverview()).rejects.toThrow(unverifiedSessionError)
    await expect(getLiveUploadAppendReadiness()).rejects.toThrow(unverifiedSessionError)
    await expect(uploadTradesCSV(new File(['date,symbol,pnl\n2024-01-01,NIFTY,100'], 'trades.csv'))).rejects.toThrow(
      unverifiedSessionError,
    )
    await expect(submitParsedTrades({ trades: [], rawText: 'row' })).rejects.toThrow(unverifiedSessionError)
  })

  test('validates live append readiness before treating uploads as writable', async () => {
    const { validateLiveUploadAppendReadiness } = await import('../dashboard')

    const ready = {
      status: 'ready',
      service: 'shibuya-live-upload-append',
      customer_id: 'cust_live_123',
      accepts_csv_upload: true,
      accepts_trade_paste_submit: true,
      persists_upload_receipts: true,
      generates_account_artifacts: true,
      artifact_status_required: 'generated',
      append_count_required: 1,
      request_id_required: true,
      report_snapshot_required: true,
      read_only: false,
      upload_count: 1,
      upload_limit: 3,
      uploads_remaining: 2,
      blockers: [],
    }

    expect(validateLiveUploadAppendReadiness(ready)).toBeNull()
    expect(validateLiveUploadAppendReadiness(ready, 'cust_live_123')).toBeNull()
    expect(validateLiveUploadAppendReadiness({ ...ready, customer_id: undefined }, 'cust_live_123')).toContain('verified customer id')
    expect(validateLiveUploadAppendReadiness({ ...ready, customer_id: 'cust_other' }, 'cust_live_123')).toContain('different customer id')
    expect(validateLiveUploadAppendReadiness({ ...ready, status: 'blocked' })).toContain('not ready')
    expect(validateLiveUploadAppendReadiness({ ...ready, accepts_csv_upload: false })).toContain('not currently allowed')
    expect(validateLiveUploadAppendReadiness({ ...ready, persists_upload_receipts: false })).toContain('persist upload receipts')
    expect(validateLiveUploadAppendReadiness({ ...ready, artifact_status_required: 'missing' })).toContain('generated account artifacts')
    expect(validateLiveUploadAppendReadiness({ ...ready, request_id_required: false })).toContain('request and report snapshot')
    expect(validateLiveUploadAppendReadiness({ ...ready, append_count_required: 0 })).toContain('append-count')
    expect(validateLiveUploadAppendReadiness({ ...ready, read_only: true })).toContain('read only')
    expect(validateLiveUploadAppendReadiness({ ...ready, uploads_remaining: 0 })).toContain('no remaining live uploads')
  })

  test('requires successful generated artifact fields before treating upload response as live proof', async () => {
    const { hasGeneratedUploadArtifactProof, validateGeneratedLiveUploadArtifactProof } = await import('../dashboard')

    const proofResponse = {
      status: 'success',
      customer_id: 'cust_live_123',
      trades_uploaded: 12,
      artifact_status: 'generated',
      report_snapshot_id: 'snap_live_001',
      report_id: 'report_live_001',
      request_id: 'req_live_001',
      append_count: 1,
    }

    expect(validateGeneratedLiveUploadArtifactProof(proofResponse)).toBeNull()
    expect(validateGeneratedLiveUploadArtifactProof(proofResponse, 'cust_live_123')).toBeNull()
    expect(hasGeneratedUploadArtifactProof(proofResponse)).toBe(true)
    expect(hasGeneratedUploadArtifactProof(proofResponse, 'cust_live_123')).toBe(true)

    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, status: 'error' })).toContain('successful')
    expect(hasGeneratedUploadArtifactProof({ ...proofResponse, status: 'error' })).toBe(false)
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, trades_uploaded: 0 })).toContain('at least one')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, customer_id: undefined }, 'cust_live_123')).toContain('backend customer id')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, customer_id: 'cust_other' }, 'cust_live_123')).toContain('does not match')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, artifact_status: 'missing' })).toContain('generated account artifact')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, report_snapshot_id: null })).toContain('snapshot')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, request_id: '' })).toContain('request id')
    expect(validateGeneratedLiveUploadArtifactProof({ ...proofResponse, append_count: 0 })).toContain('append count')
  })

  test('recovers persisted activation origin from live dashboard overview', async () => {
    const httpGet = vi.fn().mockResolvedValue({
      data: {
        customer_id: 'cust_live_123',
        access_tier: 'reset_pro',
        offer_kind: 'reset_pro_live',
        case_status: 'awaiting_upload',
        trader_mode: 'profitable_refiner',
        next_action: 'upload_first_history',
        access_expires_at: null,
        data_source: 'backend',
        last_report_snapshot_id: 'snap_dashboard_002',
        first_upload_receipt: {
          customer_id: 'cust_live_123',
          completed_at: '2026-06-20T09:00:00Z',
          upload_transport: 'api',
          trades_uploaded: 10,
          report_snapshot_id: 'snap_dashboard_001',
          report_id: 'report_dashboard_001',
          artifact_status: 'generated',
          append_count: 1,
          request_id: 'req_dashboard_001',
        },
        latest_upload_receipt: {
          customer_id: 'cust_live_123',
          completed_at: '2026-06-21T09:00:00Z',
          upload_transport: 'api',
          trades_uploaded: 14,
          report_snapshot_id: 'snap_dashboard_002',
          report_id: 'report_dashboard_002',
          artifact_status: 'generated',
          append_count: 2,
          request_id: 'req_dashboard_002',
        },
        upload_receipt_history: [
          {
            customer_id: 'cust_live_123',
            completed_at: '2026-06-20T09:00:00Z',
            upload_transport: 'api',
            trades_uploaded: 10,
            report_snapshot_id: 'snap_dashboard_001',
            report_id: 'report_dashboard_001',
            artifact_status: 'generated',
            append_count: 1,
            request_id: 'req_dashboard_001',
          },
          {
            customer_id: 'cust_live_123',
            completed_at: '2026-06-21T09:00:00Z',
            upload_transport: 'api',
            trades_uploaded: 14,
            report_snapshot_id: 'snap_dashboard_002',
            report_id: 'report_dashboard_002',
            artifact_status: 'generated',
            append_count: 2,
            request_id: 'req_dashboard_002',
          },
        ],
        activation_origin: {
          source: 'locked_insight',
          report_id: 'public-teaser-dashboard-123',
          section_id: 'edge-decay-map',
          archetype_id: 'marco',
          axis_id: 'edge_decay',
          packet_source: 'backend_teaser',
          artifact_status: 'backend_teaser_persisted',
          production_artifact_proven: 'false',
          story_source: 'guided',
          story_scene_count: '6',
          pain_axes: 'edge_decay,revenge_reentry',
          signal_markers: 'mirror_selected,upload_intent',
          report_views: '2',
          locked_clicks: '1',
          current_section_clicks: '1',
          private_gate_attempts: '1',
          teaser_request_id: 'TEASER-dashboard-123',
          teaser_trades_analyzed: '10',
          teaser_worst_pattern: 'Revenge Trading',
          teaser_verified: 'true',
          teaser_verification_status: 'verified',
          teaser_receipt_hash: 'b'.repeat(64),
          teaser_verified_at: '2026-06-20T00:01:00Z',
        },
        bql_state: 'Unknown',
        bql_score: 0,
        monte_carlo_drift: 0,
        ruin_probability: 0,
        discipline_tax_30d: 0,
        sharpe_scenario: 0,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: '2026-04-05T19:00:00Z',
      },
    })

    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api.shibuya.example',
      isApiBaseConfiguredForLive: () => true,
    }))
    vi.doMock('../httpClient', () => ({
      http: { get: httpGet },
      withRetry: <T>(fn: () => Promise<T>) => fn(),
    }))

    const { getStoredSessionMeta, setLiveApiKey } = await import('../../runtime')
    const { getDashboardOverview } = await import('../dashboard')

    setLiveApiKey('live-token-123', {
      customerId: 'cust_live_123',
      authMode: 'password',
      tier: 'reset_pro',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
    })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      customer_id: 'cust_live_123',
      activation_origin: {
        report_id: 'public-teaser-dashboard-123',
      },
    })

    expect(httpGet).toHaveBeenCalledWith('/v1/dashboard/overview')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'cust_live_123',
      tier: 'reset_pro',
      lastReportSnapshotId: 'snap_dashboard_002',
      firstUploadReceipt: {
        request_id: 'req_dashboard_001',
        report_snapshot_id: 'snap_dashboard_001',
      },
      latestUploadReceipt: {
        request_id: 'req_dashboard_002',
        report_snapshot_id: 'snap_dashboard_002',
      },
      uploadReceiptHistory: [
        expect.objectContaining({ request_id: 'req_dashboard_001' }),
        expect.objectContaining({ request_id: 'req_dashboard_002' }),
      ],
      activationSource: 'locked_insight',
      activationReportId: 'public-teaser-dashboard-123',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'backend_teaser_persisted',
      activationProductionArtifactProven: 'false',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'edge-decay-map',
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
      activationEngagementBoundary: 'Activation context came from verified backend dashboard metadata.',
      activationOriginSyncStatus: 'dashboard_origin_verified',
      activationOriginSyncBoundary: 'Activation context came from verified backend dashboard metadata.',
      activationTeaserRequestId: 'TEASER-dashboard-123',
      activationTeaserTradesAnalyzed: 10,
      activationTeaserWorstPattern: 'Revenge Trading',
      activationTeaserVerified: 'true',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'b'.repeat(64),
      activationTeaserVerifiedAt: '2026-06-20T00:01:00Z',
    })
  })

  test('drops cross-customer upload receipts from live dashboard overview', async () => {
    const foreignReceipt = {
      customer_id: 'cust_other',
      completed_at: '2026-06-21T09:00:00Z',
      upload_transport: 'api',
      trades_uploaded: 14,
      report_snapshot_id: 'snap_foreign_002',
      report_id: 'report_foreign_002',
      artifact_status: 'generated',
      append_count: 2,
      request_id: 'req_foreign_002',
    }
    const httpGet = vi.fn().mockResolvedValue({
      data: {
        customer_id: 'cust_live_123',
        access_tier: 'reset_pro',
        offer_kind: 'reset_pro_live',
        case_status: 'baseline_ready',
        data_source: 'backend',
        last_report_snapshot_id: 'snap_dashboard_002',
        first_upload_receipt: foreignReceipt,
        latest_upload_receipt: foreignReceipt,
        upload_receipt_history: [foreignReceipt],
        bql_state: 'Unknown',
        bql_score: 0,
        monte_carlo_drift: 0,
        ruin_probability: 0,
        discipline_tax_30d: 0,
        sharpe_scenario: 0,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: '2026-04-05T19:00:00Z',
      },
    })

    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api.shibuya.example',
      isApiBaseConfiguredForLive: () => true,
    }))
    vi.doMock('../httpClient', () => ({
      http: { get: httpGet },
      withRetry: <T>(fn: () => Promise<T>) => fn(),
    }))

    const { getStoredSessionMeta, setLiveApiKey } = await import('../../runtime')
    const { getDashboardOverview } = await import('../dashboard')

    setLiveApiKey('live-token-123', {
      customerId: 'cust_live_123',
      authMode: 'password',
      tier: 'reset_pro',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'baseline_ready',
    })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      customer_id: 'cust_live_123',
      first_upload_receipt: null,
      latest_upload_receipt: null,
      upload_receipt_history: [],
    })

    const session = getStoredSessionMeta()
    expect(session?.customerId).toBe('cust_live_123')
    expect(session?.firstUploadReceipt).toBeNull()
    expect(session?.latestUploadReceipt).toBeNull()
    expect(session?.uploadReceiptHistory).toEqual([])
  })

  test('drops weak activation origin from live dashboard overview', async () => {
    const httpGet = vi.fn().mockResolvedValue({
      data: {
        customer_id: 'cust_live_weak',
        access_tier: 'reset_pro',
        offer_kind: 'reset_pro_live',
        case_status: 'awaiting_upload',
        data_source: 'backend',
        activation_origin: {
          source: 'locked_insight',
          report_id: 'legacy-local-report',
          section_id: 'edge-decay-map',
          archetype_id: 'marco',
          axis_id: 'edge_decay',
          packet_source: 'guided_public_report',
          artifact_status: 'local_preview_only',
          production_artifact_proven: 'false',
          teaser_request_id: 'TEASER-weak',
          teaser_trades_analyzed: '12',
          teaser_worst_pattern: 'Tilt Expansion',
          teaser_verified: 'true',
          teaser_verification_status: 'verified',
          teaser_receipt_hash: 'not-a-real-hash',
          teaser_verified_at: '2026-06-21T00:00:00Z',
        },
      },
    })

    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api.shibuya.example',
      isApiBaseConfiguredForLive: () => true,
    }))
    vi.doMock('../httpClient', () => ({
      http: { get: httpGet },
      withRetry: <T>(fn: () => Promise<T>) => fn(),
    }))

    const { getStoredSessionMeta, setLiveApiKey } = await import('../../runtime')
    const { getDashboardOverview } = await import('../dashboard')

    setLiveApiKey('live-token-weak', {
      customerId: 'cust_live_weak',
      authMode: 'password',
      tier: 'reset_pro',
      activationSource: 'locked_insight',
      activationReportId: 'old-report',
      activationTeaserRequestId: 'TEASER-old',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'c'.repeat(64),
    })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      customer_id: 'cust_live_weak',
      activation_origin: {
        report_id: 'legacy-local-report',
      },
    })

    const session = getStoredSessionMeta()
    expect(session).toMatchObject({
      customerId: 'cust_live_weak',
      tier: 'reset_pro',
      offerKind: 'reset_pro_live',
      dataSource: 'backend',
    })
    expect(session?.activationSource).toBeUndefined()
    expect(session?.activationReportId).toBeUndefined()
    expect(session?.activationTeaserRequestId).toBeUndefined()
    expect(session?.activationTeaserVerificationStatus).toBeUndefined()
    expect(session?.activationTeaserReceiptHash).toBeUndefined()
    expect(session?.activationOriginSyncStatus).toBe('dashboard_origin_rejected')
    expect(session?.activationOriginSyncBoundary).toBe(
      'Dashboard overview returned activation origin metadata, but it failed the backend proof checks, so local activation-origin details were cleared.',
    )
  })

  test('clears stale activation origin when live dashboard overview omits it', async () => {
    const httpGet = vi.fn().mockResolvedValue({
      data: {
        customer_id: 'cust_live_456',
        access_tier: 'psych_audit',
        offer_kind: 'psych_audit_live',
        case_status: 'awaiting_upload',
        trader_mode: 'profitable_refiner',
        next_action: 'upload_first_history',
        access_expires_at: null,
        data_source: 'backend',
        bql_state: 'Unknown',
        bql_score: 0,
        monte_carlo_drift: 0,
        ruin_probability: 0,
        discipline_tax_30d: 0,
        sharpe_scenario: 0,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: '2026-04-05T19:00:00Z',
      },
    })

    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api.shibuya.example',
      isApiBaseConfiguredForLive: () => true,
    }))
    vi.doMock('../httpClient', () => ({
      http: { get: httpGet },
      withRetry: <T>(fn: () => Promise<T>) => fn(),
    }))

    const { getStoredSessionMeta, setLiveApiKey } = await import('../../runtime')
    const { getDashboardOverview } = await import('../dashboard')

    setLiveApiKey('live-token-456', {
      customerId: 'cust_live_456',
      authMode: 'password',
      tier: 'reset_pro',
      activationSource: 'locked_insight',
      activationReportId: 'old-report',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'backend_teaser_generated',
      activationProductionArtifactProven: 'false',
      activationTeaserRequestId: 'TEASER-old',
      activationTeaserTradesAnalyzed: 10,
      activationTeaserWorstPattern: 'Revenge Trading',
      activationTeaserVerified: 'true',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'old-receipt-hash',
      activationTeaserVerifiedAt: '2026-06-20T00:00:00Z',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected'],
      activationLockedSectionId: 'edge-decay-map',
      activationLockedSectionTitle: 'Edge decay map',
      activationBridgeHeadline: 'Old bridge',
      activationBridgeDecisionQuestion: 'Old question?',
      activationBridgeWhyNow: 'Old reason.',
      activationBridgeLiveProof: ['Old upload proof'],
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
      activationEngagementBoundary: 'Old route continuity only.',
      lastReportSnapshotId: 'old-snapshot',
      firstUploadReceipt: { report_snapshot_id: 'old-first', request_id: 'old-first-req' },
      latestUploadReceipt: { report_snapshot_id: 'old-latest', request_id: 'old-latest-req' },
      uploadReceiptHistory: [{ report_snapshot_id: 'old-latest', request_id: 'old-latest-req' }],
    })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      customer_id: 'cust_live_456',
      data_source: 'backend',
    })

    const session = getStoredSessionMeta()
    expect(session).toMatchObject({
      customerId: 'cust_live_456',
      tier: 'psych_audit',
      offerKind: 'psych_audit_live',
      dataSource: 'backend',
    })
    expect(session?.activationSource).toBeUndefined()
    expect(session?.activationReportId).toBeUndefined()
    expect(session?.activationTeaserRequestId).toBeUndefined()
    expect(session?.activationTeaserVerificationStatus).toBeUndefined()
    expect(session?.activationTeaserReceiptHash).toBeUndefined()
    expect(session?.activationStorySource).toBeUndefined()
    expect(session?.activationLockedSectionTitle).toBeUndefined()
    expect(session?.activationBridgeDecisionQuestion).toBeUndefined()
    expect(session?.activationEngagementReportViewCount).toBeUndefined()
    expect(session?.activationEngagementBoundary).toBeUndefined()
    expect(session?.activationOriginSyncStatus).toBe('dashboard_origin_missing')
    expect(session?.activationOriginSyncBoundary).toBe(
      'Dashboard overview did not return verified activation origin metadata, so local activation-origin details were cleared until backend sync proves them.',
    )
    expect(session?.lastReportSnapshotId).toBeNull()
    expect(session?.firstUploadReceipt).toBeNull()
    expect(session?.latestUploadReceipt).toBeNull()
    expect(session?.uploadReceiptHistory).toEqual([])
  })
})
