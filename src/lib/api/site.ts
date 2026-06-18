import { isSampleMode } from '../runtime'
import { http } from './httpClient'

export interface ContactMessagePayload {
  name?: string
  email: string
  message: string
  source?: 'landing' | 'dashboard' | 'footer_contact'
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<{ status: string }> {
  if (isSampleMode()) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return { status: 'queued' }
  }

  const { data } = await http.post<{ status: string }>('/v1/site/contact', payload)
  return data
}
