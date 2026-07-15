'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import toast from 'react-hot-toast'
import {
  addBookingActivity,
  markBookingConfirmedSilently,
  markTestimonialRequested,
  saveTestimonialReceived,
  sendInquiryReminderForBooking,
  setTestimonialApproved,
  updateBooking,
  updateBookingQuote,
} from '../actions'
import { createStripeDepositLink } from '../quote-actions'
import { sendBookingDepositRequestEmail, sendBookingQuoteOfferEmail } from '../outreach-email-actions'
import { BookingInquiry, BookingStatus, QuoteLineItem } from '@/types/booking'
import { BOOKING_PIPELINE_STATUS_LABEL, BOOKING_PIPELINE_STATUSES } from '@/lib/booking-pipeline-status'
import { dollarsToCents, centsToDollars, formatUSD, parseDollarsToCents } from '@/lib/money'
import { isStripeConfigured } from '@/lib/stripe'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import { StatusWorkflow } from '@/components/booking/StatusWorkflow'
import { AdminBookingNotesCard } from '@/components/admin/booking-detail/AdminBookingNotesCard'
import { AdminBookingChecklistCard } from '@/components/admin/booking-detail/AdminBookingChecklistCard'
import { AdminBookingTimelineCard } from '@/components/admin/booking-detail/AdminBookingTimelineCard'
import { CulinaryCard } from '@/components/culinary-os'
import type { BookingActivity } from '@/types/booking-activity'
import type { QuoteDepositTestimonialSnippet } from '@/lib/homepage-testimonials'

interface BookingDetailClientProps {
  booking: BookingInquiry
  activities: BookingActivity[]
  quoteEmailTestimonial?: QuoteDepositTestimonialSnippet | null
}

/**
 * Client component for booking detail page
 * Handles status updates and admin notes with real-time feedback
 */
