import {
  clearShibuyaSession,
  getStoredApiKey,
  isBackendVerifiedAuthMode,
  setLiveApiKey,
  type ShibuyaSessionMeta,
} from '../runtime'
import type { ActivationPayload, ActivationResponse } from '../types'
import {
  buildActivationResponsePublicContextMeta,
  hasVerifiedActivationResponsePublicContext,
} from '../activationOrigin'
import { http } from './httpClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  api_key?: string
  customer_id?: string
  authMode?: 'password' | 'self_register' | 'dev_demo' | string | null
  email?: string
  name?: string
  tier?: string
  prop_firm_id?: string | null
  prop_firm_name?: string | null
  error?: string
}

export function getLoginSessionProofError(data: LoginResponse): string | null {
  if (!data.success) {
    return null
  }

  if (!data.api_key?.trim()) {
    return 'Medallion signed in but did not return an API key.'
  }

  if (!data.customer_id?.trim()) {
    return 'Medallion signed in but did not return a backend customer identity.'
  }

  if (data.authMode === 'dev_demo') {
    return 'Medallion returned a dev/demo login, not live account proof.'
  }

  if (!isBackendVerifiedAuthMode(data.authMode)) {
    return 'Medallion signed in but did not return a backend-verified login mode.'
  }

  return null
}

export function persistVerifiedLoginSession(data: LoginResponse): boolean {
  const proofError = getLoginSessionProofError(data)
  if (proofError) {
    throw new Error(proofError)
  }

  if (!data.success || !data.api_key || !data.customer_id) {
    return false
  }

  setLiveApiKey(data.api_key, {
    tier: data.tier,
    customerId: data.customer_id,
    authMode: data.authMode ?? null,
  })

  return true
}

export function hasVerifiedActivationPublicContext(data: ActivationResponse): boolean {
  return hasVerifiedActivationResponsePublicContext(data)
}

export function buildVerifiedActivationPublicContextMeta(data: ActivationResponse): Partial<ShibuyaSessionMeta> {
  return buildActivationResponsePublicContextMeta(data)
}

export function getActivationSessionProofError(data: ActivationResponse): string | null {
  if (data.status !== 'ready') {
    return null
  }

  if (!data.activationToken?.trim()) {
    return 'Medallion verified the order but did not return an activation token.'
  }

  if (!data.customerId?.trim()) {
    return 'Medallion verified the order but did not return a backend customer identity.'
  }

  if (data.activationMode !== 'paid_order') {
    if (data.activationMode === 'dev_demo') {
      return 'Medallion returned a dev/demo activation, not paid live activation proof.'
    }

    return 'Medallion verified the order but did not return paid activation proof.'
  }

  return null
}

export function persistVerifiedActivationSession(
  data: ActivationResponse,
  payload: ActivationPayload,
  metaOverrides: Partial<ShibuyaSessionMeta> = {},
): boolean {
  const proofError = getActivationSessionProofError(data)
  if (proofError) {
    throw new Error(proofError)
  }

  if (data.status !== 'ready' || !data.activationToken || !data.customerId) {
    return false
  }

  const verifiedActivationContext = buildVerifiedActivationPublicContextMeta(data)

  setLiveApiKey(data.activationToken, {
    customerId: data.customerId,
    tier: data.tier,
    planId: data.planId,
    market: data.market,
    orderId: payload.orderCode,
    activationMode: data.activationMode,
    offerKind: data.offerKind,
    caseStatus: data.caseStatus,
    accessExpiresAt: data.accessExpiresAt ?? null,
    dataSource: data.dataSource ?? null,
    ...verifiedActivationContext,
    ...metaOverrides,
  })

  return true
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/login', payload)
  persistVerifiedLoginSession(data)
  return data
}

export async function register(payload: LoginRequest & { name?: string }): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/register', payload)
  persistVerifiedLoginSession(data)
  return data
}

export async function verifyActivation(payload: ActivationPayload): Promise<ActivationResponse> {
  const { data } = await http.post<ActivationResponse>('/v1/trader/activations/verify', payload)
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
