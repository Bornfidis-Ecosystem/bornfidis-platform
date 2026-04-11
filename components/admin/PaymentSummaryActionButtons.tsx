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
      <p className="text-xs text-stone-500">
        Add a saved quote and client email to enable email actions. Add a phone number for WhatsApp.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Quick actions</p>
      <div className="flex flex-wrap gap-2">
        {showSendQuote && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run('Quote email sent', () => sendQuoteEmail(p.bookingId))
            }
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            Send quote email
          </button>
        )}
        {showSendDeposit && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run('Deposit request sent', () => sendDepositRequest(p.bookingId))
            }
            className="inline-flex items-center justify-center rounded-lg bg-[#1A3C34] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
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
            className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-50"
          >
            Resend balance link
          </button>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            WhatsApp reminder
          </a>
        )}
      </div>
    </div>
  )
}
