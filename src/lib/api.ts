import { isSampleMode } from './runtime'
import { http } from './api/httpClient'
export { ApiError } from './api/httpClient'
export {
  assertDashboardBackendReady,
  getDashboardAlerts,
  getDashboardOverview,
  getEdgePortfolio,
  getShadowBoxing,
  getSlumpPrescription,
  getTradeHistory,
  getTradePasteMemory,
  getTradingReportComparison,
  getTradingReports,
  parseTradePaste,
  submitParsedTrades,
  uploadTradesCSV,
} from './api/dashboard'
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
export {
  getTraderProfileContext,
  logTraderLifecycleEvent,
  saveTraderDailyBriefing,
  saveTraderDailyDebrief,
  saveTraderProfileContext,
} from './api/trader'
export type {
  TraderLifecycleEventPayload,
  TraderProfileContextPayload,
} from './api/trader'
export {
  bookMyAppointment,
  cancelMyAppointment,
  createSupportTicket,
  getAppointmentSlots,
  getMyAppointments,
  getSupportTicket,
  getSupportTickets,
  replyToSupportTicket,
} from './api/support'
import type { 
  ShibuyaOpsCasesResponse,
  ShibuyaOpsCaseResponse,
  ShibuyaAffiliateReportResponse,
} from './types'

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

