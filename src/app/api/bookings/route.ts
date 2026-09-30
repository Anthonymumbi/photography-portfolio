import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '~/server/db'
import { bookings } from '~/server/db/schema'
import { photographyServices } from '~/config/booking'

const serviceValues = photographyServices.map((service) => service.value)

const bookingSchema = z.object({
  clientName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(50),
  serviceType: z.string().refine((value) => (serviceValues as readonly string[]).includes(value)),
  packageName: z.string().trim().min(2).max(100),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().trim().max(30).optional(),
  city: z.string().trim().min(2).max(100),
  location: z.string().trim().max(255).optional(),
  budgetZmw: z.number().int().positive().max(10000000).optional(),
  message: z.string().trim().max(2500).optional(),
  companyWebsite: z.string().max(200).optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = bookingSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please check the booking details and try again.' },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Honeypot: silently accept bot submissions without storing them.
    if (data.companyWebsite) {
      return NextResponse.json({ success: true, reference: 'REQUESTED' })
    }

    const selectedService = photographyServices.find(
      (service) => service.value === data.serviceType,
    )

    if (!selectedService) {
      return NextResponse.json(
        { success: false, error: 'Invalid photography service.' },
        { status: 400 },
      )
    }

    const [booking] = await db
      .insert(bookings)
      .values({
        clientName: data.clientName,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        packageName: selectedService.packageName,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime || null,
        city: data.city,
        location: data.location || null,
        budgetZmw: data.budgetZmw || null,
        message: data.message || null,
      })
      .returning({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
      })

    if (!booking) {
      throw new Error('Booking insert returned no record')
    }

    return NextResponse.json({
      success: true,
      reference: `PH-${String(booking.bookingNumber).padStart(5, '0')}`,
    })
  } catch (error) {
    console.error('[Booking API] Failed to create booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'We could not submit your booking right now. Please try again.',
      },
      { status: 500 },
    )
  }
}
