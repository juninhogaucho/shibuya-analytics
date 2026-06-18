import type {
  ShibuyaAffiliateReportResponse,
  ShibuyaOpsCaseResponse,
  ShibuyaOpsCasesResponse,
} from '../types'
import { http } from './httpClient'

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
