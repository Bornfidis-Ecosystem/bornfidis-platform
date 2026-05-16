'use client'

import { useTransition } from 'react'
import toast from 'react-hot-toast'
import { sendDepositRequest, sendQuoteEmail, resendBalanceLink } from '@/app/admin/bookings/actions'
import { buildReminderText, type ReminderType } from '@/lib/reminders/buildReminderText'

type Props = {
  bookingId: string
  clientName: string
  eventDate: string
  email?: string | null
  phone?: string | null
  hasSavedQuote: boolean
  depositPaid: boolean
  balancePaid: boolean
  hasBalanceDue: boolean
}

function waDigits(phone: string | undefined | null): string | null {
  const raw = (phone || '').replace(/\D/g, '')
  return raw.length >= 10 ? raw : null
}

function reminderTypeForBooking(p: Props): ReminderType {
  if (!p.depositPaid) return 'deposit'
  if (!p.balancePaid && p.hasBalanceDue) return 'final_balance'
  return 'prep'
}

const btn =
  'inline-flex items-center justify-center rounded-none border px-3 py-2 font-culinary-sans text-label-caps transition refined disabled:opacity-50'

export default function PaymentSummaryActionButtons(p: Props) {
  const [pending, startTransition] = useTransition()
  const hasEmail = !!p.email?.trim()
  const digits = waDigits(p.phone)
  const reminderType = reminderTypeForBooking(p)
  const waBody = buildReminderText({
    type: reminderType,
    name: p.clientName,
    eventDate: p.eventDate,
  }).whatsapp
  const whatsappUrl = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(waBody)}` : null

  const showSendQuote = p.hasSavedQuote && hasEmail
  const showSendDeposit = p.hasSavedQuote && !p.depositPaid && hasEmail
  const showResendBalance = p.depositPaid && !p.balancePaid && p.hasBalanceDue

  function run(label: string, fn: () => Promise<{ success: boolean; error?: string; url?: string }>) {
    startTransition(async () => {
      const res = await fn()
      if (res.success) {
        toast.success(label)
        if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
      } else {
        toast.error(res.error || 'Something went wrong')
      }
    })
  }

  if (!showSendQuote && !showSendDeposit && !showResendBalance && !whatsappUrl) {
    return (
      <p className="font-culinary-sans text-body-md text-culinary-text-muted">
        Add a saved quote and client email to enable email actions. Add a phone number for WhatsApp.
      </p>
    )
  }

  return (
    <div className="mt-stack-md space-y-stack-sm">
      <p className="font-culinary-sans text-label-caps text-culinary-text-muted">Quick actions</p>
      <div className="flex flex-wrap gap-2">
        {showSendQuote && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('Quote email sent', () => sendQuoteEmail(p.bookingId))}
            className={`${btn} border-culinary-outline bg-culinary-bone text-culinary-navy hover:bg-culinary-surface-high`}
          >
            Send quote email
          </button>
        )}
        {showSendDeposit && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run('Deposit request sent', () => sendDepositRequest(p.bookingId))}
            className={`${btn} border-culinary-navy bg-culinary-navy text-culinary-on-navy hover:opacity-90`}
          >
            Send deposit request
          </button>
        )}
        {showResendBalance && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run('Balance checkout opened', async () => {
                const out = await resendBalanceLink(p.bookingId)
                return { ...out, url: out.url }
              })
            }
            className={`${btn} border-culinary-gold-line bg-culinary-bone text-culinary-navy hover:bg-culinary-surface-high`}
          >
            Resend balance link
          </button>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} border-culinary-forest/50 bg-culinary-bone text-culinary-forest hover:bg-culinary-surface-low`}
          >
            WhatsApp reminder
          </a>
        )}
      </div>
    </div>
  )
}
