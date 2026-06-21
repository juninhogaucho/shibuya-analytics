import { clearShibuyaSession, getStoredApiKey, setLiveApiKey, type ShibuyaSessionMeta } from '../runtime'
import type { ActivationPayload, ActivationResponse } from '../types'
import { http } from './httpClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  api_key?: string
  customer_id?: string
  email?: string
  name?: string
  tier?: string
  prop_firm_id?: string | null
  prop_firm_name?: string | null
  error?: string
}

function splitPublicContextList(value?: string | null): string[] | undefined {
  const items = value?.split(',').map((item) => item.trim()).filter(Boolean) ?? []
  return items.length ? items : undefined
}

function parsePublicContextCount(value?: string | null): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function isTrueString(value?: string | null): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function isFalseString(value?: string | null): boolean {
  return value?.trim().toLowerCase() === 'false'
}

function hasValidReceiptHash(value?: string | null): boolean {
  return Boolean(value && /^[a-f0-9]{64}$/i.test(value.trim()))
}

export function hasVerifiedActivationPublicContext(data: ActivationResponse): boolean {
  const tradesAnalyzed = parsePublicContextCount(data.publicContextTeaserTradesAnalyzed)

  return Boolean(
    data.publicContextSource === 'locked_insight' &&
      data.publicContextPacketSource === 'backend_teaser' &&
      data.publicContextArtifactStatus === 'backend_teaser_persisted' &&
      isFalseString(data.publicContextProductionArtifactProven) &&
      data.publicContextReportId?.trim() &&
      data.publicContextSectionId?.trim() &&
      data.publicContextArchetypeId?.trim() &&
      data.publicContextAxisId?.trim() &&
      data.publicContextTeaserRequestId?.trim() &&
      Number.isFinite(tradesAnalyzed) &&
      (tradesAnalyzed ?? 0) >= 10 &&
      isTrueString(data.publicContextTeaserVerified) &&
      data.publicContextTeaserVerificationStatus === 'verified' &&
      hasValidReceiptHash(data.publicContextTeaserReceiptHash) &&
      data.publicContextTeaserVerifiedAt?.trim(),
  )
}

export function buildVerifiedActivationPublicContextMeta(data: ActivationResponse): Partial<ShibuyaSessionMeta> {
  if (!hasVerifiedActivationPublicContext(data)) {
    return {}
  }

  return {
    activationSource: data.publicContextSource ?? undefined,
    activationReportId: data.publicContextReportId ?? undefined,
    activationArchetypeId: data.publicContextArchetypeId ?? undefined,
    activationAxisId: data.publicContextAxisId ?? undefined,
    activationReportArtifactStatus: data.publicContextArtifactStatus ?? undefined,
    activationProductionArtifactProven: data.publicContextProductionArtifactProven ?? undefined,
    activationTeaserRequestId: data.publicContextTeaserRequestId ?? undefined,
    activationTeaserTradesAnalyzed: parsePublicContextCount(data.publicContextTeaserTradesAnalyzed),
    activationTeaserWorstPattern: data.publicContextTeaserWorstPattern ?? undefined,
    activationTeaserVerified: data.publicContextTeaserVerified ?? undefined,
    activationTeaserVerificationStatus: data.publicContextTeaserVerificationStatus ?? undefined,
    activationTeaserReceiptHash: data.publicContextTeaserReceiptHash ?? undefined,
    activationTeaserVerifiedAt: data.publicContextTeaserVerifiedAt ?? undefined,
    activationStorySource: data.publicContextStorySource ?? undefined,
    activationSelectedPainAxisIds: splitPublicContextList(data.publicContextPainAxes),
    activationVisitedSceneCount: parsePublicContextCount(data.publicContextStorySceneCount),
    activationSignalMarkerIds: splitPublicContextList(data.publicContextSignalMarkers),
    activationLockedSectionId: data.publicContextSectionId ?? undefined,
    activationEngagementReportViewCount: parsePublicContextCount(data.publicContextReportViews),
    activationEngagementLockedSectionClickCount: parsePublicContextCount(data.publicContextLockedClicks),
    activationEngagementCurrentSectionClickCount: parsePublicContextCount(data.publicContextCurrentSectionClicks),
    activationEngagementPrivateDemoIntentCount: parsePublicContextCount(data.publicContextPrivateGateAttempts),
  }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/login', payload)
  if (data.success && data.api_key) {
    setLiveApiKey(data.api_key, {
      tier: data.tier,
      customerId: data.customer_id,
    })
  }
  return data
}

export async function register(payload: LoginRequest & { name?: string }): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/register', payload)
  if (data.success && data.api_key) {
    setLiveApiKey(data.api_key, { tier: data.tier })
  }
  return data
}

export async function verifyActivation(payload: ActivationPayload): Promise<ActivationResponse> {
  const { data } = await http.post<ActivationResponse>('/v1/trader/activations/verify', payload)
  if (data.activationToken) {
    const verifiedActivationContext = buildVerifiedActivationPublicContextMeta(data)

    setLiveApiKey(data.activationToken, {
      customerId: data.customerId,
      tier: data.tier,
      planId: data.planId,
      market: data.market,
      offerKind: data.offerKind,
      caseStatus: data.caseStatus,
      accessExpiresAt: data.accessExpiresAt ?? null,
      dataSource: data.dataSource ?? null,
      ...verifiedActivationContext,
    })
  }
  return data
}

export interface BootstrapPasswordResponse {
  success: boolean
  message?: string
  error?: string
  new_api_key?: string | null
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  message?: string
  error?: string
}

export interface ChangePasswordResponse {
  success: boolean
  message?: string
  error?: string
  new_api_key?: string | null
}

export async function bootstrapPassword(newPassword: string): Promise<BootstrapPasswordResponse> {
  const { data } = await http.post<BootstrapPasswordResponse>('/v1/auth/bootstrap-password', {
    new_password: newPassword,
  })

  if (data.new_api_key) {
    setLiveApiKey(data.new_api_key)
  }

  return data
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await http.post<ForgotPasswordResponse>('/v1/auth/forgot-password', {
    email,
  })
  return data
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  const { data } = await http.post<ResetPasswordResponse>('/v1/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return data
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
  const { data } = await http.post<ChangePasswordResponse>('/v1/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })

  if (data.new_api_key) {
    setLiveApiKey(data.new_api_key)
  }

  return data
}

export const requestActivation = verifyActivation

export function isAuthenticated(): boolean {
  return !!getStoredApiKey()
}

export function logout(): void {
  clearShibuyaSession()
  window.location.href = '/login'
}

export function clearAllData(): void {
  clearShibuyaSession()
  window.location.href = '/'
}
