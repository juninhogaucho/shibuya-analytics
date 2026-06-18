import { afterEach, describe, expect, test } from 'vitest'
import {
  PUBLIC_REPORT_SESSION_STORAGE_KEY,
  buildPublicReportSession,
  getPublicReportSession,
  persistPublicReportSession,
  validatePublicPasteSample,
  validatePublicReportInput,
} from '../publicReportSession'

afterEach(() => {
  window.localStorage.clear()
})

describe('public report sessions', () => {
  test('rejects malformed pasted samples before report creation', () => {
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'too short' })).toContain('Paste a table-like sample')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'this is a long paragraph about trade history but it is not a table' })).toContain('Paste a table-like sample')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,side,size,entry,exit,pnl' })).toContain('Paste at least one trade row')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,entry,exit\n2026-06-18,EURUSD,1.0800,1.0830' })).toContain('side/direction')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,side,size,entry,exit,pnl\n2026-06-18,EURUSD,buy,1,1.0800,1.0830,30' })).toBeNull()
    expect(validatePublicReportInput({ source: 'upload', fileName: 'trades.csv', pasteBody: '' })).toBeNull()
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
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure'],
      visitedSceneCount: 15,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Selected public pain axes: Drawdown Pressure.',
    )
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Website-level signal markers: Mirror selected, Evidence intent.',
    )
    expect(getPublicReportSession('free-report-1')?.validationFacts).toContain(
      'Pasted sample passed local structure check: date/time, instrument, direction, and result/price fields detected.',
    )
  })
})
