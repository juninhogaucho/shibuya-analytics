import { getStoredSessionMeta, isSampleMode, updateSessionMeta } from './runtime'
import { deriveTraderModeFromProfileContext } from './traderMode'
import { SAMPLE_PROFILE_CONTEXT, SAMPLE_WORKSPACE_DATA, getSampleWorkspaceOverview } from './sampleWorkspace'
import { http, withRetry } from './api/httpClient'
export { ApiError } from './api/httpClient'
export {
  bootstrapPassword,
  changePassword,
  clearAllData,
  forgotPassword,
  isAuthenticated,
  login,
  logout,
  register,
  requestActivation,
  resetPassword,
  verifyActivation,
} from './api/auth'
export type {
  BootstrapPasswordResponse,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordResponse,
} from './api/auth'
export {
  createCheckoutSession,
  getCheckoutSession,
  trackAffiliateClick,
} from './api/checkout'
export type {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CheckoutSessionStatus,
} from './api/checkout'
import type { 
  TradePastePreview,
  TradePasteMemoryResponse,
  TradeHistoryResponse,
  TradingReportsResponse,
  TradingReportComparisonResponse,
  DashboardOverview,
  AlertsResponse,
  EdgePortfolioResponse,
  SlumpPrescription,
  ShadowBoxingResponse,
  TraderProfileContext,
  DailyBriefingState,
  DailyDebriefState,
  AppointmentSlotResponse,
  AppointmentBookingResponse,
  AppointmentHistoryResponse,
  SupportTicketListResponse,
  SupportTicketDetailResponse,
  ShibuyaOpsCasesResponse,
  ShibuyaOpsCaseResponse,
  ShibuyaAffiliateReportResponse,
} from './types'

// Trade parsing
export async function parseTradePaste(payload: { body: string }) {
  const { data } = await http.post<TradePastePreview>('/v1/trader/trades/preview', payload)
  return data
}

export async function getTradePasteMemory(): Promise<TradePasteMemoryResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { has_previous: false, deltas: [], message: 'Sample workspace does not retain paste memory.' } as TradePasteMemoryResponse
  }
  return withRetry(async () => {
    const { data } = await http.get<TradePasteMemoryResponse>('/v1/dashboard/trade-paste-memory')
    return data
  })
}

export async function getTradeHistory(): Promise<TradeHistoryResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return SAMPLE_WORKSPACE_DATA.tradeHistory
  }
  return withRetry(async () => {
    const { data } = await http.get<TradeHistoryResponse>('/v1/dashboard/trade-history')
    return data
  })
}

export async function getTradingReports(limit = 20): Promise<TradingReportsResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return SAMPLE_WORKSPACE_DATA.reports
  }
  return withRetry(async () => {
    const { data } = await http.get<TradingReportsResponse>('/v1/trading-reports', {
      params: { limit },
    })
    return data
  })
}

export async function getTradingReportComparison(): Promise<TradingReportComparisonResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return SAMPLE_WORKSPACE_DATA.comparison
  }
  return withRetry(async () => {
    const { data } = await http.get<TradingReportComparisonResponse>('/v1/trading-reports/comparison')
    return data
  })
}

// Dashboard endpoints
export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400)) // Simulate network
    return getSampleWorkspaceOverview(getStoredSessionMeta()?.samplePreview ?? 'core')
  }
  return withRetry(async () => {
    const { data } = await http.get<DashboardOverview>('/v1/dashboard/overview')
    updateSessionMeta({
      customerId: data.customer_id,
      tier: data.access_tier,
      offerKind: data.offer_kind,
      caseStatus: data.case_status,
      traderMode: data.trader_mode,
      nextAction: data.next_action,
      accessExpiresAt: data.access_expires_at ?? null,
      dataSource: data.data_source ?? null,
    })
    return data
  })
}

export async function getDashboardAlerts(): Promise<AlertsResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return SAMPLE_WORKSPACE_DATA.alerts
  }
  return withRetry(async () => {
    const { data } = await http.get<AlertsResponse>('/v1/dashboard/alerts')
    return data
  })
}

