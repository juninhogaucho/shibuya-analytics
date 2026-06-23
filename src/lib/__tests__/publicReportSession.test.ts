import { afterEach, describe, expect, test } from 'vitest'
import {
  PUBLIC_REPORT_SESSION_STORAGE_KEY,
  appendDemoLauncherSamplePacketParam,
  appendDemoLauncherSamplePacketToPath,
  buildDemoLauncherSampleReportSession,
  buildPublicReportSession,
  getPublicReportSession,
  hasCheckoutGradePublicReportSession,
  hasDemoLauncherSamplePacketRequest,
  persistPublicReportSessionAliases,
  persistPublicReportSession,
  validatePublicPasteSample,
  validatePublicReportInput,
  validatePublicTeaserReportResponse,
} from '../publicReportSession'

afterEach(() => {
  window.localStorage.clear()
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

describe('public report sessions', () => {
  test('rejects malformed pasted samples before report creation', () => {
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'too short' })).toContain('Paste a table-like sample')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'this is a long paragraph about trade history but it is not a table' })).toContain('Paste a table-like sample')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,side,size,entry,exit,pnl' })).toContain('Paste at least one trade row')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,entry,exit\n2026-06-18,EURUSD,1.0800,1.0830' })).toContain('side/direction')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,side,size,entry,exit,pnl\n2026-06-18,EURUSD,buy,1,1.0800,1.0830,30' })).toBeNull()
    expect(validatePublicReportInput({ source: 'upload', fileName: 'trades.csv', pasteBody: '' })).toContain('has not passed a local structure check')
    expect(validatePublicReportInput({ source: 'upload', fileName: 'trades.csv', fileValidationPassed: true, pasteBody: '' })).toBeNull()
    expect(validatePublicReportInput({ source: 'upload', fileName: 'trades.xlsx', fileValidationError: 'Export CSV/TXT first.', pasteBody: '' })).toBe('Export CSV/TXT first.')
    expect(validatePublicReportInput({ source: 'sample' })).toBeNull()
  })

  test('accepts common pasted table separators', () => {
    expect(validatePublicPasteSample('date\tsymbol\tside\tentry\texit\tpnl\n2026-06-18\tEURUSD\tbuy\t1.0800\t1.0830\t30')).toBeNull()
    expect(validatePublicPasteSample('time;instrument;direction;price;profit\n2026-06-18;NIFTY;buy;100;50')).toBeNull()
    expect(validatePublicPasteSample('timestamp|pair|action|open price|net\n2026-06-18|BTCUSD|sell|65000|-120')).toBeNull()
  })

  test('stores only secret-free upload metadata', () => {
    const session = buildPublicReportSession({
      reportId: 'free-report-1',
      market: 'india',
      archetypeId: 'priya',
      axisId: 'drawdown_pressure',
      fileName: 'Luis private broker export.csv',
      pasteBody: 'date,symbol,side,size,entry,exit,pnl\n2026-06-18,NIFTY,buy,1,100,101,50',
      source: 'upload',
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure', 'not-real', 'drawdown_pressure'],
      visitedSceneCount: 99,
      signalMarkerIds: ['mirror_selected', 'bad-marker', 'upload_intent', 'mirror_selected'],
    })

    persistPublicReportSession(session)

    const raw = window.localStorage.getItem(PUBLIC_REPORT_SESSION_STORAGE_KEY) ?? ''
    expect(raw).not.toContain('Luis private broker export')
    expect(raw).not.toContain('NIFTY')
    expect(getPublicReportSession('free-report-1')).toMatchObject({
      reportId: 'free-report-1',
      source: 'mixed',
      evidenceLabel: 'Local CSV file plus pasted sample',
      artifactStatus: 'local_preview_only',
      artifactStatusLabel: 'Local preview only',
      productionArtifactProven: false,
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure'],
      visitedSceneCount: 15,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      liveProofGap: {
        statusLabel: 'BACKEND TARGET PRESENT',
        headline: 'Live proof has a backend target, but still needs evidence.',
      },
    })
    expect(getPublicReportSession('free-report-1')?.liveProofGap.rows.map((row) => row.label)).toEqual([
      'Backend target',
      'Activation',
      'First meaningful upload',
      'Append history',
    ])
    expect(getPublicReportSession('free-report-1')?.liveProofGap.boundary).toContain('They cannot prove payment')
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Selected public pain axes: Drawdown Pressure.',
    )
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Website-level signal markers: Mirror selected, Evidence intent.',
    )
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Artifact status: local preview only; no backend-generated production report exists for this packet.',
    )
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Pasted sample passed local structure check: date/time, instrument, direction, and result/price fields detected.',
    )
  })

  test('stores backend teaser receipt without raw trade rows', () => {
    const session = buildPublicReportSession({
      reportId: 'public-teaser-backed',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      pasteBody: 'date,symbol,side,size,entry,exit,pnl\n2026-06-18,XAUUSD,buy,1,2300,2315,150',
      source: 'upload',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      backendTeaser: {
        status: 'success',
        report_type: 'teaser',
        report_id: 'public-teaser-backed',
        request_id: 'TEASER-abc123',
        artifact_status: 'backend_teaser_persisted',
        production_artifact_proven: false,
        receipt_hash: 'a'.repeat(64),
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
      },
    })

    persistPublicReportSession(session)

    const raw = window.localStorage.getItem(PUBLIC_REPORT_SESSION_STORAGE_KEY) ?? ''
    const stored = getPublicReportSession('public-teaser-backed')

    expect(raw).not.toContain('XAUUSD')
    expect(stored).toMatchObject({
      reportId: 'public-teaser-backed',
      source: 'backend_teaser',
      evidenceLabel: 'Persisted backend teaser receipt',
      artifactStatus: 'backend_teaser_persisted',
      artifactStatusLabel: 'Backend teaser persisted',
      productionArtifactProven: false,
      backendTeaser: {
        reportId: 'public-teaser-backed',
        requestId: 'TEASER-abc123',
        artifactStatus: 'backend_teaser_persisted',
        receiptHash: 'a'.repeat(64),
        tradesAnalyzed: 10,
        disciplineTax: 120,
        totalPnl: 420,
        winRate: 60,
        winners: 6,
        losers: 4,
        avgWin: 85,
        avgLoss: -42.5,
        maxLossStreak: 3,
        worstPattern: 'Revenge Trading',
        hook: '$120 discipline tax detected before activation.',
        patternsDetected: [
          { pattern: 'Revenge Trading', count: 2, cost: 84 },
          { pattern: 'Overtrading', count: 1, cost: 0 },
        ],
        processingTimeSeconds: 0.42,
        publicContext: {
          market: 'global',
          storySource: 'guided',
          archetypeId: 'marco',
          axisId: 'edge_decay',
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          visitedSceneCount: 6,
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
      },
    })
    expect(hasCheckoutGradePublicReportSession(stored)).toBe(true)
    expect(stored?.validationSummary).toContain('Backend teaser receipt persisted')
    expect(stored?.validationFacts).toContain('Backend teaser persisted: report public-teaser-backed; request TEASER-abc123; 10 trades analyzed.')
    expect(stored?.validationFacts).toContain(`Backend teaser receipt hash: ${'a'.repeat(64)}.`)
    expect(stored?.validationFacts).toContain('Backend teaser hook: $120 discipline tax detected before activation.')
    expect(stored?.validationFacts).toContain('Backend teaser aggregate split: 6 winners / 4 losers.')
    expect(stored?.validationFacts).toContain('Backend teaser average win/loss: 85 / -42.5.')
    expect(stored?.validationFacts).toContain('Backend teaser detected patterns: Revenge Trading, Overtrading.')
    expect(stored?.validationFacts).toContain('Backend teaser story identity: guided; marco / edge_decay; scenes 6.')
    expect(stored?.boundary).toContain('stores only the persisted backend teaser receipt')
  })

  test('validates checkout-grade backend teaser responses before session persistence', () => {
    const validResponse = {
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-valid',
      request_id: 'TEASER-valid',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'b'.repeat(64),
      trades_analyzed: 10,
      metrics: BACKEND_PUBLIC_CONTEXT,
    }

    expect(validatePublicTeaserReportResponse(validResponse)).toBeNull()
    expect(validatePublicTeaserReportResponse({ ...validResponse, artifact_status: 'backend_teaser_generated' })).toContain('persisted teaser receipt')
    expect(validatePublicTeaserReportResponse({ ...validResponse, trades_analyzed: 9 })).toContain('fewer than 10 trades')
    expect(validatePublicTeaserReportResponse({ ...validResponse, receipt_hash: 'not-a-receipt' })).toContain('valid secret-free teaser receipt hash')
    expect(validatePublicTeaserReportResponse({ ...validResponse, production_artifact_proven: true })).toContain('cannot claim private production artifact proof')
    expect(validatePublicTeaserReportResponse({ ...validResponse, metrics: {} })).toContain('hash-covered public story identity')
  })

  test('stores recovered backend teaser sessions under canonical report id and lookup aliases', () => {
    const session = buildPublicReportSession({
      reportId: 'public-teaser-canonical-123',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      source: 'backend_teaser',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      backendTeaser: {
        status: 'success',
        report_type: 'teaser',
        report_id: 'public-teaser-canonical-123',
        request_id: 'TEASER-canonical-123',
        artifact_status: 'backend_teaser_persisted',
        production_artifact_proven: false,
        receipt_hash: 'e'.repeat(64),
        trades_analyzed: 14,
        metrics: BACKEND_PUBLIC_CONTEXT,
      },
    })

    persistPublicReportSessionAliases(session, ['TEASER-canonical-123', ''])

    expect(getPublicReportSession('public-teaser-canonical-123')).toMatchObject({
      reportId: 'public-teaser-canonical-123',
      backendTeaser: {
        requestId: 'TEASER-canonical-123',
      },
    })
    expect(getPublicReportSession('TEASER-canonical-123')).toMatchObject({
      reportId: 'public-teaser-canonical-123',
      backendTeaser: {
        reportId: 'public-teaser-canonical-123',
        requestId: 'TEASER-canonical-123',
      },
    })
    expect(hasCheckoutGradePublicReportSession(getPublicReportSession('TEASER-canonical-123'))).toBe(true)
  })

  test('refuses to attach backend teaser receipts to sample report sessions', () => {
    const session = buildPublicReportSession({
      reportId: 'sample-report-backed-input',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      source: 'sample',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      backendTeaser: {
        status: 'success',
        report_type: 'teaser',
        report_id: 'public-teaser-should-not-attach',
        request_id: 'TEASER-should-not-attach',
        artifact_status: 'backend_teaser_persisted',
        production_artifact_proven: false,
        receipt_hash: 's'.repeat(64),
        trades_analyzed: 12,
        headline: {
          total_pnl: 420,
          discipline_tax: 120,
          win_rate: 60,
          worst_pattern: 'Revenge Trading',
          hook: '$120 discipline tax detected before activation.',
        },
        metrics: {
          winners: 6,
          losers: 6,
        },
        patterns_detected: [
          { pattern: 'Revenge Trading', count: 2, cost: 84 },
        ],
      },
    })

    expect(session).toMatchObject({
      reportId: 'sample-report-backed-input',
      source: 'sample',
      evidenceLabel: 'Sample history packet',
      artifactStatus: 'sample_demo_only',
      artifactStatusLabel: 'Sample demo only',
      productionArtifactProven: false,
      backendTeaser: null,
    })
    expect(session.validationSummary).toBe('Demo packet accepted. This proves the public journey transition, not live analytics.')
    expect(session.validationFacts).toContain('Artifact status: sample demo only; no backend-generated production report exists for this packet.')
    expect(session.validationFacts).not.toContain('Backend teaser persisted: report public-teaser-should-not-attach; request TEASER-should-not-attach; 12 trades analyzed.')
    expect(session.validationFacts).not.toContain('Backend teaser aggregate split: 6 winners / 6 losers.')
    expect(session.validationFacts).not.toContain('Backend teaser detected patterns: Revenge Trading.')
    expect(session.boundary).toContain('not a production report artifact')
  })

  test('builds an explicit demo launcher sample packet without raw upload claims', () => {
    expect(hasDemoLauncherSamplePacketRequest('?demo_packet=launcher_sample')).toBe(true)
    expect(hasDemoLauncherSamplePacketRequest('?demo_packet=sample')).toBe(false)

    const session = buildDemoLauncherSampleReportSession({
      reportId: 'sample-behavioral-leak-report',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })

    expect(session).toMatchObject({
      reportId: 'sample-behavioral-leak-report',
      source: 'sample',
      evidenceLabel: 'Demo launcher sample packet',
      artifactStatus: 'sample_demo_only',
      artifactStatusLabel: 'Controlled launcher sample only',
      productionArtifactProven: false,
      validationSummary: 'Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })
    expect(session.validationFacts).toContain('Demo launcher initialized this sample packet from an explicit shared-link flag.')
    expect(session.validationFacts).toContain('Artifact status: sample demo only; no backend-generated production report exists for this packet.')
    expect(session.validationFacts).toContain('No visitor file, raw trade row, production upload, or account-specific analysis is claimed.')
    expect(session.boundary).toContain('sample demo artifact')
    expect(session.liveProofGap.rows.map((row) => row.label)).toEqual([
      'Backend target',
      'Activation',
      'First meaningful upload',
      'Append history',
    ])

    expect(appendDemoLauncherSamplePacketParam(new URLSearchParams('source=guided_report'), true).toString()).toBe(
      'source=guided_report&demo_packet=launcher_sample',
    )
    expect(appendDemoLauncherSamplePacketParam(new URLSearchParams('source=guided_report'), false).toString()).toBe(
      'source=guided_report',
    )
    expect(appendDemoLauncherSamplePacketToPath('/activate?source=locked_insight', true)).toBe(
      '/activate?source=locked_insight&demo_packet=launcher_sample',
    )
    expect(appendDemoLauncherSamplePacketToPath('/activate?demo_packet=launcher_sample', true)).toBe(
      '/activate?demo_packet=launcher_sample',
    )
    expect(appendDemoLauncherSamplePacketToPath('/activate?source=locked_insight', false)).toBe(
      '/activate?source=locked_insight',
    )
  })
})
