import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CalendarDays,
  CircleDollarSign,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getBookings,
  sendBookingQuote,
  updateBookingCommercials,
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
  const quotedValue = bookingList.reduce(
    (total, booking) => total + (booking.quotedAmountZmw ?? 0),
    0,
  )

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-sm text-muted-foreground">Client operations</p>
        <h1 className="text-3xl font-bold tracking-tight">Photography Bookings</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="New requests" value={requested.toString()} />
        <SummaryCard label="Active shoots" value={active.toString()} />
        <SummaryCard label="Completed" value={completed.toString()} />
        <SummaryCard
          label="Quoted pipeline"
          value={`K${quotedValue.toLocaleString()}`}
        />
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
        <div className="space-y-5">
          {bookingList.map((booking) => {
            const reference = `PH-${String(booking.bookingNumber).padStart(5, '0')}`
            const whatsappUrl = buildWhatsAppUrl({
              phone: booking.phone,
              reference,
              clientName: booking.clientName,
              quote: booking.quotedAmountZmw,
              deposit: booking.depositAmountZmw,
            })

            return (
              <article
                key={booking.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">{booking.clientName}</h2>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        {reference}
                      </span>
                      <span className="rounded-full border px-3 py-1 text-xs">
                        {bookingStatusLabels[
                          booking.status as keyof typeof bookingStatusLabels
                        ] ?? booking.status}
                      </span>
                      <span className="rounded-full border px-3 py-1 text-xs capitalize">
                        Deposit: {booking.depositStatus}
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
                        label="Client budget"
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
                    className="flex min-w-64 gap-2"
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

                <div className="mt-6 border-t pt-6">
                  <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
                    <form
                      action={updateBookingCommercials.bind(null, booking.id)}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      <AdminField label="Final quote (ZMW)">
                        <input
                          name="quotedAmountZmw"
                          type="number"
                          min="0"
                          defaultValue={booking.quotedAmountZmw ?? ''}
                          className="admin-input"
                          placeholder="0"
                        />
                      </AdminField>
                      <AdminField label="Deposit amount (ZMW)">
                        <input
                          name="depositAmountZmw"
                          type="number"
                          min="0"
                          defaultValue={booking.depositAmountZmw ?? ''}
                          className="admin-input"
                          placeholder="0"
                        />
                      </AdminField>
                      <AdminField label="Deposit status">
                        <select
                          name="depositStatus"
                          defaultValue={booking.depositStatus}
                          className="admin-input"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="requested">Requested</option>
                          <option value="paid">Paid</option>
                          <option value="waived">Waived</option>
                        </select>
                      </AdminField>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="h-10 w-full rounded-md border bg-background px-4 text-sm font-medium"
                        >
                          Save quote
                        </button>
                      </div>
                      <label className="sm:col-span-2 lg:col-span-4">
                        <span className="mb-2 block text-xs font-medium text-muted-foreground">
                          Internal / quote notes
                        </span>
                        <textarea
                          name="adminNotes"
                          rows={3}
                          defaultValue={booking.adminNotes ?? ''}
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          placeholder="Travel, overtime, inclusions, special terms..."
                        />
                      </label>
                    </form>

                    <div className="flex min-w-56 flex-col gap-2 xl:pt-6">
                      <form action={sendBookingQuote.bind(null, booking.id)}>
                        <button
                          type="submit"
                          disabled={!booking.quotedAmountZmw}
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Mail className="h-4 w-4" />
                          Email quote
                        </button>
                      </form>

                      <Link
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp client
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
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

function AdminField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function buildWhatsAppUrl({
  phone,
  reference,
  clientName,
  quote,
  deposit,
}: {
  phone: string
  reference: string
  clientName: string
  quote: number | null
  deposit: number | null
}) {
  let normalized = phone.replace(/\D/g, '')

  if (normalized.startsWith('0')) {
    normalized = `260${normalized.slice(1)}`
  }

  const quoteLine = quote
    ? ` Your quote is K${quote.toLocaleString()}.`
    : ''
  const depositLine = deposit
    ? ` The deposit to confirm is K${deposit.toLocaleString()}.`
    : ''

  const message = encodeURIComponent(
    `Hello ${clientName}, regarding your photography booking ${reference}.${quoteLine}${depositLine} Please let me know if you would like to proceed or if you have any questions.`,
  )

  return `https://wa.me/${normalized}?text=${message}`
}
