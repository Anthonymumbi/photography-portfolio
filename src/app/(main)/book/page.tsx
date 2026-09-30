import type { Metadata } from 'next'
import { ArrowDownRight, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { BookingForm } from '~/components/booking-form'
import { photographyServices } from '~/config/booking'

export const metadata: Metadata = {
  title: 'Book a Photography Session',
  description:
    'Request a photography date for weddings, portraits, events or brand work.',
}

export default function BookPage() {
  return (
    <main className="bg-[#f4f1eb] text-[#161512]">
      <section className="bg-[#171613] px-6 pb-20 pt-36 text-white sm:px-10 lg:px-12 lg:pb-28 lg:pt-44">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b889]">
            Book a session
          </p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <h1 className="max-w-4xl font-serif text-6xl leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Start with the date. We&apos;ll shape the story together.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Tell us what you&apos;re planning and when. We&apos;ll check availability,
              refine the coverage with you and send a clear quote in ZMW before
              anything is confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
        <div className="mb-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {photographyServices.map((service, index) => (
            <div
              key={service.value}
              className="min-h-64 border border-black/10 bg-[#ebe6dd] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.22em] text-black/35">
                  0{index + 1}
                </span>
                <ArrowDownRight className="h-4 w-4 stroke-[1.4]" />
              </div>
              <h2 className="mt-16 font-serif text-2xl">{service.title}</h2>
              <p className="mt-4 text-sm leading-6 text-black/55">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <aside className="lg:pr-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8c6b43]">
              What happens next
            </p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight">
              Simple from enquiry to gallery.
            </h2>

            <div className="mt-10 space-y-7">
              {[
                [Clock3, 'Availability first', 'We check your preferred date before confirming anything.'],
                [MapPin, 'Built around your location', 'Travel, venue and timing are considered in the final quote.'],
                [ShieldCheck, 'No surprise deposit', 'The quote and deposit requirement are agreed before your booking is confirmed.'],
              ].map(([Icon, title, description]) => {
                const FeatureIcon = Icon as typeof Clock3
                return (
                  <div key={String(title)} className="flex gap-4">
                    <FeatureIcon className="mt-1 h-5 w-5 shrink-0 stroke-[1.4]" />
                    <div>
                      <h3 className="font-medium">{String(title)}</h3>
                      <p className="mt-1 text-sm leading-6 text-black/50">
                        {String(description)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          <BookingForm />
        </div>
      </section>
    </main>
  )
}
