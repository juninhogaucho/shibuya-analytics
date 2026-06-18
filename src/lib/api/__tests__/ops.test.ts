import { afterEach, describe, expect, test, vi } from 'vitest'

const httpGetMock = vi.fn()
const httpPatchMock = vi.fn()
const httpPostMock = vi.fn()

vi.mock('../httpClient', () => ({
  http: {
    get: (...args: unknown[]) => httpGetMock(...args),
    patch: (...args: unknown[]) => httpPatchMock(...args),
    post: (...args: unknown[]) => httpPostMock(...args),
  },
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('ops API boundary', () => {
  test('routes case list, detail, and affiliate report calls to admin endpoints', async () => {
    const { getShibuyaAffiliateReport, getShibuyaOpsCase, getShibuyaOpsCases } = await import('../ops')

    httpGetMock
      .mockResolvedValueOnce({ data: { cases: [] } })
      .mockResolvedValueOnce({ data: { case: { customer_id: 'cus_123' } } })
      .mockResolvedValueOnce({ data: { rows: [], note: 'ok' } })

    await expect(getShibuyaOpsCases({ q: 'zerodha', status: 'awaiting_upload', limit: 50 })).resolves.toEqual({
      cases: [],
    })
    await expect(getShibuyaOpsCase('cus_123')).resolves.toEqual({
      case: { customer_id: 'cus_123' },
    })
    await expect(getShibuyaAffiliateReport()).resolves.toEqual({
      rows: [],
      note: 'ok',
    })

    expect(httpGetMock).toHaveBeenNthCalledWith(1, '/v1/admin/shibuya/cases', {
      params: { q: 'zerodha', status: 'awaiting_upload', limit: 50 },
    })
    expect(httpGetMock).toHaveBeenNthCalledWith(2, '/v1/admin/shibuya/cases/cus_123')
    expect(httpGetMock).toHaveBeenNthCalledWith(3, '/v1/admin/shibuya/affiliates/report')
  })

  test('routes case updates and reminders to admin endpoints', async () => {
    const { sendShibuyaOpsReminder, updateShibuyaOpsCase } = await import('../ops')

    httpPatchMock.mockResolvedValueOnce({ data: { case: { customer_id: 'cus_123', case_status: 'baseline_ready' } } })
    httpPostMock.mockResolvedValueOnce({ data: { status: 'ok', sent: true } })

    await expect(
      updateShibuyaOpsCase('cus_123', {
        case_status: 'baseline_ready',
        next_action: 'Review latest upload',
      }),
    ).resolves.toEqual({
      case: { customer_id: 'cus_123', case_status: 'baseline_ready' },
    })
    await expect(sendShibuyaOpsReminder('cus_123', 'upload')).resolves.toEqual({
      status: 'ok',
      sent: true,
    })

    expect(httpPatchMock).toHaveBeenCalledWith('/v1/admin/shibuya/cases/cus_123', {
      case_status: 'baseline_ready',
      next_action: 'Review latest upload',
    })
    expect(httpPostMock).toHaveBeenCalledWith('/v1/admin/shibuya/cases/cus_123/reminders/upload')
  })
})
