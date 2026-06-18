import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  window.localStorage.clear()
  vi.resetModules()
  vi.doUnmock('../../constants')
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
})
