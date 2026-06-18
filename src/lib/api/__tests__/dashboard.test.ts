import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  window.localStorage.clear()
  vi.resetModules()
  vi.doUnmock('../../constants')
})

describe('dashboard API boundary', () => {
  test('serves sample workspace data only in sample mode', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { getDashboardOverview, getTradeHistory } = await import('../dashboard')

    enterSampleMode({ preview: 'reset_pro' })

    await expect(getDashboardOverview()).resolves.toMatchObject({
      data_source: 'sample_dataset',
      case_status: 'sample_preview',
      guided_review_included: true,
    })
    await expect(getTradeHistory()).resolves.toMatchObject({
      total_count: 18,
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
