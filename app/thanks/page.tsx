import { SuccessAlert } from '@/components/ui/SuccessAlert'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { ThanksActionButtons } from '@/components/thanks/ThanksActionButtons'
import { ThanksMessage } from '@/components/thanks/ThanksMessage'
import { ThanksPageShell } from '@/components/thanks/ThanksPageShell'
import { bookBody } from '@/components/booking/book-culinary-classes'

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

const alertClass =
  'mb-6 !rounded-none !border-[#ffbc00]/35 !bg-[#faf6f0] !text-[#1a1a1a] [&_svg]:text-[#002747]'

const refClass = 'text-center font-sans text-sm text-[#1a1a1a]/60'
const monoRef = 'font-mono font-medium text-[#1a1a1a]'

export default async function ThanksPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams
  const type = (first(params.type) || '').toLowerCase()
  const checkout = (first(params.checkout) || '').toLowerCase()
  const sessionId = first(params.session_id)
  const bookingId = first(params.booking_id)

  if (type === 'deposit') {
    return (
      <ThanksPageShell>
        <SuccessAlert
          title="Your booking is confirmed"
          message="Your date is now secured. We'll be in touch with final details as your experience approaches."
          className={alertClass}
        />
        {bookingId ? (
          <p className={refClass}>
            Reference: <span className={monoRef}>{bookingId.slice(0, 8)}…</span>
          </p>
        ) : null}
        {sessionId ? (
          <p className="mb-8 break-all text-center font-mono text-xs text-[#1a1a1a]/45">
            Session: {sessionId}
          </p>
        ) : null}
        <ThanksActionButtons />
      </ThanksPageShell>
    )
  }

  if (type === 'balance') {
    return (
      <ThanksPageShell>
        <SuccessAlert
          title="Your experience is fully paid"
          message="Everything is in place. We look forward to serving you."
          className={alertClass}
        />
        {bookingId ? (
          <p className={refClass}>
            Reference: <span className={monoRef}>{bookingId.slice(0, 8)}…</span>
          </p>
        ) : null}
        {sessionId ? (
          <p className="mb-8 break-all text-center font-mono text-xs text-[#1a1a1a]/45">
            Session: {sessionId}
          </p>
        ) : null}
        <ThanksActionButtons />
      </ThanksPageShell>
    )
  }

  if (checkout === 'consulting' || type === 'consulting') {
    return (
      <ThanksPageShell>
        <div className="text-center">
          <SuccessAlert
            title="Thank you"
            message="Your consulting session payment went through. We will reach out shortly with next steps."
            className={alertClass}
          />
          {sessionId ? (
            <p className="mb-8 break-all font-mono text-xs text-[#1a1a1a]/45">Session: {sessionId}</p>
          ) : null}
          <PrimaryButton theme="culinary" href="/">
            Back to home
          </PrimaryButton>
        </div>
      </ThanksPageShell>
    )
  }

  if (type === 'inquiry' || type === 'booking') {
    return (
      <ThanksPageShell>
        <SuccessAlert
          title="Your inquiry has been received"
          message="Thank you for reaching out. We're reviewing your event details and will follow up shortly with your custom proposal."
          className={alertClass}
        />
        {bookingId ? (
          <p className={`${refClass} mt-4`}>
            Reference: <span className={monoRef}>{bookingId.slice(0, 8)}…</span>
          </p>
        ) : null}
        <div className="mt-8 border-t border-[#ffbc00]/25 pt-8">
          <ThanksMessage title="What happens next">
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>We review your request and availability</li>
              <li>You receive a tailored quote — typically within 24 hours</li>
              <li>When you are ready, a deposit secures your date</li>
            </ol>
          </ThanksMessage>
        </div>
        <p className={`${bookBody} mt-8 text-center text-sm`}>
          Questions?{' '}
          <a
            href="mailto:brian@bornfidis.com"
            className="font-semibold text-[#ffbc00] no-underline hover:text-[#1a1a1a]"
          >
            brian@bornfidis.com
          </a>
        </p>
        <div className="mt-8">
          <ThanksActionButtons />
        </div>
      </ThanksPageShell>
    )
  }

  return (
    <ThanksPageShell>
      <SuccessAlert
        title="Thank you"
        message="We've received your message. We'll be in touch within 48 hours."
        className={alertClass}
      />

      <div className="mt-8 max-w-none">
        <h2 className="font-display text-2xl font-normal text-[#1a1a1a]">What happens next?</h2>
        <ol className={`${bookBody} mt-4 space-y-3 text-sm`}>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#ffbc00]">1.</span>
            <span>We&apos;ll review your request and check availability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#ffbc00]">2.</span>
            <span>You&apos;ll receive a detailed quote within 48 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#ffbc00]">3.</span>
            <span>Once you approve, we&apos;ll send a deposit invoice to secure your date</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-[#ffbc00]">4.</span>
            <span>
              When your chef is assigned, you&apos;ll see their profile and verified credentials in your
              booking portal.
            </span>
          </li>
        </ol>
      </div>

      <div className="mt-8 border-t border-[#ffbc00]/25 pt-8">
        <p className={`${bookBody} text-center text-sm`}>
          Questions?{' '}
          <a
            href="mailto:brian@bornfidis.com"
            className="font-semibold text-[#ffbc00] no-underline hover:text-[#1a1a1a]"
          >
            brian@bornfidis.com
          </a>
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <PrimaryButton theme="culinary" href="/">
            Back to home
          </PrimaryButton>
          <SecondaryButton theme="culinary" href="/menu">
            View sample menus
          </SecondaryButton>
          <SecondaryButton theme="culinary" href="/story">
            Read our story
          </SecondaryButton>
        </div>
      </div>
    </ThanksPageShell>
  )
}
