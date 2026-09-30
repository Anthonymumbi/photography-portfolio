import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

type BaseBookingEmailProps = {
  reference: string
  clientName: string
  packageName: string
  preferredDate: string
  preferredTime?: string | null
  city: string
}

type QuoteEmailProps = BaseBookingEmailProps & {
  quotedAmountZmw: number
  depositAmountZmw: number
  notes?: string | null
}

export function BookingRequestEmail(props: BaseBookingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Photography request received — {props.reference}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f1eb] font-sans text-[#171613]">
          <Container className="mx-auto my-10 max-w-xl bg-white p-8">
            <Text className="text-xs uppercase tracking-widest text-[#8c6b43]">
              Request received
            </Text>
            <Heading className="font-serif text-3xl font-normal">
              Thank you, {props.clientName}.
            </Heading>
            <Text className="text-sm leading-6 text-neutral-600">
              Your photography request has been received. We&apos;ll review the
              date, location and coverage before confirming availability and the
              final quote.
            </Text>
            <Section className="my-6 bg-[#f4f1eb] p-5">
              <Text className="m-0 text-sm"><strong>Reference:</strong> {props.reference}</Text>
              <Text className="mb-0 text-sm"><strong>Package:</strong> {props.packageName}</Text>
              <Text className="mb-0 text-sm"><strong>Date:</strong> {props.preferredDate}{props.preferredTime ? ` • ${props.preferredTime}` : ''}</Text>
              <Text className="mb-0 text-sm"><strong>Location:</strong> {props.city}</Text>
            </Section>
            <Hr className="border-neutral-200" />
            <Text className="text-xs leading-5 text-neutral-500">
              This message confirms the enquiry only. Your date becomes confirmed
              after availability, quote and deposit arrangements are agreed.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function BookingQuoteEmail(props: QuoteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your photography quote — {props.reference}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f1eb] font-sans text-[#171613]">
          <Container className="mx-auto my-10 max-w-xl bg-white p-8">
            <Text className="text-xs uppercase tracking-widest text-[#8c6b43]">
              Photography quote
            </Text>
            <Heading className="font-serif text-3xl font-normal">
              Your session quote is ready.
            </Heading>
            <Text className="text-sm leading-6 text-neutral-600">
              Hi {props.clientName}, here is the quote for your requested
              photography session.
            </Text>
            <Section className="my-6 bg-[#171613] p-6 text-white">
              <Text className="m-0 text-xs uppercase tracking-widest text-neutral-300">
                Total quote
              </Text>
              <Text className="my-2 text-3xl font-semibold">
                K{props.quotedAmountZmw.toLocaleString()}
              </Text>
              <Text className="mb-0 text-sm text-neutral-300">
                Deposit to confirm: K{props.depositAmountZmw.toLocaleString()}
              </Text>
            </Section>
            <Section className="my-6 bg-[#f4f1eb] p-5">
              <Text className="m-0 text-sm"><strong>Reference:</strong> {props.reference}</Text>
              <Text className="mb-0 text-sm"><strong>Package:</strong> {props.packageName}</Text>
              <Text className="mb-0 text-sm"><strong>Date:</strong> {props.preferredDate}{props.preferredTime ? ` • ${props.preferredTime}` : ''}</Text>
              <Text className="mb-0 text-sm"><strong>Location:</strong> {props.city}</Text>
            </Section>
            {props.notes && (
              <Text className="text-sm leading-6 text-neutral-600">{props.notes}</Text>
            )}
            <Hr className="border-neutral-200" />
            <Text className="text-xs leading-5 text-neutral-500">
              Reply to this email if you need any adjustment before confirming
              the booking.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function bookingRequestEmailText(props: BaseBookingEmailProps) {
  return `Photography request received

Hi ${props.clientName},

We have received your photography request.

Reference: ${props.reference}
Package: ${props.packageName}
Date: ${props.preferredDate}${props.preferredTime ? ` • ${props.preferredTime}` : ''}
Location: ${props.city}

We will review availability and send your final quote before the booking is confirmed.`
}

export function bookingQuoteEmailText(props: QuoteEmailProps) {
  return `Photography quote — ${props.reference}

Hi ${props.clientName},

Your photography quote is ready.

Package: ${props.packageName}
Date: ${props.preferredDate}${props.preferredTime ? ` • ${props.preferredTime}` : ''}
Location: ${props.city}
Total quote: K${props.quotedAmountZmw.toLocaleString()}
Deposit to confirm: K${props.depositAmountZmw.toLocaleString()}

${props.notes || ''}

Reply to this email if you need any adjustment before confirming the booking.`
}
