import { clearShibuyaSession, getStoredApiKey, setLiveApiKey } from '../runtime'
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
    setLiveApiKey(data.activationToken, {
      customerId: data.customerId,
      tier: data.tier,
      planId: data.planId,
      market: data.market,
      offerKind: data.offerKind,
      caseStatus: data.caseStatus,
      accessExpiresAt: data.accessExpiresAt ?? null,
      dataSource: data.dataSource ?? null,
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

