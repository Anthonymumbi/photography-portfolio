'use server'

import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getSession } from '~/lib/auth/auth'
import { sendBookingConfirmedEmail, sendBookingQuoteEmail } from '~/lib/email/booking-email-service'
import { db } from '~/server/db'
import { bookings, bookingStatuses } from '~/server/db/schema'

const depositStatuses = ['unpaid', 'requested', 'paid', 'waived'] as const

async function requireAdmin() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  return session
}

export async function getBookings() {
  await requireAdmin()

  return db.select().from(bookings).orderBy(desc(bookings.createdAt))
}

export async function updateBookingStatus(
  bookingId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin()

  const status = String(formData.get('status') || '')
  if (!bookingStatuses.includes(status as (typeof bookingStatuses)[number])) {
    throw new Error('Invalid booking status')
  }

  const existing = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)
    .then((rows) => rows[0])

  if (!existing) throw new Error('Booking not found')

  await db
    .update(bookings)
    .set({
      status: status as (typeof bookingStatuses)[number],
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(bookings.id, bookingId))

  if (status === 'confirmed' && existing.status !== 'confirmed') {
    const reference = `PH-${String(existing.bookingNumber).padStart(5, '0')}`
    void sendBookingConfirmedEmail({
      reference,
      clientName: existing.clientName,
      email: existing.email,
      phone: existing.phone,
      packageName: existing.packageName,
      preferredDate: existing.preferredDate,
      preferredTime: existing.preferredTime,
      city: existing.city,
    })
  }

  revalidatePath('/admin/bookings')
}

export async function updateBookingCommercials(
  bookingId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin()

  const quote = Math.max(
    0,
    Math.round(Number(formData.get('quotedAmountZmw') || 0)),
  )
  const deposit = Math.max(
    0,
    Math.round(Number(formData.get('depositAmountZmw') || 0)),
  )
  const depositStatus = String(formData.get('depositStatus') || 'unpaid')
  const quoteNotes = String(formData.get('quoteNotes') || '').trim()
  const adminNotes = String(formData.get('adminNotes') || '').trim()

  if (
    !depositStatuses.includes(
      depositStatus as (typeof depositStatuses)[number],
    )
  ) {
    throw new Error('Invalid deposit status')
  }

  if (quote > 0 && deposit > quote) {
    throw new Error('Deposit cannot be greater than the total quote')
  }

  await db
    .update(bookings)
    .set({
      quotedAmountZmw: quote || null,
      depositAmountZmw: deposit || null,
      depositStatus,
      quoteNotes: quoteNotes || null,
      adminNotes: adminNotes || null,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(bookings.id, bookingId))

  revalidatePath('/admin/bookings')
}

export async function sendBookingQuote(
  bookingId: string,
): Promise<void> {
  await requireAdmin()

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)
    .then((rows) => rows[0])

  if (!booking) throw new Error('Booking not found')
  if (!booking.quotedAmountZmw || booking.quotedAmountZmw <= 0) {
    throw new Error('Set and save the final quote before sending it')
  }

  const depositAmount = booking.depositAmountZmw ?? 0
  const reference = `PH-${String(booking.bookingNumber).padStart(5, '0')}`

  const sent = await sendBookingQuoteEmail({
    reference,
    clientName: booking.clientName,
    email: booking.email,
    phone: booking.phone,
    packageName: booking.packageName,
    preferredDate: booking.preferredDate,
    preferredTime: booking.preferredTime,
    city: booking.city,
    quotedAmountZmw: booking.quotedAmountZmw,
    depositAmountZmw: depositAmount,
    notes: booking.quoteNotes,
  })

  if (!sent) throw new Error('Quote email could not be sent')

  if (depositAmount > 0 && booking.depositStatus === 'unpaid') {
    await db
      .update(bookings)
      .set({
        depositStatus: 'requested',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(bookings.id, bookingId))
  }

  revalidatePath('/admin/bookings')
}
