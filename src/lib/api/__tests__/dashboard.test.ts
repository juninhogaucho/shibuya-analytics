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
    const { getDashboardOverview, getTradeHistory, parseTradePaste } = await import('../dashboard')

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
  })

  test('fails live dashboard writes when backend config is impossible', async () => {
    vi.doMock('../../constants', () => ({
      API_BASE_URL: 'https://api-not-configured.invalid',
      isApiBaseConfiguredForLive: () => false,
    }))

    const { setLiveApiKey } = await import('../../runtime')
    const { submitParsedTrades } = await import('../dashboard')

    setLiveApiKey('live_123', { tier: 'psych_audit' })

    await expect(submitParsedTrades({ trades: [], rawText: 'row' })).rejects.toThrow(
      /VITE_API_BASE is missing/,
    )
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
        activation_origin: {
          source: 'locked_insight',
          report_id: 'public_report_123',
          section_id: 'edge-decay-map',
          archetype_id: 'marco',
          axis_id: 'edge_decay',
          artifact_status: 'local_preview_only',
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
      tier: 'reset_pro',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
    })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      customer_id: 'cust_live_123',
      activation_origin: {
        report_id: 'public_report_123',
      },
    })

    expect(httpGet).toHaveBeenCalledWith('/v1/dashboard/overview')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'cust_live_123',
      tier: 'reset_pro',
      activationSource: 'locked_insight',
      activationReportId: 'public_report_123',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'local_preview_only',
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
      activationTeaserRequestId: 'TEASER-dashboard-123',
      activationTeaserTradesAnalyzed: 10,
      activationTeaserWorstPattern: 'Revenge Trading',
    })
  })
})