export async function getEdgePortfolio(): Promise<EdgePortfolioResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 350))
    return SAMPLE_WORKSPACE_DATA.edgePortfolio
  }
  return withRetry(async () => {
    const { data } = await http.get<EdgePortfolioResponse>('/v1/dashboard/edge-portfolio')
    return data
  })
}

export async function getSlumpPrescription(): Promise<SlumpPrescription> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return SAMPLE_WORKSPACE_DATA.slump
  }
  return withRetry(async () => {
    const { data } = await http.get<SlumpPrescription>('/v1/dashboard/slump-prescription')
    return data
  })
}

export async function getShadowBoxing(): Promise<ShadowBoxingResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return SAMPLE_WORKSPACE_DATA.shadowBoxing
  }
  return withRetry(async () => {
    const { data } = await http.get<ShadowBoxingResponse>('/v1/dashboard/shadow-boxing')
    return data
  })
}

// Upload
export async function uploadTradesCSV(file: File): Promise<{ status: string; trades_uploaded: number; report: Record<string, unknown> }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { status: 'sample', trades_uploaded: 0, report: { message: 'Upload disabled in sample workspace' } }
  }
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post('/v1/dashboard/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// Submit parsed trades (from paste flow)
export async function submitParsedTrades(payload: { trades: unknown[]; rawText: string }): Promise<{ status: string; trades_uploaded: number }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Simulate counting trades from raw text
    const lineCount = payload.rawText.trim().split('\n').filter(l => l.trim()).length
    return { status: 'sample', trades_uploaded: lineCount }
  }
  const { data } = await http.post('/v1/dashboard/trades/submit', payload)
  return data
}

// Public website contact form
export interface ContactMessagePayload {
  name: string
  email: string
  message: string
  source?: 'landing' | 'dashboard'
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<{ status: string }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { status: 'queued' }
  }
  const { data } = await http.post<{ status: string }>('/v1/site/contact', payload)
  return data
}

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

export async function getAppointmentSlots(
  appointmentType: 'onboarding_intro' | 'review_30day' | 'onboarding' = 'onboarding_intro',
): Promise<AppointmentSlotResponse> {
  if (isSampleMode()) {
    return {
      timezone: 'UTC',
      slots: [
        {
          datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          display: 'Tomorrow at 10:00 AM UTC',
        },
        {
          datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          display: 'In 2 days at 2:30 PM UTC',
        },
      ],
    }
  }

  const { data } = await http.get<AppointmentSlotResponse>('/api/appointments/slots', {
    params: {
      appointment_type: appointmentType,
      type: appointmentType,
    },
  })
  return data
}

export async function bookMyAppointment(payload: {
  appointment_type: 'onboarding_intro' | 'review_30day' | 'onboarding'
  scheduled_at: string
  order_id?: string
  duration_minutes?: number
}): Promise<AppointmentBookingResponse> {
  if (isSampleMode()) {
    return {
      success: true,
      appointment_id: 'sample-appointment',
      scheduled_at: payload.scheduled_at,
      appointment_type: payload.appointment_type,
      message: 'Sample appointment booked.',
      meeting_link: 'https://meet.google.com/sample-room',
    }
  }

  const { data } = await http.post<AppointmentBookingResponse>('/api/appointments/book/me', payload)
  return data
}

export async function getMyAppointments(): Promise<AppointmentHistoryResponse> {
  if (isSampleMode()) {
    return {
      appointments: [
        {
          id: 'sample-appointment',
          type: 'onboarding_intro',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          meeting_link: 'https://meet.google.com/sample-room',
          duration_minutes: 30,
        },
      ],
    }
  }

  const { data } = await http.get<AppointmentHistoryResponse>('/api/appointments/me')
  return data
}

export async function cancelMyAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
  if (isSampleMode()) {
    return { success: true, message: 'Sample appointment cancelled.' }
  }

  const { data } = await http.post<{ success: boolean; message: string }>(`/api/appointments/${appointmentId}/cancel/me`)
  return data
}

