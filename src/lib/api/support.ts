import { isSampleMode } from '../runtime'
import type {
  AppointmentBookingResponse,
  AppointmentHistoryResponse,
  AppointmentSlotResponse,
  SupportTicketDetailResponse,
  SupportTicketListResponse,
} from '../types'
import { http } from './httpClient'

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

export async function replyToSupportTicket(
  ticketId: string,
  payload: { message: string },
): Promise<SupportTicketDetailResponse['ticket']> {
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
