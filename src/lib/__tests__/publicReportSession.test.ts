import { afterEach, describe, expect, test } from 'vitest'
import {
  PUBLIC_REPORT_SESSION_STORAGE_KEY,
  buildPublicReportSession,
  getPublicReportSession,
  persistPublicReportSession,
  validatePublicReportInput,
} from '../publicReportSession'

afterEach(() => {
  window.localStorage.clear()
})

describe('public report sessions', () => {
  test('rejects empty public uploads before report creation', () => {
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'too short' })).toContain('Attach a CSV')
    expect(validatePublicReportInput({ source: 'upload', pasteBody: 'date,symbol,side,size,entry,exit,pnl,notes,more rows here' })).toBeNull()
    expect(validatePublicReportInput({ source: 'upload', fileName: 'trades.csv', pasteBody: '' })).toBeNull()
    expect(validatePublicReportInput({ source: 'sample' })).toBeNull()
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
    })

    persistPublicReportSession(session)

    const raw = window.localStorage.getItem(PUBLIC_REPORT_SESSION_STORAGE_KEY) ?? ''
    expect(raw).not.toContain('Luis private broker export')
    expect(raw).not.toContain('NIFTY')
    expect(getPublicReportSession('free-report-1')).toMatchObject({
      reportId: 'free-report-1',
      source: 'mixed',
      evidenceLabel: 'Local CSV file plus pasted sample',
    })
  })
})
