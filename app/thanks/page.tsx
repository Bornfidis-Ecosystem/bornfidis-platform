import Link from 'next/link'
import { SuccessAlert } from '@/components/ui/SuccessAlert'
import { ThanksActionButtons } from '@/components/thanks/ThanksActionButtons'
import { ThanksMessage } from '@/components/thanks/ThanksMessage'

type Search = {
  type?: string | string[]
  checkout?: string | string[]
  session_id?: string | string[]
  booking_id?: string | string[]
}

function first(param?: string | string[]): string | undefined {
  if (Array.isArray(param)) return param[0]
  return param
}

const shellClass =
  'min-h-screen bg-gradient-to-b from-cream/30 via-stone-50 to-cream/40 flex items-center justify-center px-4 py-16'

const cardClass =
  'w-full rounded-3xl border border-rule/50 bg-white/95 p-8 shadow-2xl shadow-midnight/[0.08] ring-1 ring-white/80 md:p-10'

const btnPrimaryClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-midnight shadow-md transition hover:bg-brass'

const btnGhostClass =
  'inline-flex min-h-[48px] items-center justify-center rounded-full border border-midnight/15 px-8 py-3.5 text-sm font-medium text-midnight transition hover:bg-midnight hover:text-cream'

export default async function ThanksPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams
  const type = (first(params.type) || '').toLowerCase()
  const checkout = (first(params.checkout) || '').toLowerCase()
  const sessionId = first(params.session_id)
  const bookingId = first(params.booking_id)

  if (type === 'deposit') {
    return (
      <div className={shellClass}>
        <div className={`${cardClass} max-w-lg`}>
          <SuccessAlert
            title="Your Booking Is Confirmed"
            message="Your date is now secured. We'll be in touch with final details as your experience approaches."
            className="mb-6 !border-gold/25 !bg-cream/40 !text-forestDark [&_svg]:text-forestDark"
          />
          {bookingId ? (
            <p className="mb-4 text-center text-sm text-muted">
              Reference:{' '}
              <span className="font-mono font-medium text-midnight">{bookingId.slice(0, 8)}…</span>
            </p>
          ) : null}
          {sessionId ? (
            <p className="mb-8 text-center text-xs font-mono text-faint break-all">Session: {sessionId}</p>
          ) : null}
          <ThanksActionButtons />
        </div>
      </div>
    )
  }

  if (type === 'balance') {
    return (
      <div className={shellClass}>
        <div className={`${cardClass} max-w-lg`}>
          <SuccessAlert
            title="Your Experience Is Fully Paid"
            message="Everything is in place. We look forward to serving you."
            className="mb-6 !border-gold/25 !bg-cream/40 !text-forestDark [&_svg]:text-forestDark"
          />
          {bookingId ? (
            <p className="mb-4 text-center text-sm text-muted">
              Reference:{' '}
              <span className="font-mono font-medium text-midnight">{bookingId.slice(0, 8)}…</span>
            </p>
          ) : null}
          {sessionId ? (
            <p className="mb-8 text-center text-xs font-mono text-faint break-all">Session: {sessionId}</p>
          ) : null}
          <ThanksActionButtons />
        </div>
      </div>
    )
  }

  if (checkout === 'consulting' || type === 'consulting') {
    return (
      <div className={shellClass}>
        <div className={`${cardClass} max-w-lg text-center`}>
          <SuccessAlert
            title="Thank you"
            message="Your consulting session payment went through. We will reach out shortly with next steps."
            className="mb-6 !border-gold/25 !bg-cream/40 !text-forestDark [&_svg]:text-forestDark"
          />
          {sessionId ? (
            <p className="mb-8 text-center text-xs font-mono text-faint break-all">Session: {sessionId}</p>
          ) : null}
          <Link href="/" className={btnPrimaryClass}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (type === 'inquiry' || type === 'booking') {
    return (
      <div className={shellClass}>
        <div className={`${cardClass} max-w-2xl`}>
          <div className="mb-6 flex justify-center">
            <SuccessAlert
              title="Your Inquiry Has Been Received"
            message="Thank you for reaching out to Bornfidis Provisions. We're reviewing your event details and will follow up shortly with your custom proposal."
              className="!w-full !border-gold/25 !bg-cream/40 !text-forestDark [&_svg]:text-forestDark"
            />
          </div>
          {bookingId ? (
            <p className="mb-6 text-center text-sm text-muted">
              Reference:{' '}
              <span className="font-mono font-medium text-midnight">{bookingId.slice(0, 8)}…</span>
            </p>
          ) : null}
          <div className="mb-8 border-t border-rule/50 pt-8 text-left">
            <ThanksMessage title="What happens next">
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-forestDark/90">
                <li>We review your request and availability</li>
                <li>You receive a tailored quote — typically within 24 hours</li>
                <li>When you are ready, a deposit secures your date</li>
              </ol>
            </ThanksMessage>
          </div>
          <p className="mb-6 text-center text-sm text-muted">
            Questions?{' '}
            <a
              href="mailto:brian@bornfidis.com"
              className="font-semibold text-midnight underline decoration-gold/40 underline-offset-2 hover:text-gold"
            >
              brian@bornfidis.com
            </a>
          </p>
          <ThanksActionButtons />
        </div>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <div className="container mx-auto max-w-2xl px-4 text-center">
        <div className={cardClass}>
          <SuccessAlert
            title="Thank you"
            message="We've received your message. We'll be in touch within 48 hours."
            className="mb-6 !border-gold/25 !bg-cream/40 !text-forestDark [&_svg]:text-forestDark"
          />

          <div className="mb-8 max-w-none text-left">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-midnight">What Happens Next?</h2>
            <ol className="mt-4 space-y-3 text-forestDark/90">
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-gold">1.</span>
                <span>We&apos;ll review your request and check availability</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-gold">2.</span>
                <span>You&apos;ll receive a detailed quote within 48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-gold">3.</span>
                <span>Once you approve, we&apos;ll send a deposit invoice to secure your date</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-gold">4.</span>
                <span>
                  When your chef is assigned, you&apos;ll see their profile and verified credentials in your booking
                  portal.
                </span>
              </li>
            </ol>
          </div>

          <div className="border-t border-rule/50 pt-8">
            <p className="mb-6 text-muted">
              Questions? Reach us at{' '}
              <a
                href="mailto:brian@bornfidis.com"
                className="font-semibold text-midnight underline decoration-gold/40 underline-offset-2 hover:text-gold"
              >
                brian@bornfidis.com
              </a>
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/" className={btnPrimaryClass}>
                Back to Home
              </Link>
              <Link href="/menu" className={btnGhostClass}>
                View Sample Menus
              </Link>
              <Link href="/story" className={btnGhostClass}>
                Read Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
