import { afterEach, describe, expect, test, vi } from 'vitest'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('trader API boundary', () => {
  test('serves sample profile context without requiring the backend', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { SAMPLE_PROFILE_CONTEXT } = await import('../../sampleWorkspace')
    const { getTraderProfileContext } = await import('../trader')

    enterSampleMode({ preview: 'reset_pro' })

    await expect(getTraderProfileContext()).resolves.toEqual(SAMPLE_PROFILE_CONTEXT)
  })

  test('derives a completed sample trader profile when onboarding is saved', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { saveTraderProfileContext } = await import('../trader')

    enterSampleMode()

    await expect(
      saveTraderProfileContext({
        capital_band: 'over_1m_inr',
        monthly_income_band: 'over_200k_inr',
        trader_focus: 'profitable_refinement',
        broker_platform: 'Zerodha',
        primary_instruments: ['nifty_options'],
      }),
    ).resolves.toMatchObject({
      broker_platform: 'Zerodha',
      trader_mode: 'profitable_refiner',
      completed: true,
    })
  })

  test('saves sample daily briefing and debrief state locally shaped without persistence claims', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { saveTraderDailyBriefing, saveTraderDailyDebrief } = await import('../trader')

    enterSampleMode()

    await expect(
      saveTraderDailyBriefing({
        current_state: 'under_pressure',
        current_risk: 'overtrading',
        avoid_today: 'Do not add a third trade after first loss.',
        mission_line: 'One A+ setup only.',
      }),
    ).resolves.toMatchObject({
      current_state: 'under_pressure',
      current_risk: 'overtrading',
      date: expect.any(String),
      completed_at: expect.any(String),
    })

    await expect(
      saveTraderDailyDebrief({
        gate_obeyed: true,
        stopped_correctly: true,
        protected_capital: true,
        main_lapse: '',
        main_win: 'Skipped the chase.',
        tomorrow_line: 'Repeat the same standard.',
        standards_held_today: ['Capital preserved'],
        standards_broken_today: [],
      }),
    ).resolves.toMatchObject({
      gate_obeyed: true,
      main_win: 'Skipped the chase.',
      date: expect.any(String),
      completed_at: expect.any(String),
    })
  })

  test('does not mutate session metadata for sample lifecycle events', async () => {
    const { enterSampleMode, getStoredSessionMeta } = await import('../../runtime')
    const { logTraderLifecycleEvent } = await import('../trader')

    enterSampleMode({ market: 'india' })
    const before = getStoredSessionMeta()

    await logTraderLifecycleEvent({
      event_name: 'first_upload_completed',
      market: 'global',
      tier: 'reset_pro',
    })

    expect(getStoredSessionMeta()).toEqual(before)
  })
})
