import { afterEach, describe, expect, test, vi } from 'vitest'

const httpPostMock = vi.fn()

vi.mock('../httpClient', () => ({
  http: {
    post: (...args: unknown[]) => httpPostMock(...args),
  },
}))

afterEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('site API boundary', () => {
  test('queues contact messages locally in sample mode', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { submitContactMessage } = await import('../site')

    enterSampleMode()

    await expect(
      submitContactMessage({
        email: 'trader@example.com',
        message: 'Need help with Shibuya.',
        source: 'footer_contact',
      }),
    ).resolves.toEqual({ status: 'queued' })
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  test('posts contact messages to the site endpoint outside sample mode', async () => {
    const { submitContactMessage } = await import('../site')
    const payload = {
      email: 'trader@example.com',
      message: 'Need help with Shibuya.',
      source: 'footer_contact' as const,
    }

    httpPostMock.mockResolvedValueOnce({ data: { status: 'queued' } })

    await expect(submitContactMessage(payload)).resolves.toEqual({ status: 'queued' })
    expect(httpPostMock).toHaveBeenCalledWith('/v1/site/contact', payload)
  })
})
