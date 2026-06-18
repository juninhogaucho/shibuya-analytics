import { isSampleMode, updateSessionMeta } from '../runtime'
import { SAMPLE_PROFILE_CONTEXT } from '../sampleWorkspace'
import { deriveTraderModeFromProfileContext } from '../traderMode'
import type { DailyBriefingState, DailyDebriefState, TraderProfileContext } from '../types'
import { http } from './httpClient'

export interface TraderLifecycleEventPayload {
  event_name:
    | 'workspace_activated'
    | 'claim_password_completed'
    | 'onboarding_completed'
    | 'first_upload_completed'
    | 'next_session_mandate_viewed'
  market?: 'global' | 'india'
  tier?: string
  metadata?: Record<string, unknown>
}

export async function logTraderLifecycleEvent(payload: TraderLifecycleEventPayload): Promise<void> {
  if (isSampleMode()) {
    return
  }

  updateSessionMeta({
    market: payload.market,
    tier: payload.tier,
  })

  await http.post('/v1/trader/lifecycle-events', payload)
}

export async function getTraderProfileContext(): Promise<TraderProfileContext> {
  if (isSampleMode()) {
    return SAMPLE_PROFILE_CONTEXT
  }

  const { data } = await http.get<TraderProfileContext>('/v1/trader/profile-context')
  return data
}

export interface TraderProfileContextPayload {
  capital_band: TraderProfileContext['capital_band']
  monthly_income_band: TraderProfileContext['monthly_income_band']
  trader_focus: TraderProfileContext['trader_focus']
  broker_platform: string
  primary_instruments: TraderProfileContext['primary_instruments']
}

export async function saveTraderProfileContext(payload: TraderProfileContextPayload): Promise<TraderProfileContext> {
  if (isSampleMode()) {
    return {
      ...payload,
      trader_mode: deriveTraderModeFromProfileContext(payload),
      completed: true,
      updated_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<TraderProfileContext>('/v1/trader/profile-context', payload)
  return data
}

export async function saveTraderDailyBriefing(
  payload: Omit<DailyBriefingState, 'date' | 'completed_at'> & {
    headline?: string
    summary?: string
    action_plan?: string[]
    proof_focus?: string
    trader_mode?: string
  },
): Promise<DailyBriefingState> {
  if (isSampleMode()) {
    return {
      ...payload,
      date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<{ status: string; daily_briefing: DailyBriefingState }>(
    '/v1/trader/daily-briefing',
    payload,
  )
  return data.daily_briefing
}

export async function saveTraderDailyDebrief(
  payload: Omit<DailyDebriefState, 'date' | 'completed_at'>,
): Promise<DailyDebriefState> {
  if (isSampleMode()) {
    return {
      ...payload,
      date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<{ status: string; daily_debrief: DailyDebriefState }>(
    '/v1/trader/daily-debrief',
    payload,
  )
  return data.daily_debrief
}
