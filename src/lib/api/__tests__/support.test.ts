import { afterEach, describe, expect, test } from 'vitest'

afterEach(() => {
  window.localStorage.clear()
})

describe('support API boundary', () => {
  test('serves sample appointment state without backend persistence claims', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { bookMyAppointment, getAppointmentSlots, getMyAppointments, cancelMyAppointment } = await import('../support')

    enterSampleMode({ preview: 'reset_pro' })

    await expect(getAppointmentSlots('onboarding_intro')).resolves.toMatchObject({
      timezone: 'UTC',
      slots: expect.arrayContaining([
        expect.objectContaining({
          display: expect.any(String),
          datetime: expect.any(String),
        }),
      ]),
    })

    await expect(
      bookMyAppointment({
        appointment_type: 'onboarding_intro',
        scheduled_at: '2026-06-18T10:00:00.000Z',
      }),
    ).resolves.toMatchObject({
      success: true,
      appointment_id: 'sample-appointment',
      appointment_type: 'onboarding_intro',
      message: 'Sample appointment booked.',
    })

    await expect(getMyAppointments()).resolves.toMatchObject({
      appointments: [expect.objectContaining({ id: 'sample-appointment' })],
    })
    await expect(cancelMyAppointment('sample-appointment')).resolves.toEqual({
      success: true,
      message: 'Sample appointment cancelled.',
    })
  })

  test('serves sample support ticket state with explicit sample IDs', async () => {
    const { enterSampleMode } = await import('../../runtime')
    const { createSupportTicket, getSupportTicket, getSupportTickets, replyToSupportTicket } = await import('../support')

    enterSampleMode()

    await expect(getSupportTickets()).resolves.toMatchObject({
      status: 'success',
      tickets: [expect.objectContaining({ id: 'sample-ticket' })],
    })

    await expect(getSupportTicket('sample-ticket')).resolves.toMatchObject({
      ticket: {
        id: 'sample-ticket',
        messages: expect.arrayContaining([
          expect.objectContaining({ sender_type: 'admin' }),
        ]),
      },
    })

    await expect(
      createSupportTicket({
        subject: 'Broker export blocked',
        message: 'The file keeps failing.',
        category: 'technical',
        priority: 'high',
      }),
    ).resolves.toMatchObject({
      id: 'sample-ticket-new',
      subject: 'Broker export blocked',
      priority: 'high',
    })

    await expect(replyToSupportTicket('sample-ticket', { message: 'Tried the rescue path.' })).resolves.toMatchObject({
      id: 'sample-ticket',
      message_count: 3,
      messages: expect.arrayContaining([
        expect.objectContaining({
          sender_type: 'customer',
          message: 'Tried the rescue path.',
        }),
      ]),
    })
  })
})
