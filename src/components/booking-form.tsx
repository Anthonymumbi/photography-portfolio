'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { photographyServices } from '~/config/booking'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reference: string }
  | { status: 'error'; message: string }

export function BookingForm() {
  const [state, setState] = useState<SubmitState>({ status: 'idle' })
  const [serviceType, setServiceType] = useState(photographyServices[0].value)

  const packageName = useMemo(
    () =>
      photographyServices.find((service) => service.value === serviceType)
        ?.packageName ?? photographyServices[0].packageName,
    [serviceType],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting' })

    const form = event.currentTarget
    const formData = new FormData(form)
    const budgetValue = String(formData.get('budgetZmw') || '').trim()

    const payload = {
      clientName: formData.get('clientName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      serviceType,
      packageName,
      preferredDate: formData.get('preferredDate'),
      preferredTime: formData.get('preferredTime') || undefined,
      city: formData.get('city'),
      location: formData.get('location') || undefined,
      budgetZmw: budgetValue ? Number(budgetValue) : undefined,
      message: formData.get('message') || undefined,
      companyWebsite: formData.get('companyWebsite') || undefined,
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as {
        success?: boolean
        reference?: string
        error?: string
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to submit booking.')
      }

      setState({
        status: 'success',
        reference: result.reference || 'REQUESTED',
      })
      form.reset()
      setServiceType(photographyServices[0].value)
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to submit booking. Please try again.',
      })
    }
  }

  if (state.status === 'success') {
    return (
      <div className="border border-black/10 bg-white p-8 sm:p-10">
        <CheckCircle2 className="h-8 w-8 stroke-[1.4] text-[#8c6b43]" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#8c6b43]">
          Request received
        </p>
        <h2 className="mt-3 font-serif text-4xl tracking-tight">
          Your date is now on our radar.
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-7 text-black/60">
          We&apos;ll review the date, location and coverage you requested before
          confirming availability and the final quote.
        </p>
        <div className="mt-8 inline-flex border border-black/10 bg-[#f4f1eb] px-4 py-3 text-sm">
          Reference&nbsp;<strong>{state.reference}</strong>
        </div>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="mt-8 block text-xs font-semibold uppercase tracking-[0.2em] underline underline-offset-8"
        >
          Make another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-white p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name">
          <input
            name="clientName"
            required
            autoComplete="name"
            className="booking-input"
            placeholder="Full name"
          />
        </Field>

        <Field label="Phone / WhatsApp">
          <input
            name="phone"
            required
            autoComplete="tel"
            className="booking-input"
            placeholder="+260..."
          />
        </Field>

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="booking-input"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Photography service">
          <select
            name="serviceType"
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value as typeof serviceType)}
            className="booking-input"
          >
            {photographyServices.map((service) => (
              <option key={service.value} value={service.value}>
                {service.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Preferred date">
          <input
            name="preferredDate"
            type="date"
            required
            className="booking-input"
          />
        </Field>

        <Field label="Preferred time">
          <select name="preferredTime" className="booking-input" defaultValue="">
            <option value="">Flexible</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Full day">Full day</option>
          </select>
        </Field>

        <Field label="City / town">
          <input
            name="city"
            required
            className="booking-input"
            placeholder="e.g. Kitwe"
          />
        </Field>

        <Field label="Venue / location">
          <input
            name="location"
            className="booking-input"
            placeholder="Venue or area, if known"
          />
        </Field>

        <Field label="Estimated budget (ZMW)">
          <input
            name="budgetZmw"
            type="number"
            min="1"
            step="1"
            className="booking-input"
            placeholder="Optional"
          />
        </Field>

        <div className="hidden" aria-hidden="true">
          <label>
            Company website
            <input
              name="companyWebsite"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
      </div>

      <Field label="Tell us about the shoot" className="mt-6">
        <textarea
          name="message"
          rows={5}
          className="booking-input resize-none"
          placeholder="What are you planning? Tell us about the people, mood, timing and anything important to capture."
        />
      </Field>

      {state.status === 'error' && (
        <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-black/45">
          This is an availability request, not an automatic confirmation. We&apos;ll
          confirm the date and quote before any deposit is due.
        </p>
        <button
          type="submit"
          disabled={state.status === 'submitting'}
          className="inline-flex min-w-48 items-center justify-center gap-3 bg-[#171613] px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === 'submitting' ? (
            <>
              Sending
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Request date
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">
        {label}
      </span>
      {children}
    </label>
  )
}
