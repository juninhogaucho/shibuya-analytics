import { readAffiliateAttribution } from '../affiliateAttribution'
import { isSampleMode } from '../runtime'
import { ApiError, http } from './httpClient'

export interface CheckoutSessionRequest {
  plan_id: string
  email: string
  name: string
  success_url?: string
  cancel_url?: string
  public_context_source?: string
  public_context_report_id?: string
  public_context_section_id?: string
  public_context_archetype_id?: string
  public_context_axis_id?: string
  public_context_packet_source?: string
  public_context_story_source?: string
  public_context_story_scene_count?: string
  public_context_pain_axes?: string
  public_context_signal_markers?: string
  public_context_report_views?: string
  public_context_locked_clicks?: string
  public_context_current_section_clicks?: string
  public_context_private_gate_attempts?: string
  affiliate_slug?: string
  ref_code?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referral_code?: string
}

export interface CheckoutSessionResponse {
  checkout_url: string
  session_id: string
  order_id: string
}

export interface PromoValidationResponse {
  valid: boolean
  code?: string
  code_type?: string
  dashboard_months_bonus: number
  message: string
}

export async function createCheckoutSession(payload: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  const attribution = readAffiliateAttribution()
  const mergedPayload = {
    ...payload,
    affiliate_slug: payload.affiliate_slug ?? attribution?.affiliate_slug,
    ref_code: payload.ref_code ?? attribution?.ref_code,
    utm_source: payload.utm_source ?? attribution?.utm_source,
    utm_medium: payload.utm_medium ?? attribution?.utm_medium,
    utm_campaign: payload.utm_campaign ?? attribution?.utm_campaign,
  }
  const { data } = await http.post<CheckoutSessionResponse>('/v1/checkout/create-session', mergedPayload)
  return data
}

export async function validatePromoCode(code: string): Promise<PromoValidationResponse> {
  try {
    const normalizedCode = code.trim()
    const { data } = await http.post<PromoValidationResponse>('/v1/promo/validate', {
      code: normalizedCode,
    })
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      return {
        valid: false,
        dashboard_months_bonus: 0,
        message: 'Could not validate code',
      }
    }

    throw error
  }
}

export async function trackAffiliateClick(code: string): Promise<void> {
  if (isSampleMode()) {
    return
  }

  await http.get(`/v1/affiliate/track/${encodeURIComponent(code.trim())}`)
}

export interface CheckoutSessionStatus {
  session_id: string
  status: string
  payment_status: string
  customer_email?: string
  order_id?: string
  customer_name?: string
  plan_id?: string
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionStatus> {
  const { data } = await http.get<CheckoutSessionStatus>(`/v1/checkout/session/${sessionId}`)
  return data
}
