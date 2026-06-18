import { afterEach, describe, expect, test, vi } from 'vitest'

const httpGetMock = vi.fn()
const httpPostMock = vi.fn()

vi.mock('../httpClient', () => {
  class ApiError extends Error {
    status: number
    requestId?: string

    constructor(message: string, status: number, requestId?: string) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.requestId = requestId
    }
  }

  return {
    ApiError,
    http: {
      get: (...args: unknown[]) => httpGetMock(...args),
      post: (...args: unknown[]) => httpPostMock(...args),
    },
  }
})

afterEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('checkout API boundary', () => {
  test('validates promo codes through the promo endpoint', async () => {
    const { validatePromoCode } = await import('../checkout')

    httpPostMock.mockResolvedValueOnce({
      data: {
        valid: true,
        code: 'IFX',
        dashboard_months_bonus: 1,
        message: 'Code applied.',
      },
    })

    await expect(validatePromoCode(' ifx ')).resolves.toEqual({
      valid: true,
      code: 'IFX',
      dashboard_months_bonus: 1,
      message: 'Code applied.',
    })
    expect(httpPostMock).toHaveBeenCalledWith('/v1/promo/validate', { code: 'ifx' })
  })

  test('normalizes backend promo rejection into a user-safe invalid result', async () => {
    const { validatePromoCode } = await import('../checkout')
    const { ApiError } = await import('../httpClient')

    httpPostMock.mockRejectedValueOnce(new ApiError('Invalid code', 400))

    await expect(validatePromoCode('bad-code')).resolves.toEqual({
      valid: false,
      dashboard_months_bonus: 0,
      message: 'Could not validate code',
    })
  })

  test('rethrows network promo failures so checkout can record the code for later verification', async () => {
    const { validatePromoCode } = await import('../checkout')
    const { ApiError } = await import('../httpClient')

    httpPostMock.mockRejectedValueOnce(new ApiError('Unable to connect', 0))

    await expect(validatePromoCode('IFX')).rejects.toThrow('Unable to connect')
  })
})