export default function BookingDetailClient({
  booking,
  activities,
  quoteEmailTestimonial = null,
}: BookingDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<BookingStatus>(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '')
  const [isSaving, setIsSaving] = useState(false)

  const [bookingActivities, setBookingActivities] = useState<BookingActivity[]>(activities)

  // Portal token state
  const [portalToken, setPortalToken] = useState<string | null>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [isTokenRevoked, setIsTokenRevoked] = useState(false)
  const [isCreatingStripeDepositLink, setIsCreatingStripeDepositLink] = useState(false)
  const [isSendingQuoteEmail, setIsSendingQuoteEmail] = useState(false)
  const [isSendingDepositRequestEmail, setIsSendingDepositRequestEmail] = useState(false)
  const [notifyOnManualConfirm, setNotifyOnManualConfirm] = useState(true)
  const [isMarkingConfirmedNoDeposit, setIsMarkingConfirmedNoDeposit] = useState(false)
  const [isSendingInquiryReminder, setIsSendingInquiryReminder] = useState(false)
  const [didPromptDepositPaid, setDidPromptDepositPaid] = useState(false)

  useEffect(() => {
    setBookingActivities(activities)
  }, [activities])

  const [internalNote, setInternalNote] = useState('')
  const [isAddingInternalNote, setIsAddingInternalNote] = useState(false)

  const [testimonialText, setTestimonialText] = useState(booking.testimonial_text || '')
  const [testimonialApprovedLocal, setTestimonialApprovedLocal] = useState(booking.testimonial_approved ?? false)
  const [isTestimonialBusy, setIsTestimonialBusy] = useState(false)

  useEffect(() => {
    setTestimonialText(booking.testimonial_text || '')
    setTestimonialApprovedLocal(booking.testimonial_approved ?? false)
  }, [booking.testimonial_text, booking.testimonial_approved])

  type StatusSuggestionPromptVariant = 'quoted' | 'booked' | 'confirmed'
  const [statusSuggestionPrompt, setStatusSuggestionPrompt] = useState<StatusSuggestionPromptVariant | null>(null)
  const [isStatusSuggestionBusy, setIsStatusSuggestionBusy] = useState(false)

  // Quote & Payment state
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(() => {
    // Parse quote_line_items from JSONB if exists
    if (booking.quote_line_items && Array.isArray(booking.quote_line_items)) {
      return booking.quote_line_items
    }
    if (booking.quote_line_items && typeof booking.quote_line_items === 'string') {
      try {
        return JSON.parse(booking.quote_line_items)
      } catch {
        return []
      }
    }
    return []
  })
  const [quoteNotes, setQuoteNotes] = useState(booking.quote_notes || '')
  const [taxDollars, setTaxDollars] = useState(booking.quote_tax_cents ? centsToDollars(booking.quote_tax_cents).toFixed(2) : '')
  const [serviceFeeDollars, setServiceFeeDollars] = useState(booking.quote_service_fee_cents ? centsToDollars(booking.quote_service_fee_cents).toFixed(2) : '')
  const [depositPercentage, setDepositPercentage] = useState(booking.deposit_percentage || 30)
  const [isSavingQuote, setIsSavingQuote] = useState(false)
  const [quoteExpanded, setQuoteExpanded] = useState(false)
  const [regionCode, setRegionCode] = useState(booking.region_code || '')
  const [regionOptions, setRegionOptions] = useState<Array<{ regionCode: string; name: string | null }>>([])
  const [previewJobCents, setPreviewJobCents] = useState<number | null>(null)
  const [teamExpanded, setTeamExpanded] = useState(false)
  const [teamNotes, setTeamNotes] = useState('')
  const [assignedChef, setAssignedChef] = useState<{ id: string; name: string } | null>(null)
  const [assignedFarmers, setAssignedFarmers] = useState<any[]>([])
  const [activeChefs, setActiveChefs] = useState<Array<{ id: string; name: string; specialties?: string[]; featured?: boolean; tierLabel?: string }>>([])
  const [availableFarmers, setAvailableFarmers] = useState<Array<{ id: string; name: string; crops?: string[] }>>([])
  const [selectedChefId, setSelectedChefId] = useState('')
  const [overrideAvailability, setOverrideAvailability] = useState(false)
  const [teamSaving, setTeamSaving] = useState(false)
  const [recommendedChefs, setRecommendedChefs] = useState<Array<{ id: string; name: string; tierLabel: string; lastRating: number | null; availabilityStatus: string }>>([])
  const [recommendedWarning, setRecommendedWarning] = useState<string | null>(null)
  const [recommendedLoading, setRecommendedLoading] = useState(false)

  // Load collapse state from localStorage (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedQuote = localStorage.getItem('bookingDetail_quoteExpanded')
    const savedTeam = localStorage.getItem('bookingDetail_teamExpanded')
    if (savedQuote !== null) setQuoteExpanded(savedQuote === 'true')
    if (savedTeam !== null) setTeamExpanded(savedTeam === 'true')
  }, [])

  // Persist quote collapse state
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('bookingDetail_quoteExpanded', String(quoteExpanded))
  }, [quoteExpanded])

  // Persist team collapse state
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('bookingDetail_teamExpanded', String(teamExpanded))
  }, [teamExpanded])

  // Check for payment success messages
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      toast.success('Payment successful!')
      router.replace(`/admin/bookings/${booking.id}`, { scroll: false })
    } else if (payment === 'cancel') {
      toast.error('Payment canceled.')
      router.replace(`/admin/bookings/${booking.id}`, { scroll: false })
    }
  }, [searchParams, router, booking.id])

  // Load portal token on mount
  useEffect(() => {
    const token = (booking as any).customer_portal_token
    const revoked = (booking as any).customer_portal_token_revoked_at
    if (token) {
      setPortalToken(token)
      // Use window.location.origin for client-side URL construction
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      setPortalUrl(`${siteUrl}/portal/${token}`)
    }
    if (revoked) {
      setIsTokenRevoked(true)
    }
  }, [booking])

  // Fetch team assignment summary for header (booking-chef, booking-farmers)
  useEffect(() => {
    fetch(`/api/admin/bookings/${booking.id}/booking-chef`)
      .then((res) => (res.ok ? res.json() : { success: false, booking_chef: null }))
      .then((data) => {
        if (data?.success && data.booking_chef?.chef) {
          setAssignedChef({ id: data.booking_chef.chef.id, name: data.booking_chef.chef.name })
          setSelectedChefId(data.booking_chef.chef_id)
        }
      })
      .catch(() => {})
    fetch(`/api/admin/bookings/${booking.id}/booking-farmers`)
      .then((res) => (res.ok ? res.json() : { success: false, booking_farmers: [] }))
      .then((data) => {
        if (data?.success && Array.isArray(data.booking_farmers)) {
          setAssignedFarmers(data.booking_farmers)
        }
      })
      .catch(() => {})
  }, [booking.id])

  // Auto-expand Team Assignment when booking status is booked or later
  useEffect(() => {
    const statusUpper = String(booking.status || '').toUpperCase()
    if (['BOOKED', 'CONFIRMED', 'COMPLETED'].includes(statusUpper)) {
      setTeamExpanded(true)
    }
  }, [booking.status])

  // Fetch chefs and farmers when Team Assignment is expanded
  useEffect(() => {
    if (!teamExpanded) return
    fetch('/api/admin/chefs/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.chefs) {
          setActiveChefs(data.chefs.map((c: any) => ({ id: c.id, name: c.name, specialties: c.specialties, featured: c.featured, tierLabel: c.tierLabel })))
        }
      })
      .catch(() => {})
    setRecommendedLoading(true)
    fetch(`/api/admin/bookings/${booking.id}/recommended-chefs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.recommendations)) {
          setRecommendedChefs(data.recommendations.map((r: any) => ({
            id: r.id,
            name: r.name,
            tierLabel: r.tierLabel || 'Standard Chef',
            lastRating: r.lastRating ?? null,
            availabilityStatus: r.availabilityStatus || 'Available',
          })))
          setRecommendedWarning(data.warning ?? null)
        }
      })
      .catch(() => {})
      .finally(() => setRecommendedLoading(false))
    fetch('/api/admin/farmers/active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.farmers) {
          setAvailableFarmers(data.farmers.map((f: any) => ({ id: f.id, name: f.name, crops: f.crops })))
        }
      })
      .catch(() => {})
  }, [teamExpanded])

  const handleGeneratePortalToken = async (force: boolean = false) => {
    setIsGeneratingToken(true)
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/portal-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      })
      const data = await response.json()

      if (data.success) {
        setPortalToken(data.token)
        setPortalUrl(data.portal_url)
        setIsTokenRevoked(false)
        toast.success(force ? 'Portal link rotated successfully!' : 'Portal link generated successfully!')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to generate portal link')
      }
    } catch (error) {
      console.error('Error generating portal token:', error)
      toast.error('Failed to generate portal link')
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const handleCopyPortalUrl = () => {
    if (portalUrl) {
      navigator.clipboard.writeText(portalUrl)
      toast.success('Portal link copied to clipboard!')
    } else {
      toast.error('Generate a portal link first in Quote & Payment section.')
    }
  }

  const copyTextToClipboard = async (text: string, label?: string) => {
    if (!text) return false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        toast.success(label ? `${label} copied (${time})` : `Copied to clipboard (${time})`)
        return true
      }

      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      toast.success(label ? `${label} copied (${time})` : `Copied to clipboard (${time})`)
      return true
    } catch {
      toast.error('Copy failed. Please try again.')
      return false
    }
  }

  const logBookingActivity = async (payload: { type: string; title: string; description?: string }) => {
    try {
      const res = await addBookingActivity(booking.id, payload)
      if (res.success) {
        setBookingActivities((prev) => [res.activity, ...prev])
        return res.activity
      }
      return null
    } catch (e) {
      console.error('Failed to add booking activity:', e)
      return null
    }
  }

  const formatEventDateLong = (dateString: string | undefined) => {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
  }

  const hasSavedQuote = (booking.quote_total_cents ?? 0) > 0 && (booking.quote_line_items?.length ?? 0) > 0

  // Use saved quote amounts from the booking record (these are what Caryll will copy after quote is saved).
  // Avoid depending on in-progress UI totals because those are calculated later in this component.
  const savedQuoteTotalCents = booking.quote_total_cents ?? 0
  const savedDepositPercent = booking.deposit_percentage ?? depositPercentage
  const savedDepositCents = booking.deposit_amount_cents ?? booking.quote_deposit_cents ?? 0
  const savedBalanceCents = booking.balance_amount_cents ?? Math.max(savedQuoteTotalCents - savedDepositCents, 0)

  const ensureStripeDepositUrl = async (): Promise<string | null> => {
    if (booking.stripe_payment_link_url) return booking.stripe_payment_link_url
    if (isCreatingStripeDepositLink) return null
    if (!hasSavedQuote) {
      toast.error('Save the quote before generating a deposit link.')
      return null
    }

    setIsCreatingStripeDepositLink(true)
    try {
      const res = await createStripeDepositLink(booking.id)
      if (!res.success || !res.url) {
        toast.error(res.error || 'Could not generate the deposit link.')
        return null
      }
      toast.success('Deposit link generated')
      router.refresh()
      return res.url
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate the deposit link.')
      return null
    } finally {
      setIsCreatingStripeDepositLink(false)
    }
  }

  const buildDepositRequestWhatsApp = (stripeUrl: string | null) => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentLine = stripeUrl ? `Pay your deposit here (Stripe):\n${stripeUrl}` : 'Pay your deposit using your deposit link (Stripe) provided by Bornfidis.'

    const lines = [
      `Hello ${booking.name},`,
      ``,
      `Thanks for your inquiry. Here is your Bornfidis Provisions quote summary:`,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      `Total estimate: ${formatUSD(savedQuoteTotalCents)}`,
      `Deposit requested (${savedDepositPercent}%): ${formatUSD(savedDepositCents)}`,
      ``,
      paymentLine,
      ``,
      `Once the deposit is paid, we confirm your chef team and lock your date.`,
    ]
    if (quoteEmailTestimonial) {
      lines.push(
        ``,
        `What guests have said:`,
        `"${quoteEmailTestimonial.quote}" — ${quoteEmailTestimonial.name}`,
      )
    }
    return lines.join('\n')
  }

  const buildDepositRequestEmail = (stripeUrl: string | null) => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentLine = stripeUrl
      ? `Pay your deposit here (Stripe):\n${stripeUrl}`
      : `Pay your deposit using your deposit link (Stripe) provided by Bornfidis.`

    const subject = `Bornfidis Provisions — Deposit Request for ${booking.name}`
    const emailLines = [
      `Hello ${booking.name},`,
      ``,
      `Thank you for reaching out to Bornfidis Provisions. Below is your client-ready deposit request:`,
      ``,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      `Total estimate: ${formatUSD(savedQuoteTotalCents)}`,
      `Deposit requested (${savedDepositPercent}%): ${formatUSD(savedDepositCents)}`,
      ``,
      paymentLine,
      ``,
      `Once the deposit is paid, we confirm your chef team and lock your date.`,
    ]
    if (quoteEmailTestimonial) {
      emailLines.push(
        ``,
        `What guests have said:`,
        `"${quoteEmailTestimonial.quote}" — ${quoteEmailTestimonial.name}`,
      )
    }
    const emailBody = emailLines.join('\n')

    return `Subject: ${subject}\n\n${emailBody}`.trim()
  }

  const buildBookingConfirmationWhatsApp = () => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentPortalLine = portalUrl ? `Payment portal link:\n${portalUrl}` : 'If you have not yet received your payment portal, we will send it shortly.'

    const balanceLine = depositPaid ? `Remaining balance: ${formatUSD(savedBalanceCents)}` : 'Remaining balance: will be confirmed after your deposit is paid.'

    return [
      `Hello ${booking.name},`,
      ``,
      depositPaid
        ? `Thank you! Your deposit has been received and your booking is confirmed.`
        : `To confirm your booking, we just need your deposit payment.`,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      balanceLine,
      ``,
      `Please use the payment portal to settle the remaining balance:`,
      paymentPortalLine,
      ``,
      `If you have dietary updates, reply here and we will adjust accordingly.`,
    ].join('\n')
  }

  const buildBookingConfirmationEmail = () => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentPortalLine = portalUrl ? `Payment portal link:\n${portalUrl}` : 'If you have not yet received your payment portal, we will send it shortly.'

    const balanceLine = depositPaid ? `Remaining balance: ${formatUSD(savedBalanceCents)}` : 'Remaining balance: will be confirmed after your deposit is paid.'

    const subject = `Bornfidis Provisions — Booking Confirmation for ${booking.name}`
    const emailBody = [
      `Hello ${booking.name},`,
      ``,
      depositPaid
        ? `Thank you! Your deposit has been received and your booking is confirmed.`
        : `To confirm your booking, we just need your deposit payment.`,
      ``,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      balanceLine,
      ``,
      `Please use the payment portal to settle the remaining balance:`,
      portalUrl ? portalUrl : paymentPortalLine,
      ``,
      `If you have dietary updates, reply here and we will adjust accordingly.`,
    ].join('\n')

    return `Subject: ${subject}\n\n${emailBody}`.trim()
  }

  const buildFinalBalanceReminderWhatsApp = () => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentPortalLine = portalUrl ? `Payment portal link:\n${portalUrl}` : 'If you need the payment link, reply here and we will resend it.'

    const balanceLine = depositPaid
      ? `Remaining balance: ${formatUSD(savedBalanceCents)}`
      : 'Remaining balance: will be confirmed after your deposit is paid.'

    return [
      `Hello ${booking.name},`,
      ``,
      fullyPaid
        ? `Your balance is fully paid. We are looking forward to serving you!`
        : depositPaid
          ? `Friendly reminder: your remaining balance is due.`
          : `Quick reminder: please pay your deposit first, and we will confirm your remaining balance.`,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      balanceLine,
      ``,
      depositPaid ? `Please settle the remaining balance using the payment portal:` : `To pay your deposit, please use the payment portal:`,
      paymentPortalLine,
      ``,
      `Reply if you have any dietary updates.`,
    ].join('\n')
  }

  const buildFinalBalanceReminderEmail = () => {
    const eventLine = `${formatEventDateLong(booking.event_date)}${booking.event_time ? ` at ${booking.event_time}` : ''}`
    const guestsLine = booking.guests ? `${booking.guests} guest${booking.guests === 1 ? '' : 's'}` : 'Guests: —'
    const paymentPortalLine = portalUrl ? `Payment portal link:\n${portalUrl}` : 'If you need the payment link, reply here and we will resend it.'

    const balanceLine = depositPaid
      ? `Remaining balance: ${formatUSD(savedBalanceCents)}`
      : 'Remaining balance: will be confirmed after your deposit is paid.'

    const subject = `Bornfidis Provisions — Final Balance Reminder for ${booking.name}`
    const emailBody = [
      `Hello ${booking.name},`,
      ``,
      fullyPaid
        ? `Your balance is fully paid. We are looking forward to serving you!`
        : depositPaid
          ? `Friendly reminder: your remaining balance is due.`
          : `Quick reminder: please pay your deposit first, and we will confirm your remaining balance.`,
      ``,
      `Event: ${eventLine}`,
      `Location: ${booking.location}`,
      `Guests: ${guestsLine}`,
      ``,
      balanceLine,
      ``,
      depositPaid ? `Please settle the remaining balance using the payment portal:` : `To pay your deposit, please use the payment portal:`,
      portalUrl ? portalUrl : paymentPortalLine,
      ``,
      `Reply if you have any dietary updates.`,
    ].join('\n')

    return `Subject: ${subject}\n\n${emailBody}`.trim()
  }

  const handleCopyDepositRequestWhatsapp = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate deposit request.')
      return
    }
    const stripeUrl = (await ensureStripeDepositUrl()) || booking.stripe_payment_link_url || null
    const text = buildDepositRequestWhatsApp(stripeUrl)
    const ok = await copyTextToClipboard(text, 'Deposit request (WhatsApp)')
    if (ok) {
      await logBookingActivity({
        type: 'deposit_request_copied_whatsapp',
        title: 'Deposit request copied',
        description: 'WhatsApp',
      })
    }
  }

  const handleCopyDepositRequestEmail = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate deposit email draft.')
      return
    }
    const stripeUrl = (await ensureStripeDepositUrl()) || booking.stripe_payment_link_url || null
    const text = buildDepositRequestEmail(stripeUrl)
    const ok = await copyTextToClipboard(text, 'Deposit request (Email)')
    if (ok) {
      await logBookingActivity({
        type: 'deposit_request_copied_email',
        title: 'Deposit request copied',
        description: 'Email draft',
      })
    }
  }

  const handleCopyBookingConfirmationWhatsapp = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate booking confirmation.')
      return
    }
    const text = buildBookingConfirmationWhatsApp()
    const ok = await copyTextToClipboard(text, 'Booking confirmation (WhatsApp)')
    if (ok) {
      await logBookingActivity({
        type: 'booking_confirmation_copied_whatsapp',
        title: 'Booking confirmation copied',
        description: 'WhatsApp',
      })
    }
  }

  const handleCopyBookingConfirmationEmail = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate booking confirmation email draft.')
      return
    }
    const text = buildBookingConfirmationEmail()
    const ok = await copyTextToClipboard(text, 'Booking confirmation (Email)')
    if (ok) {
      await logBookingActivity({
        type: 'booking_confirmation_copied_email',
        title: 'Booking confirmation copied',
        description: 'Email draft',
      })
    }
  }

  const handleCopyFinalBalanceReminderWhatsapp = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate final balance reminder.')
      return
    }
    const text = buildFinalBalanceReminderWhatsApp()
    const ok = await copyTextToClipboard(text, 'Final balance reminder (WhatsApp)')
    if (ok) {
      await logBookingActivity({
        type: 'final_balance_reminder_copied_whatsapp',
        title: 'Final balance reminder copied',
        description: 'WhatsApp',
      })
    }
  }

  const handleCopyFinalBalanceReminderEmail = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate final balance reminder email draft.')
      return
    }
    const text = buildFinalBalanceReminderEmail()
    const ok = await copyTextToClipboard(text, 'Final balance reminder (Email)')
    if (ok) {
      await logBookingActivity({
        type: 'final_balance_reminder_copied_email',
        title: 'Final balance reminder copied',
        description: 'Email draft',
      })
    }
  }

  const handleOpenDepositLink = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to generate a deposit link.')
      return
    }

    const stripeUrl = (await ensureStripeDepositUrl()) || booking.stripe_payment_link_url || null
    if (!stripeUrl) {
      toast.error('Deposit link is not available.')
      return
    }

    window.open(stripeUrl, '_blank', 'noopener,noreferrer')
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    toast.success(`Opened deposit link (${time})`)
    await logBookingActivity({
      type: 'deposit_link_opened',
      title: 'Deposit link opened',
      description: 'Stripe',
    })

    if (status !== 'booked' && status !== 'confirmed') {
      setStatusSuggestionPrompt('booked')
    }
  }

  const handleEmailQuoteOffer = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to send a quote email.')
      return
    }
    if (!booking.email?.trim()) {
      toast.error('Add a client email on this booking first.')
      return
    }
    setIsSendingQuoteEmail(true)
    try {
      const res = await sendBookingQuoteOfferEmail(booking.id)
      if (res.success) {
        toast.success('Quote offer email sent')
        setBookingActivities((prev) => [res.activity, ...prev])
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email')
    } finally {
      setIsSendingQuoteEmail(false)
    }
  }

  const handleEmailDepositRequest = async () => {
    if (!hasSavedQuote) {
      toast.error('Save the quote first to send a deposit request email.')
      return
    }
    if (!booking.email?.trim()) {
      toast.error('Add a client email on this booking first.')
      return
    }
    setIsSendingDepositRequestEmail(true)
    try {
      const res = await sendBookingDepositRequestEmail(booking.id)
      if (res.success) {
        toast.success('Deposit request email sent')
        setBookingActivities((prev) => [res.activity, ...prev])
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email')
    } finally {
      setIsSendingDepositRequestEmail(false)
    }
  }

  const statusLowerPipeline = String(status).toLowerCase()
  const canMarkConfirmedNoDeposit = ![
    'confirmed',
    'in_prep',
    'completed',
    'cancelled',
    'canceled',
    'declined',
    'closed',
  ].includes(statusLowerPipeline)
  const canSendInquiryReminder =
    ['new_inquiry', 'reviewing', 'New'].includes(status) && Boolean(booking.email?.trim())

  const handleMarkConfirmedNoDeposit = async () => {
    if (!canMarkConfirmedNoDeposit) return
    if (
      !window.confirm(
        notifyOnManualConfirm
          ? 'Set status to confirmed and send the standard approval email and SMS (if on file)?'
          : 'Set status to confirmed without sending the standard approval email or SMS?',
      )
    ) {
      return
    }
    setIsMarkingConfirmedNoDeposit(true)
    try {
      if (notifyOnManualConfirm) {
        const result = await updateBooking(booking.id, { status: 'confirmed' })
        if (result.success) {
          setStatus('confirmed')
          toast.success('Confirmed. Client notification sent when email/phone are on file.')
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to update')
        }
      } else {
        const result = await markBookingConfirmedSilently(booking.id)
        if (result.success) {
          setStatus('confirmed')
          toast.success('Confirmed (silent — no approval email/SMS from this action).')
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to update')
        }
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setIsMarkingConfirmedNoDeposit(false)
    }
  }

  const handleSendInquiryReminder = async () => {
    if (!canSendInquiryReminder) return
    if (
      !window.confirm(
        'Send a "still reviewing" follow-up to the client? This sets inquiry reminder timestamp.',
      )
    ) {
      return
    }
    setIsSendingInquiryReminder(true)
    try {
      const res = await sendInquiryReminderForBooking(booking.id)
      if (res.success) {
        toast.success('Inquiry reminder sent')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to send')
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setIsSendingInquiryReminder(false)
    }
  }

  // Private-dining pipeline + legacy (deduped by value)
  const statusOptions: { value: BookingStatus; label: string }[] = [
    ...BOOKING_PIPELINE_STATUSES.map((v) => ({
      value: v as BookingStatus,
      label: BOOKING_PIPELINE_STATUS_LABEL[v],
    })),
    { value: 'New', label: 'New (legacy)' },
    { value: 'Quote Sent', label: 'Quote sent (legacy)' },
    { value: 'Follow Up', label: 'Follow up (legacy)' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'booked', label: 'Booked' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'declined', label: 'Declined' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Completed', label: 'Completed (legacy)' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Canceled', label: 'Canceled' },
  ].filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i) as {
    value: BookingStatus
    label: string
  }[]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateBooking(booking.id, {
        status,
        admin_notes: adminNotes,
      })
      if (result.success) {
        if (status !== booking.status) {
          await logBookingActivity({
            type: 'status_changed',
            title: 'Status changed',
            description: `From ${booking.status} to ${status}`,
          })
        }
        toast.success('Changes saved!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save changes. Please try again.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddInternalNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const note = internalNote.trim()
      if (!note) {
        toast.error('Please write an internal note first.')
        return
      }

      setIsAddingInternalNote(true)
      try {
        const res = await addBookingActivity(booking.id, {
          type: 'admin_note',
          title: 'Internal note',
          description: note,
        })

        if (res.success) {
          setBookingActivities((prev) => [res.activity, ...prev])
          setInternalNote('')
          toast.success('Internal note added.')
        } else {
          toast.error(res.error || 'Failed to add note.')
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to add note.')
      } finally {
        setIsAddingInternalNote(false)
      }
    },
    [booking.id, internalNote]
  )

  const hasChanges = status !== booking.status || adminNotes !== (booking.admin_notes || '')

  // Calculate quote totals (Phase 2AL: with optional region pricing)
  const subtotalCents = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price_cents)
  }, 0)
  const taxCents = taxDollars ? dollarsToCents(parseFloat(taxDollars) || 0) : 0
  const serviceFeeCents = serviceFeeDollars ? dollarsToCents(parseFloat(serviceFeeDollars) || 0) : 0
  const jobCents = previewJobCents ?? subtotalCents
  const totalCents = jobCents + taxCents + serviceFeeCents
  const depositCents = Math.round((totalCents * depositPercentage) / 100)
  const balanceCents = Math.max(totalCents - depositCents, 0)

  // Fetch region list when quote section is expanded
  useEffect(() => {
    if (!quoteExpanded || regionOptions.length > 0) return
    fetch('/api/admin/region-pricing')
      .then((r) => r.json())
      .then((d) => setRegionOptions((d.regions || []).map((r: { regionCode: string; name: string | null }) => ({ regionCode: r.regionCode, name: r.name }))))
      .catch(() => {})
  }, [quoteExpanded, regionOptions.length])

  // When region or subtotal changes, fetch preview so total reflects region pricing
  useEffect(() => {
    if (!regionCode.trim() || subtotalCents <= 0) {
      setPreviewJobCents(null)
      return
    }
    const c = new AbortController()
    fetch(`/api/admin/region-pricing/preview?baseSubtotalCents=${subtotalCents}&regionCode=${encodeURIComponent(regionCode)}`, { signal: c.signal })
      .then((r) => r.json())
      .then((d) => (d.finalJobCents != null ? setPreviewJobCents(d.finalJobCents) : setPreviewJobCents(null)))
      .catch(() => setPreviewJobCents(null))
    return () => c.abort()
  }, [regionCode, subtotalCents])

  const calculateSubtotal = () => subtotalCents / 100
  const calculateTotal = () => totalCents / 100

  // Payment status
  const depositPaid = !!booking.paid_at && (booking.deposit_amount_cents || 0) > 0
  const balancePaid = !!booking.balance_paid_at
  const fullyPaid = !!booking.fully_paid_at

  useEffect(() => {
    if (!depositPaid || didPromptDepositPaid) return
    setDidPromptDepositPaid(true)

    if (status === 'Confirmed') return
    setStatusSuggestionPrompt('confirmed')
  }, [depositPaid, didPromptDepositPaid, status])

  const handleNotNowStatusSuggestion = () => {
    // Quote saved previously relied on an unconditional refresh (even if user chose "Not now").
    if (statusSuggestionPrompt === 'quoted') {
      router.refresh()
    }
    setStatusSuggestionPrompt(null)
  }

  const handleConfirmStatusSuggestion = async () => {
    if (!statusSuggestionPrompt || isStatusSuggestionBusy) return

    setIsStatusSuggestionBusy(true)
    try {
      const previousStatus = status

      if (statusSuggestionPrompt === 'quoted') {
        const res = await updateBooking(booking.id, {
          status: 'quoted',
          admin_notes: adminNotes,
        })
        if (res.success) {
          setStatus('quoted')
          const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          toast.success(`Status updated to Quoted (${time})`)
          await logBookingActivity({
            type: 'status_changed',
            title: 'Status changed',
            description: `From ${previousStatus} to quoted`,
          })
          router.refresh()
          setStatusSuggestionPrompt(null)
          return
        }

        toast.error(res.error || 'Failed to update status')
        return
      }

      if (statusSuggestionPrompt === 'booked') {
        const res = await updateBooking(booking.id, {
          status: 'booked',
          admin_notes: adminNotes,
        })
        if (res.success) {
          setStatus('booked')
          const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          toast.success(`Status updated to Booked (${time})`)
          await logBookingActivity({
            type: 'status_changed',
            title: 'Status changed',
            description: `From ${previousStatus} to booked`,
          })
          router.refresh()
          setStatusSuggestionPrompt(null)
          return
        }

        toast.error(res.error || 'Failed to update status')
        return
      }

      if (statusSuggestionPrompt === 'confirmed') {
        const res = await updateBooking(booking.id, {
          status: 'Confirmed',
          admin_notes: adminNotes,
        })
        if (res.success) {
          setStatus('Confirmed')
          const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          toast.success(`Status updated to Confirmed (${time})`)
          await logBookingActivity({
            type: 'status_changed',
            title: 'Status changed',
            description: `From ${previousStatus} to Confirmed`,
          })
          router.refresh()
          setStatusSuggestionPrompt(null)
          return
        }

        toast.error(res.error || 'Failed to update status')
        return
      }
    } finally {
      setIsStatusSuggestionBusy(false)
    }
  }

  // Quote & Payment handlers
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        booking_id: booking.id,
        title: '',
        description: '',
        quantity: 1,
        unit_price_cents: 0,
        sort_order: lineItems.length,
      },
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })))
  }

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    // Convert unit_price if it's a dollar string
    if (field === 'unit_price_cents' && typeof value === 'string') {
      updated[index].unit_price_cents = parseDollarsToCents(value)
    }

    setLineItems(updated)
  }

  const handleSaveQuote = async () => {
    setIsSavingQuote(true)
    try {
      // Validate line items
      const validItems = lineItems.filter((item) => item.title.trim() && item.unit_price_cents > 0)
      if (validItems.length === 0) {
        toast.error('Please add at least one item with a title and price')
        setIsSavingQuote(false)
        return
      }

      const result = await updateBookingQuote(booking.id, {
        quote_line_items: validItems,
        quote_notes: quoteNotes || null,
        quote_tax_cents: taxCents,
        quote_service_fee_cents: serviceFeeCents,
        quote_subtotal_cents: subtotalCents,
        quote_total_cents: totalCents,
        deposit_percentage: depositPercentage,
      })

      if (result.success) {
        toast.success('Quote saved successfully!')
        await logBookingActivity({
          type: 'quote_saved',
          title: 'Quote saved',
          description: `Quote total: ${formatUSD(totalCents)} • Deposit: ${formatUSD(depositCents)} (${depositPercentage}%)`,
        })
        setStatusSuggestionPrompt('quoted')
      } else {
        toast.error(result.error || 'Failed to save quote. Please try again.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save quote. Please try again.')
    } finally {
      setIsSavingQuote(false)
    }
  }

  const handleChefAssignment = async (chefId: string) => {
    if (!chefId) return
    setTeamSaving(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/assign-chef-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chef_id: chefId, payout_percentage: 70, notes: teamNotes || null, admin_override: overrideAvailability }),
      })
      const data = await res.json()
      if (data.success) {
        const chefName = activeChefs.find((c) => c.id === chefId)?.name ?? 'Chef'
        setAssignedChef({ id: chefId, name: chefName })
        setSelectedChefId(chefId)
        toast.success('Chef assigned')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to assign chef')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign chef')
    } finally {
      setTeamSaving(false)
    }
  }

  const handleFarmerAssignment = async (farmerId: string) => {
    if (!farmerId) return
    setTeamSaving(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/assign-farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer_id: farmerId, role: 'produce', payout_percent: 60, notes: null }),
      })
      const data = await res.json()
      if (data.success && data.booking_farmer) {
        setAssignedFarmers((prev) => [...prev, data.booking_farmer])
        toast.success('Farmer assigned')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to assign farmer')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign farmer')
    } finally {
      setTeamSaving(false)
    }
  }

  const handleRemoveFarmer = async (assignmentId: string) => {
    if (!confirm('Remove this farmer assignment?')) return
    setTeamSaving(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/booking-farmers/${assignmentId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setAssignedFarmers((prev) => prev.filter((a: any) => a.id !== assignmentId))
        toast.success('Farmer removed')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to remove farmer')
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove farmer')
    } finally {
      setTeamSaving(false)
    }
  }

  const handleSaveTeamAssignments = async () => {
    setTeamSaving(true)
    try {
      router.refresh()
      toast.success('Team assignments saved')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setTeamSaving(false)
    }
  }

  // Keyboard shortcuts for faster admin workflow
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save Changes
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Cmd/Ctrl + K = Copy Portal Link
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleCopyPortalUrl()
      }
      // Cmd/Ctrl + Q = Toggle Quote Section
      if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault()
        setQuoteExpanded((prev) => !prev)
      }
      // Cmd/Ctrl + T = Toggle Team Section
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault()
        setTeamExpanded((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [quoteExpanded, teamExpanded, handleSave, handleCopyPortalUrl])

  return (
    <div className="max-w-full space-y-stack-md overflow-x-hidden font-culinary-sans">
      <StatusWorkflow currentStatus={status} />

      {/* Admin Actions */}
      <CulinaryCard className="mb-stack-md">
        <h2 className="mb-stack-md flex items-center gap-2 font-culinary-display text-title-md text-culinary-navy">
          <span className="text-2xl">⚙️</span>
          Admin Actions
        </h2>

        <div className="space-y-4">
          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-culinary-ink mb-2">
              Booking Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full px-4 py-3 text-base border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              title="Booking status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {canMarkConfirmedNoDeposit ? (
            <div className="rounded-none border border-amber-200 bg-amber-50/80 p-4 space-y-3">
              <p className="text-sm font-semibold text-culinary-ink">Mark confirmed (no Stripe deposit)</p>
              <p className="text-xs text-culinary-text-muted leading-relaxed">
                Use when the date is firm without a card deposit (e.g. wire, contract, or internal
                sign-off). This sets status to <span className="font-mono text-culinary-ink">confirmed</span>
                — it does not record a payment in Stripe.
              </p>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-culinary-ink">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded-none border-culinary-outline"
                  checked={notifyOnManualConfirm}
                  onChange={(e) => setNotifyOnManualConfirm(e.target.checked)}
                />
                <span>
                  Also send the standard &quot;booking approved&quot; email and SMS (when contact info
                  exists)
                </span>
              </label>
              <button
                type="button"
                onClick={handleMarkConfirmedNoDeposit}
                disabled={isMarkingConfirmedNoDeposit}
                className="w-full rounded-none bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition disabled:opacity-50"
              >
                {isMarkingConfirmedNoDeposit ? 'Updating…' : 'Mark confirmed'}
              </button>
            </div>
          ) : null}

          {canSendInquiryReminder ? (
            <div className="rounded-none border border-sky-200 bg-sky-50/80 p-4 space-y-2">
              <p className="text-sm font-semibold text-culinary-ink">Inquiry follow-up</p>
              <p className="text-xs text-culinary-text-muted">
                Send a short &quot;still reviewing&quot; note. Sets{' '}
                <span className="font-mono">inquiryReminderSentAt</span> for reporting.
                {booking.reminder_sent_at
                  ? ` Last sent: ${new Date(booking.reminder_sent_at).toLocaleString()}.`
                  : ' No reminder logged yet.'}
              </p>
              <button
                type="button"
                onClick={handleSendInquiryReminder}
                disabled={isSendingInquiryReminder}
                className="w-full rounded-none border border-sky-600 bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-100 transition disabled:opacity-50"
              >
                {isSendingInquiryReminder ? 'Sending…' : 'Send inquiry reminder email'}
              </button>
            </div>
          ) : null}

          {/* Quick Action Buttons */}
          {(status === 'pending' || status === 'reviewed') && (
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    const result = await updateBooking(booking.id, {
                      status: 'booked',
                      admin_notes: adminNotes,
                    })
                    if (result.success) {
                      setStatus('booked')
                      toast.success('Booking approved! Confirmation email sent to customer.')
                      router.refresh()
                    } else {
                      toast.error(result.error || 'Failed to approve booking')
                    }
                  } catch (error: any) {
                    toast.error(error.message || 'An error occurred')
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-none font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? 'Processing...' : '✓ Approve Booking'}
              </button>
              <button
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    const result = await updateBooking(booking.id, {
                      status: 'declined',
                      admin_notes: adminNotes,
                    })
                    if (result.success) {
                      setStatus('declined')
                      toast.success('Booking declined. Notification email sent to customer.')
                      router.refresh()
                    } else {
                      toast.error(result.error || 'Failed to decline booking')
                    }
                  } catch (error: any) {
                    toast.error(error.message || 'An error occurred')
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-none font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? 'Processing...' : '✕ Decline'}
              </button>
            </div>
          )}

          <AdminBookingNotesCard value={adminNotes} onChange={setAdminNotes} />

          {/* Action Buttons: Save (primary) + Copy Portal Link (secondary) side by side */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex-1 min-w-[140px] px-6 py-3 bg-green-600 text-white font-semibold rounded-none hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCopyPortalUrl}
              className="shrink-0 px-6 py-3 bg-culinary-surface-high text-culinary-ink font-semibold rounded-none hover:bg-culinary-surface-highest transition flex items-center gap-2"
            >
              📋 Copy Portal Link
            </button>
          </div>
        </div>
      </CulinaryCard>
      {/* Follow-up date (if set on booking) */}
      {booking.follow_up_date && (
        <div>
          <label className="block text-sm font-medium text-culinary-text-muted mb-1">Follow-up Date</label>
          <p className="text-culinary-ink">
            {new Date(booking.follow_up_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Quote & Payment - Collapsible */}
      <CulinaryCard id="booking-quote" padded={false} className="mb-stack-md scroll-mt-24 overflow-hidden">
        <button
          type="button"
          onClick={() => setQuoteExpanded(!quoteExpanded)}
          className="flex w-full items-center justify-between border-b border-culinary-outline px-gutter py-4 transition hover:bg-culinary-surface-low"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-culinary-ink">Quote & Payment</h2>
              <p className="text-sm text-culinary-text-muted">
                {lineItems.length === 0
                  ? 'No quote created yet'
                  : `Total: $${calculateTotal().toFixed(2)}`}
              </p>
            </div>
          </div>
          <span className="text-culinary-text-muted text-sm">
            {quoteExpanded ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>

        {quoteExpanded && (
          <div className="space-y-stack-lg border-t border-culinary-outline px-gutter pb-gutter transition-all duration-300 ease-in-out">
            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-culinary-ink uppercase tracking-wide">
                  Line Items
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  + Add Item
                </button>
              </div>

              <div className="overflow-x-auto overflow-hidden rounded-none border border-culinary-outline">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-culinary-navy text-culinary-on-navy">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-20">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold w-32">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold w-32">Line Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-culinary-text-muted">
                          No items yet. Click &quot;Add Item&quot; to get started.
                        </td>
                      </tr>
                    ) : (
                      lineItems.map((item, index) => (
                        <tr key={index} className="border-t border-culinary-outline hover:bg-culinary-surface-low">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 border border-culinary-outline rounded-none text-sm"
                              placeholder="Service name"
                              title="Service name"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-culinary-outline rounded-none text-sm"
                              placeholder="Optional"
                              title="Optional description"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 border border-culinary-outline rounded-none text-sm text-center"
                              title="Quantity"
                              placeholder="1"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={formatUSD(item.unit_price_cents).replace('$', '')}
                              onChange={(e) => {
                                const cents = parseDollarsToCents(e.target.value)
                                updateLineItem(index, 'unit_price_cents', cents)
                              }}
                              className="w-full px-2 py-1 border border-culinary-outline rounded-none text-sm text-right"
                              placeholder="0.00"
                              title="Unit price (USD)"
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {formatUSD(item.quantity * item.unit_price_cents)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quote Notes */}
            <div>
              <label htmlFor="quote_notes" className="block text-sm font-medium text-culinary-ink mb-2">
                Quote Notes (for customer)
              </label>
              <textarea
                id="quote_notes"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={3}
                placeholder="Add notes for the customer..."
                className="w-full px-4 py-2 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
              />
            </div>

            {/* Tax, Service Fee, Deposit % */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tax" className="block text-sm font-medium text-culinary-ink mb-2">
                  Tax (USD)
                </label>
                <input
                  type="text"
                  id="tax"
                  value={taxDollars}
                  onChange={(e) => setTaxDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="service_fee" className="block text-sm font-medium text-culinary-ink mb-2">
                  Service Fee (USD)
                </label>
                <input
                  type="text"
                  id="service_fee"
                  value={serviceFeeDollars}
                  onChange={(e) => setServiceFeeDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="deposit_percentage" className="block text-sm font-medium text-culinary-ink mb-2">
                  Deposit Percentage
                </label>
                <input
                  type="number"
                  id="deposit_percentage"
                  min={0}
                  max={100}
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(parseInt(e.target.value) || 30)}
                  placeholder="30"
                  title="Deposit percentage"
                  className="w-full px-3 py-2 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="region_code" className="block text-sm font-medium text-culinary-ink mb-2">
                  Region (Phase 2AL)
                </label>
                <select
                  id="region_code"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  title="Choose a region (optional)"
                >
                  <option value="">No region</option>
                  {regionOptions.map((r) => (
                    <option key={r.regionCode} value={r.regionCode}>
                      {r.regionCode} {r.name ? `(${r.name})` : ''}
                    </option>
                  ))}
                </select>
                {regionCode && (
                  <p className="text-xs text-culinary-text-muted mt-1">Multiplier + travel fee + minimum applied on save; locked at quote time.</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-2 border-culinary-navy rounded-none p-4 space-y-2">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span>{formatUSD(subtotalCents)}</span>
              </div>
              {regionCode && previewJobCents != null && previewJobCents !== subtotalCents && (
                <div className="flex justify-between text-base text-culinary-text-muted">
                  <span>After region ({regionCode}):</span>
                  <span>{formatUSD(previewJobCents)}</span>
                </div>
              )}
              {taxCents > 0 && (
                <div className="flex justify-between text-base">
                  <span>Tax:</span>
                  <span>{formatUSD(taxCents)}</span>
                </div>
              )}
              {serviceFeeCents > 0 && (
                <div className="flex justify-between text-base">
                  <span>Service Fee:</span>
                  <span>{formatUSD(serviceFeeCents)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-culinary-outline pt-2 text-lg font-bold">
                <span>Total:</span>
                <span>{formatUSD(totalCents)}</span>
              </div>
              {booking.surge_label && (
                <p className="text-sm text-amber-700 font-medium">{booking.surge_label}</p>
              )}
              <div className="flex justify-between text-lg font-bold bg-culinary-navy text-culinary-on-navy px-3 py-2 rounded-none -mx-2 -mb-2 mt-2">
                <span>Deposit ({depositPercentage}%):</span>
                <span>{formatUSD(depositCents)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-culinary-surface-low rounded-none p-4">
              <h4 className="text-sm font-semibold text-culinary-ink mb-3">Payment Status</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-culinary-text-muted">Deposit Paid:</span>
                  <span className={`ml-2 font-medium ${depositPaid ? 'text-green-600' : 'text-culinary-text-muted'}`}>
                    {depositPaid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-culinary-text-muted">Balance Paid:</span>
                  <span className={`ml-2 font-medium ${balancePaid ? 'text-green-600' : 'text-culinary-text-muted'}`}>
                    {balancePaid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-culinary-text-muted">Fully Paid:</span>
                  <span className={`ml-2 font-medium ${fullyPaid ? 'text-green-600' : 'text-culinary-text-muted'}`}>
                    {fullyPaid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit & Confirmation Templates */}
            <CulinaryCard className="!bg-culinary-surface-low">
              <h4 className="text-sm font-semibold text-culinary-ink mb-3">Deposit and confirmation tools</h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-culinary-text-muted">Quote total</span>
                  <span className="font-semibold text-culinary-ink">{hasSavedQuote ? formatUSD(savedQuoteTotalCents) : '—'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-culinary-text-muted">Deposit ({savedDepositPercent}%)</span>
                  <span className="font-semibold text-culinary-ink">{hasSavedQuote ? formatUSD(savedDepositCents) : '—'}</span>
                </div>

                <div className="pt-2 border-t border-culinary-outline flex items-center justify-between gap-3">
                  <span className="text-culinary-text-muted text-sm">Stripe deposit</span>
                  <button
                    type="button"
                    onClick={handleOpenDepositLink}
                    disabled={!hasSavedQuote || isCreatingStripeDepositLink}
                    className="px-4 py-2 bg-navy text-culinary-on-navy font-semibold rounded-none hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingStripeDepositLink ? 'Opening...' : 'Open Deposit Link'}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-culinary-outline">
                <p className="text-xs font-semibold text-culinary-text-muted uppercase tracking-wide mb-2">Send via Resend</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleEmailQuoteOffer}
                    disabled={
                      !hasSavedQuote ||
                      !booking.email?.trim() ||
                      isSendingQuoteEmail ||
                      isCreatingStripeDepositLink
                    }
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-none hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSendingQuoteEmail ? 'Sending…' : 'Send Quote Email'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailDepositRequest}
                    disabled={
                      !hasSavedQuote ||
                      !booking.email?.trim() ||
                      isSendingDepositRequestEmail ||
                      isCreatingStripeDepositLink
                    }
                    className="px-4 py-2 bg-sky-700 text-white font-semibold rounded-none hover:bg-sky-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSendingDepositRequestEmail ? 'Sending…' : 'Send Deposit Request Email'}
                  </button>
                </div>
                {!booking.email?.trim() && (
                  <p className="mt-2 text-xs text-amber-700">Add a client email above to enable Resend.</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyDepositRequestWhatsapp}
                  disabled={!hasSavedQuote || isCreatingStripeDepositLink}
                  className="px-4 py-2 bg-gold text-navy font-semibold rounded-none hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Deposit Request (WhatsApp)
                </button>
                <button
                  type="button"
                  onClick={handleCopyDepositRequestEmail}
                  disabled={!hasSavedQuote || isCreatingStripeDepositLink}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-none hover:bg-navy hover:text-culinary-on-navy transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Deposit Request (Email)
                </button>
                <button
                  type="button"
                  onClick={handleCopyBookingConfirmationWhatsapp}
                  disabled={!hasSavedQuote}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-none hover:bg-navy hover:text-culinary-on-navy transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Booking Confirmation (WhatsApp)
                </button>
                <button
                  type="button"
                  onClick={handleCopyBookingConfirmationEmail}
                  disabled={!hasSavedQuote}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-none hover:bg-navy hover:text-culinary-on-navy transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Booking Confirmation (Email)
                </button>
                <button
                  type="button"
                  onClick={handleCopyFinalBalanceReminderWhatsapp}
                  disabled={!hasSavedQuote}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-none hover:bg-navy hover:text-culinary-on-navy transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Final Balance Reminder (WhatsApp)
                </button>
                <button
                  type="button"
                  onClick={handleCopyFinalBalanceReminderEmail}
                  disabled={!hasSavedQuote}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-none hover:bg-navy hover:text-culinary-on-navy transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Copy Final Balance Reminder (Email)
                </button>
              </div>

              {!hasSavedQuote && (
                <p className="mt-3 text-xs text-culinary-text-muted">Save the quote first to enable deposit and confirmation templates.</p>
              )}
            </CulinaryCard>

            {/* Save Quote */}
            <button
              type="button"
              onClick={handleSaveQuote}
              disabled={
                isSavingQuote ||
                lineItems.length === 0 ||
                !!booking.paid_at ||
                (booking.quote_status ?? '').toLowerCase() === 'accepted'
              }
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-none hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSavingQuote ? 'Saving...' : 'Save Quote'}
            </button>
            {(booking.paid_at || (booking.quote_status ?? '').toLowerCase() === 'accepted') && (
              <p className="mt-2 text-center text-sm text-amber-800">
                Quote is locked after client accept or deposit payment.
              </p>
            )}

            {/* Shortcut: most-used deposit message */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleCopyDepositRequestWhatsapp}
                disabled={!hasSavedQuote || isCreatingStripeDepositLink}
                className="w-full px-6 py-2 bg-culinary-surface-high text-culinary-ink font-semibold rounded-none hover:bg-culinary-surface-highest transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Copy Deposit Request (WhatsApp)
              </button>
            </div>

            {/* Download Invoice when fully paid */}
            {fullyPaid && lineItems.length > 0 && (
              <PDFDownloadLink
                document={<InvoicePdfDocument booking={booking} lineItems={lineItems} />}
                fileName={`invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
                className="block w-full px-6 py-3 bg-navy text-culinary-on-navy font-semibold rounded-none hover:bg-opacity-90 transition text-center"
              >
                Download Invoice
              </PDFDownloadLink>
            )}

            {/* Stripe note when not configured */}
            {!isStripeConfigured() && (
              <div className="rounded-none border border-amber-200 bg-amber-50/90 p-gutter font-culinary-sans text-body-md text-amber-950">
                ⚠️ <strong>Note:</strong> Stripe not configured. Track payments manually in Payment Status above.
              </div>
            )}
          </div>
        )}
      </CulinaryCard>

      <div className="mt-stack-md">
        <AdminBookingChecklistCard
          booking={booking}
          onActivity={(a) => setBookingActivities((prev) => [a, ...prev])}
        />
      </div>

      <div className="mt-stack-md">
        <AdminBookingTimelineCard
          activities={bookingActivities}
          internalNote={internalNote}
          onInternalNoteChange={setInternalNote}
          onAddInternalNote={handleAddInternalNote}
          isAddingInternalNote={isAddingInternalNote}
        />
      </div>

      {/* Testimonial capture */}
      <CulinaryCard className="mt-stack-md">
        <h3 className="mb-stack-sm font-culinary-display text-title-md text-culinary-navy">Testimonial</h3>
        <div className="mb-stack-md grid grid-cols-1 gap-gutter font-culinary-sans text-body-md text-culinary-text-muted sm:grid-cols-2">
          <div>
            <span className="text-label-caps text-culinary-text-muted">Requested</span>
            <p className="font-medium text-culinary-ink">
              {booking.testimonial_requested_at
                ? new Date(booking.testimonial_requested_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          </div>
          <div>
            <span className="text-label-caps text-culinary-text-muted">Received</span>
            <p className="font-medium text-culinary-ink">
              {booking.testimonial_received_at
                ? new Date(booking.testimonial_received_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          </div>
        </div>
        <div className="mb-stack-sm flex items-center gap-2">
          <span className="font-culinary-sans text-body-md text-culinary-text-muted">Approved for use</span>
          <span
            className={`inline-flex items-center rounded-none border px-2 py-0.5 font-culinary-sans text-label-caps ${
              testimonialApprovedLocal
                ? 'border-culinary-forest/50 text-culinary-forest'
                : 'border-culinary-outline text-culinary-text-muted'
            }`}
          >
            {testimonialApprovedLocal ? 'Yes' : 'No'}
          </span>
        </div>
        <label htmlFor="testimonial_text" className="mb-1 block font-culinary-sans text-body-md font-medium text-culinary-ink">
          Testimonial text
        </label>
        <textarea
          id="testimonial_text"
          value={testimonialText}
          onChange={(e) => setTestimonialText(e.target.value)}
          rows={5}
          placeholder="Paste the client’s testimonial here when received…"
          className="w-full resize-y rounded-none border border-culinary-outline bg-culinary-bone px-gutter py-3 font-culinary-sans text-body-md text-culinary-ink focus:border-culinary-navy focus:outline-none focus:ring-1 focus:ring-culinary-navy/30"
          title="Testimonial text"
        />
        <div className="mt-stack-md flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isTestimonialBusy}
            onClick={async () => {
              setIsTestimonialBusy(true)
              try {
                const res = await markTestimonialRequested(booking.id)
                if (res.success) {
                  toast.success('Testimonial request recorded.')
                  router.refresh()
                } else toast.error(res.error || 'Failed')
              } catch (e: any) {
                toast.error(e?.message || 'Failed')
              } finally {
                setIsTestimonialBusy(false)
              }
            }}
            className="rounded-none border border-culinary-navy bg-culinary-navy px-4 py-2 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:opacity-90 disabled:opacity-50"
          >
            Mark Requested
          </button>
          <button
            type="button"
            disabled={isTestimonialBusy}
            onClick={async () => {
              setIsTestimonialBusy(true)
              try {
                const res = await saveTestimonialReceived({ bookingId: booking.id, testimonialText })
                if (res.success) {
                  toast.success('Testimonial saved.')
                  router.refresh()
                } else toast.error(res.error || 'Failed')
              } catch (e: any) {
                toast.error(e?.message || 'Failed')
              } finally {
                setIsTestimonialBusy(false)
              }
            }}
            className="rounded-none border border-culinary-navy bg-culinary-bone px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-navy hover:text-culinary-on-navy disabled:opacity-50"
          >
            Save Testimonial
          </button>
          <button
            type="button"
            disabled={isTestimonialBusy || !testimonialText.trim()}
            onClick={async () => {
              setIsTestimonialBusy(true)
              try {
                const res = await setTestimonialApproved({ bookingId: booking.id, approved: true })
                if (res.success) {
                  setTestimonialApprovedLocal(true)
                  toast.success('Testimonial approved for use.')
                  router.refresh()
                } else toast.error(res.error || 'Failed')
              } catch (e: any) {
                toast.error(e?.message || 'Failed')
              } finally {
                setIsTestimonialBusy(false)
              }
            }}
            className="rounded-none border border-culinary-gold-line bg-culinary-gold px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:opacity-90 disabled:opacity-50"
          >
            Approve for Use
          </button>
          {testimonialApprovedLocal && (
            <button
              type="button"
              disabled={isTestimonialBusy}
              onClick={async () => {
                setIsTestimonialBusy(true)
                try {
                  const res = await setTestimonialApproved({ bookingId: booking.id, approved: false })
                  if (res.success) {
                    setTestimonialApprovedLocal(false)
                    toast.success('Approval removed.')
                    router.refresh()
                  } else toast.error(res.error || 'Failed')
                } catch (e: any) {
                  toast.error(e?.message || 'Failed')
                } finally {
                  setIsTestimonialBusy(false)
                }
              }}
              className="px-4 py-2 font-culinary-sans text-body-md text-culinary-text-muted underline decoration-culinary-gold-line underline-offset-4 hover:text-culinary-navy disabled:opacity-50"
            >
              Remove approval
            </button>
          )}
        </div>
      </CulinaryCard>

      {/* Phase 4B: Customer Portal Section */}
      <div className="mt-stack-md border-t border-culinary-outline pt-stack-md">
        <h3 className="mb-stack-sm font-culinary-display text-title-md text-culinary-navy">Customer Portal</h3>
        <CulinaryCard className="!bg-culinary-surface-low space-y-stack-md">
          {portalToken && !isTokenRevoked ? (
            <>
              <div>
                <label className="block text-sm font-medium text-culinary-ink mb-2">
                  Portal Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portalUrl || ''}
                    readOnly
                    title="Payment portal link"
                    className="flex-1 rounded-none border border-culinary-outline bg-culinary-bone px-4 py-2 text-sm"
                  />
                  <button
                    onClick={handleCopyPortalUrl}
                    className="px-4 py-2 bg-navy text-culinary-on-navy rounded-none font-semibold hover:bg-opacity-90 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-culinary-text-muted mt-1">
                  Share this link with the customer to access their booking portal.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGeneratePortalToken(true)}
                  disabled={isGeneratingToken}
                  className="px-4 py-2 bg-gold text-navy rounded-none font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGeneratingToken ? 'Rotating...' : 'Rotate Link'}
                </button>
              </div>
            </>
          ) : isTokenRevoked ? (
            <>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-none">
                <p className="text-sm text-yellow-800 font-semibold mb-2">Portal Link Revoked</p>
                <p className="text-xs text-yellow-700">The previous portal link has been revoked. Generate a new link to share with the customer.</p>
              </div>
              <button
                onClick={() => handleGeneratePortalToken(false)}
                disabled={isGeneratingToken}
                className="px-4 py-2 bg-navy text-culinary-on-navy rounded-none font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingToken ? 'Generating...' : 'Generate Portal Link'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-culinary-text-muted mb-4">
                Generate a secure portal link for the customer to view their booking, make payments, and download invoices.
              </p>
              <button
                onClick={() => handleGeneratePortalToken(false)}
                disabled={isGeneratingToken}
                className="px-4 py-2 bg-navy text-culinary-on-navy rounded-none font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingToken ? 'Generating...' : 'Generate Portal Link'}
              </button>
            </>
          )}
        </CulinaryCard>
      </div>

      {/* Team Assignment - Collapsible */}
      <CulinaryCard padded={false} className="mb-stack-md overflow-hidden">
        <button
          type="button"
          onClick={() => setTeamExpanded(!teamExpanded)}
          className="flex w-full items-center justify-between border-b border-culinary-outline px-gutter py-4 transition hover:bg-culinary-surface-low"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🍳</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-culinary-ink">Team Assignment</h2>
              <p className="text-sm text-culinary-text-muted">
                {assignedChef ? `Chef: ${assignedChef.name}` : 'Chef: Not assigned'} |{' '}
                {assignedFarmers.length > 0 ? ` Farmers: ${assignedFarmers.length}` : ' Farmers: None'}
              </p>
            </div>
          </div>
          <span className="text-culinary-text-muted text-sm">
            {teamExpanded ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>

        {teamExpanded && (
          <div className="space-y-stack-lg border-t border-culinary-outline px-gutter pb-gutter pt-gutter transition-all duration-300 ease-in-out">
            {/* Phase 2AD: Recommended Chefs (scheduling optimizer) */}
            <div>
              <h3 className="text-sm font-semibold text-culinary-ink uppercase tracking-wide mb-3">
                Recommended Chefs
              </h3>
              <p className="text-xs text-culinary-text-muted mb-2">
                Ranked by tier (40%), performance (40%), workload balance (20%). Only available chefs with no conflict.
              </p>
              {recommendedLoading ? (
                <p className="text-sm text-culinary-text-muted">Loading…</p>
              ) : recommendedWarning && recommendedChefs.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-none p-3">
                  <p className="text-sm text-amber-800">{recommendedWarning}</p>
                </div>
              ) : recommendedChefs.length > 0 ? (
                <ul className="space-y-2 mb-2">
                  {recommendedChefs.map((rec) => (
                    <li key={rec.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-culinary-outline last:border-0">
                      <div>
                        <span className="font-medium text-culinary-ink">{rec.name}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-none bg-culinary-surface-highest text-culinary-ink">{rec.tierLabel}</span>
                        {rec.lastRating != null && (
                          <span className="ml-2 text-sm text-culinary-text-muted">Rating {rec.lastRating}</span>
                        )}
                        <span className="ml-2 text-xs text-green-600">{rec.availabilityStatus}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChefAssignment(rec.id)}
                        disabled={teamSaving}
                        className="px-3 py-1.5 text-sm bg-forestDark text-white rounded-none hover:bg-forestDarker disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-culinary-text-muted">No recommendations (no event date or no eligible chefs).</p>
              )}
            </div>

            {/* Assign Chef */}
            <div>
              <h3 className="text-sm font-semibold text-culinary-ink uppercase tracking-wide mb-3">
                Assign Chef
              </h3>
              {activeChefs.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ No active chefs available. Approve and onboard chefs first.
                  </p>
                  <a
                    href="/admin/chefs"
                    className="text-sm text-green-600 hover:text-green-700 font-medium underline"
                  >
                    Go to Chef Network →
                  </a>
                </div>
              ) : (
                <>
                  <select
                    value={selectedChefId}
                    onChange={(e) => handleChefAssignment(e.target.value)}
                    className="w-full px-4 py-3 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    title="Select a chef to assign"
                  >
                    <option value="">Select Chef</option>
                    {activeChefs.map((chef) => (
                      <option key={chef.id} value={chef.id} title={chef.featured ? 'Top-rated, verified chef' : undefined}>
                        {chef.featured ? '⭐ Featured · ' : ''}{chef.name}{chef.tierLabel ? ` — ${chef.tierLabel}` : ''}{chef.specialties?.length ? ` · ${Array.isArray(chef.specialties) ? chef.specialties.join(', ') : chef.specialties}` : ''}
                      </option>
                    ))}
                  </select>
                  <label className="mt-2 flex items-center gap-2 text-sm text-culinary-text-muted">
                    <input
                      type="checkbox"
                      checked={overrideAvailability}
                      onChange={(e) => setOverrideAvailability(e.target.checked)}
                      title="Override availability"
                    />
                    Override availability (assign even if chef marked unavailable or double-booked)
                  </label>
                </>
              )}
            </div>

            {/* Assign Farmers */}
            <div>
              <h3 className="text-sm font-semibold text-culinary-ink uppercase tracking-wide mb-3">
                Assign Farmers
              </h3>
              <div className="space-y-3">
                <select
                  value=""
                  onChange={(e) => handleFarmerAssignment(e.target.value)}
                  className="w-full px-4 py-3 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  title="Select a farmer to add"
                >
                  <option value="">Select Farmer to Add</option>
                  {availableFarmers
                    .filter((f) => !assignedFarmers.some((a: any) => a.farmer_id === f.id))
                    .map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} {farmer.crops?.length ? `- ${Array.isArray(farmer.crops) ? farmer.crops.join(', ') : farmer.crops}` : ''}
                      </option>
                    ))}
                </select>

                {assignedFarmers.length > 0 && (
                  <div className="divide-y divide-culinary-outline rounded-none border border-culinary-outline">
                    {assignedFarmers.map((assignment: any) => (
                      <div key={assignment.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-culinary-ink">{assignment.farmer?.name ?? 'Farmer'}</p>
                          <p className="text-sm text-culinary-text-muted">{assignment.role || 'General supplier'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFarmer(assignment.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Team Coordination Notes */}
            <div>
              <label className="block text-sm font-medium text-culinary-ink mb-2">
                Team Coordination Notes
              </label>
              <textarea
                value={teamNotes}
                onChange={(e) => setTeamNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about team coordination, special instructions, delivery details..."
                className="w-full px-4 py-3 border border-culinary-outline rounded-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveTeamAssignments}
              disabled={teamSaving}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-none hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {teamSaving ? 'Saving...' : 'Save Team Assignments'}
            </button>
          </div>
        )}
      </CulinaryCard>

      <div className="mt-stack-md border border-culinary-outline bg-culinary-surface-low p-gutter font-culinary-sans text-body-md text-culinary-text-muted">
        <strong className="text-culinary-ink">Keyboard Shortcuts:</strong>{' '}
        ⌘/Ctrl + S = Save Changes | ⌘/Ctrl + K = Copy Portal Link | ⌘/Ctrl + Q = Toggle Quote | ⌘/Ctrl + T = Toggle Team
      </div>

      {/* Non-blocking status suggestion modal */}
      {statusSuggestionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="mx-4 w-full max-w-md border border-culinary-outline bg-culinary-bone p-gutter shadow-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-suggestion-title"
          >
            <h3 id="status-suggestion-title" className="mb-stack-sm font-culinary-display text-title-md text-culinary-navy">
              Update booking status
            </h3>
            <p className="mb-stack-lg font-culinary-sans text-body-md text-culinary-text-muted">
              {statusSuggestionPrompt === 'quoted' &&
                'Quote saved. Mark this booking as Quoted?'}
              {statusSuggestionPrompt === 'booked' &&
                'Deposit request opened. Mark this booking as Booked?'}
              {statusSuggestionPrompt === 'confirmed' &&
                'Deposit received. Mark this booking as Confirmed?'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleNotNowStatusSuggestion}
                disabled={isStatusSuggestionBusy}
                className="rounded-none border border-culinary-outline bg-culinary-bone px-4 py-2 font-culinary-sans text-label-caps text-culinary-navy transition refined hover:bg-culinary-surface-high disabled:cursor-not-allowed disabled:opacity-50"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusSuggestion}
                disabled={isStatusSuggestionBusy}
                className="rounded-none border border-culinary-navy bg-culinary-navy px-4 py-2 font-culinary-sans text-label-caps text-culinary-on-navy transition refined hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStatusSuggestionBusy ? 'Updating...' : 'Yes, update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