export async function getSupportTickets(): Promise<SupportTicketListResponse> {
  if (isSampleMode()) {
    return {
      status: 'success',
      count: 1,
      tickets: [
        {
          id: 'sample-ticket',
          subject: 'Need help cleaning a broker export',
          category: 'technical',
          priority: 'medium',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 1,
        },
      ],
    }
  }

  const { data } = await http.get<SupportTicketListResponse>('/support/tickets')
  return data
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicketDetailResponse> {
  if (isSampleMode()) {
    return {
      status: 'success',
      ticket: {
        id: ticketId,
        subject: 'Need help cleaning a broker export',
        category: 'technical',
        priority: 'medium',
        status: 'open',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 2,
        messages: [
          {
            id: 'sample-ticket-msg-1',
            sender_id: 'sample-customer',
            sender_type: 'customer',
            message: 'The CSV from my broker keeps failing on upload.',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-ticket-msg-2',
            sender_id: 'support',
            sender_type: 'admin',
            message: 'Use the import concierge and try the rescue path once more before sending the raw file.',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ],
      },
    }
  }

  const { data } = await http.get<SupportTicketDetailResponse>(`/support/tickets/${ticketId}`)
  return data
}

export async function createSupportTicket(payload: {
  subject: string
  message: string
  category?: 'general' | 'account' | 'billing' | 'technical' | 'payout' | 'challenge' | 'kyc'
  priority?: 'low' | 'medium' | 'high'
}): Promise<SupportTicketListResponse['tickets'][number]> {
  if (isSampleMode()) {
    return {
      id: 'sample-ticket-new',
      subject: payload.subject,
      category: payload.category ?? 'general',
      priority: payload.priority ?? 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 1,
    }
  }

  const { data } = await http.post<{ status: string; ticket: SupportTicketListResponse['tickets'][number] }>(
    '/support/tickets',
    payload,
  )
  return data.ticket
}

export async function replyToSupportTicket(ticketId: string, payload: { message: string }): Promise<SupportTicketDetailResponse['ticket']> {
  if (isSampleMode()) {
    return {
      id: ticketId,
      subject: 'Need help cleaning a broker export',
      category: 'technical',
      priority: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 3,
      messages: [
        {
          id: 'sample-ticket-msg-1',
          sender_id: 'sample-customer',
          sender_type: 'customer',
          message: 'The CSV from my broker keeps failing on upload.',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-ticket-msg-2',
          sender_id: 'support',
          sender_type: 'admin',
          message: 'Use the import concierge and try the rescue path once more before sending the raw file.',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-ticket-msg-3',
          sender_id: 'sample-customer',
          sender_type: 'customer',
          message: payload.message,
          created_at: new Date().toISOString(),
        },
      ],
    }
  }

  const { data } = await http.post<SupportTicketDetailResponse>(`/support/tickets/${ticketId}/reply`, payload)
  return data.ticket
}

export async function getShibuyaOpsCases(params?: {
  status?: string
  trader_mode?: string
  affiliate_slug?: string
  offer_kind?: string
  q?: string
  limit?: number
}): Promise<ShibuyaOpsCasesResponse> {
  const { data } = await http.get<ShibuyaOpsCasesResponse>('/v1/admin/shibuya/cases', {
    params,
  })
  return data
}

export async function getShibuyaOpsCase(customerId: string): Promise<ShibuyaOpsCaseResponse> {
  const { data } = await http.get<ShibuyaOpsCaseResponse>(`/v1/admin/shibuya/cases/${customerId}`)
  return data
}

export async function updateShibuyaOpsCase(
  customerId: string,
  payload: {
    case_status?: string
    guided_review_status?: string
    next_action?: string
    note?: string
  },
): Promise<ShibuyaOpsCaseResponse> {
  const { data } = await http.patch<ShibuyaOpsCaseResponse>(`/v1/admin/shibuya/cases/${customerId}`, payload)
  return data
}

export async function sendShibuyaOpsReminder(
  customerId: string,
  reminderType: 'onboarding' | 'upload' | 'guided_review' | 'expiry',
): Promise<{ status: string; sent: boolean }> {
  const { data } = await http.post<{ status: string; sent: boolean }>(
    `/v1/admin/shibuya/cases/${customerId}/reminders/${reminderType}`,
  )
  return data
}

export async function getShibuyaAffiliateReport(): Promise<ShibuyaAffiliateReportResponse> {
  const { data } = await http.get<ShibuyaAffiliateReportResponse>('/v1/admin/shibuya/affiliates/report')
  return data
}

