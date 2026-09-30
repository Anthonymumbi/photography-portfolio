'use server'

import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { bookings, bookingStatuses } from '~/server/db/schema'

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

  await db
    .update(bookings)
    .set({
      status: status as (typeof bookingStatuses)[number],
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(bookings.id, bookingId))

  revalidatePath('/admin/bookings')
}
