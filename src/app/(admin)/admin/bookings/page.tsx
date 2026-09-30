import type { Metadata } from 'next'
import { CalendarDays, CircleDollarSign, MapPin, Phone } from 'lucide-react'
import { format } from 'date-fns'
import {
  getBookings,
  updateBookingStatus,
} from '~/lib/actions/booking-actions'
import { bookingStatusLabels } from '~/config/booking'
import { bookingStatuses } from '~/server/db/schema'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bookings',
  description: 'Manage photography booking requests',
}

export default async function BookingsAdminPage() {
  const bookingList = await getBookings()

  const requested = bookingList.filter(
    (booking) => booking.status === 'requested',
  ).length
  const active = bookingList.filter((booking) =>
    ['confirmed', 'scheduled', 'shoot_completed', 'editing', 'gallery_ready'].includes(
      booking.status,
    ),
  ).length
  const completed = bookingList.filter(
    (booking) => booking.status === 'completed',
  ).length

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-sm text-muted-foreground">Client operations</p>
        <h1 className="text-3xl font-bold tracking-tight">Photography Bookings</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="New requests" value={requested} />
        <SummaryCard label="Active shoots" value={active} />
        <SummaryCard label="Completed" value={completed} />
      </div>

      {bookingList.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No booking requests yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New enquiries submitted through the public booking page will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingList.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{booking.clientName}</h2>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      PH-{String(booking.bookingNumber).padStart(5, '0')}
                    </span>
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {bookingStatusLabels[
                        booking.status as keyof typeof bookingStatusLabels
                      ] ?? booking.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {booking.packageName} • Requested{' '}
                    {booking.createdAt
                      ? format(booking.createdAt, 'dd MMM yyyy, HH:mm')
                      : 'recently'}
                  </p>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <Detail
                      icon={CalendarDays}
                      label="Preferred date"
                      value={`${booking.preferredDate}${
                        booking.preferredTime
                          ? ` • ${booking.preferredTime}`
                          : ''
                      }`}
                    />
                    <Detail
                      icon={MapPin}
                      label="Location"
                      value={[booking.city, booking.location]
                        .filter(Boolean)
                        .join(' • ')}
                    />
                    <Detail
                      icon={Phone}
                      label="Contact"
                      value={`${booking.phone} • ${booking.email}`}
                    />
                    <Detail
                      icon={CircleDollarSign}
                      label="Budget"
                      value={
                        booking.budgetZmw
                          ? `K${booking.budgetZmw.toLocaleString()}`
                          : 'Not specified'
                      }
                    />
                  </div>

                  {booking.message && (
                    <div className="mt-5 rounded-lg bg-muted/50 p-4 text-sm leading-6">
                      {booking.message}
                    </div>
                  )}
                </div>

                <form
                  action={updateBookingStatus.bind(null, booking.id)}
                  className="flex min-w-56 gap-2"
                >
                  <select
                    name="status"
                    defaultValue={booking.status}
                    className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
                  >
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {bookingStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    Save
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}
