'use server'

import { Resend } from 'resend'
import { env } from '~/env.js'
import { siteConfig } from '~/config/site'
import {
  BookingConfirmedEmail,
  BookingQuoteEmail,
  BookingRequestEmail,
  bookingConfirmedEmailText,
  bookingQuoteEmailText,
  bookingRequestEmailText,
} from '~/components/emails/booking'

const resend = new Resend(env.RESEND_API_KEY)

type BookingEmailData = {
  reference: string
  clientName: string
  email: string
  phone?: string
  packageName: string
  preferredDate: string
  preferredTime?: string | null
  city: string
}

export async function sendBookingRequestEmails(
  data: BookingEmailData,
): Promise<boolean> {
  try {
    const props = {
      reference: data.reference,
      clientName: data.clientName,
      packageName: data.packageName,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      city: data.city,
    }

    const [clientResult, adminResult] = await Promise.all([
      resend.emails.send({
        from: `Photography <${siteConfig.emails.noReply}>`,
        to: [data.email],
        subject: `Photography request received — ${data.reference}`,
        replyTo: siteConfig.emails.replyTo,
        react: BookingRequestEmail(props),
        text: bookingRequestEmailText(props),
      }),
      resend.emails.send({
        from: `Photography <${siteConfig.emails.noReply}>`,
        to: [env.ADMIN_EMAIL],
        subject: `New photography request — ${data.reference}`,
        replyTo: data.email,
        text: `New photography booking request

Reference: ${data.reference}
Client: ${data.clientName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Package: ${data.packageName}
Date: ${data.preferredDate}${data.preferredTime ? ` • ${data.preferredTime}` : ''}
Location: ${data.city}

Open the admin dashboard to review and quote this request.`,
      }),
    ])

    if (clientResult.error || adminResult.error) {
      console.error(
        '[Booking Email] Request notification failed',
        clientResult.error || adminResult.error,
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[Booking Email] Request notification error', error)
    return false
  }
}

export async function sendBookingQuoteEmail(data: BookingEmailData & {
  quotedAmountZmw: number
  depositAmountZmw: number
  notes?: string | null
}): Promise<boolean> {
  try {
    const props = {
      reference: data.reference,
      clientName: data.clientName,
      packageName: data.packageName,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      city: data.city,
      quotedAmountZmw: data.quotedAmountZmw,
      depositAmountZmw: data.depositAmountZmw,
      notes: data.notes,
    }

    const result = await resend.emails.send({
      from: `Photography <${siteConfig.emails.noReply}>`,
      to: [data.email],
      subject: `Your photography quote — ${data.reference}`,
      replyTo: siteConfig.emails.replyTo,
      react: BookingQuoteEmail(props),
      text: bookingQuoteEmailText(props),
    })

    if (result.error) {
      console.error('[Booking Email] Quote email failed', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Booking Email] Quote email error', error)
    return false
  }
}


export async function sendBookingConfirmedEmail(
  data: BookingEmailData,
): Promise<boolean> {
  try {
    const props = {
      reference: data.reference,
      clientName: data.clientName,
      packageName: data.packageName,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      city: data.city,
    }

    const result = await resend.emails.send({
      from: `Photography <${siteConfig.emails.noReply}>`,
      to: [data.email],
      subject: `Booking confirmed — ${data.reference}`,
      replyTo: siteConfig.emails.replyTo,
      react: BookingConfirmedEmail(props),
      text: bookingConfirmedEmailText(props),
    })

    if (result.error) {
      console.error('[Booking Email] Confirmation email failed', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Booking Email] Confirmation email error', error)
    return false
  }
}
