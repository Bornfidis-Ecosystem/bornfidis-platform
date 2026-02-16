'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import toast from 'react-hot-toast'
import { updateBooking, updateBookingQuote } from '../actions'
import { BookingInquiry, BookingStatus, QuoteLineItem } from '@/types/booking'
import { dollarsToCents, centsToDollars, formatUSD, parseDollarsToCents } from '@/lib/money'
import { isStripeConfigured } from '@/lib/stripe'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import { StatusWorkflow } from '@/components/booking/StatusWorkflow'

interface BookingDetailClientProps {
  booking: BookingInquiry
}

/**
 * Client component for booking detail page
 * Handles status updates and admin notes with real-time feedback
 */
export default function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<BookingStatus>(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '')
  const [isSaving, setIsSaving] = useState(false)

  // Portal token state
  const [portalToken, setPortalToken] = useState<string | null>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [isTokenRevoked, setIsTokenRevoked] = useState(false)

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

  // Single source of status options (no duplicates by value)
  const statusOptions: { value: BookingStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'booked', label: 'Booked' },
    { value: 'declined', label: 'Declined' },
  ].filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateBooking(booking.id, {
        status,
        admin_notes: adminNotes,
      })
      if (result.success) {
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
        router.refresh()
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
    <div className="space-y-6 overflow-x-hidden max-w-full">
      <StatusWorkflow currentStatus={status} />

      {/* Admin Actions */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Admin Actions
        </h2>

        <div className="space-y-4">
          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2">
              Booking Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? 'Processing...' : '✕ Decline'}
              </button>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label htmlFor="admin_notes" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              Internal Notes
              <span className="text-xs text-gray-500 font-normal" title="Only admins can see these notes">
                ℹ️ Only admins can see these notes
              </span>
            </label>
            <textarea
              id="admin_notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              placeholder="e.g. call notes, follow-ups, dietary notes, issues (only visible to admins)"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
            />
          </div>

          {/* Action Buttons: Save (primary) + Copy Portal Link (secondary) side by side */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex-1 min-w-[140px] px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCopyPortalUrl}
              className="shrink-0 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              📋 Copy Portal Link
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up Date (if exists) */}
      {booking.follow_up_date && (
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Follow-up Date</label>
          <p className="text-gray-900">
            {new Date(booking.follow_up_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Quote & Payment - Collapsible */}
      <div className="bg-white border rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setQuoteExpanded(!quoteExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-900">Quote & Payment</h2>
              <p className="text-sm text-gray-500">
                {lineItems.length === 0
                  ? 'No quote created yet'
                  : `Total: $${calculateTotal().toFixed(2)}`}
              </p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">
            {quoteExpanded ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>

        {quoteExpanded && (
          <div className="px-6 pb-6 border-t space-y-6 transition-all duration-300 ease-in-out">
            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
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

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800 text-white">
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
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No items yet. Click &quot;Add Item&quot; to get started.
                        </td>
                      </tr>
                    ) : (
                      lineItems.map((item, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Service name"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
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
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                              placeholder="0.00"
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
              <label htmlFor="quote_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Quote Notes (for customer)
              </label>
              <textarea
                id="quote_notes"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={3}
                placeholder="Add notes for the customer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
              />
            </div>

            {/* Tax, Service Fee, Deposit % */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax (USD)
                </label>
                <input
                  type="text"
                  id="tax"
                  value={taxDollars}
                  onChange={(e) => setTaxDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="service_fee" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Fee (USD)
                </label>
                <input
                  type="text"
                  id="service_fee"
                  value={serviceFeeDollars}
                  onChange={(e) => setServiceFeeDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="deposit_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Percentage
                </label>
                <input
                  type="number"
                  id="deposit_percentage"
                  min={0}
                  max={100}
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="region_code" className="block text-sm font-medium text-gray-700 mb-2">
                  Region (Phase 2AL)
                </label>
                <select
                  id="region_code"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">No region</option>
                  {regionOptions.map((r) => (
                    <option key={r.regionCode} value={r.regionCode}>
                      {r.regionCode} {r.name ? `(${r.name})` : ''}
                    </option>
                  ))}
                </select>
                {regionCode && (
                  <p className="text-xs text-gray-500 mt-1">Multiplier + travel fee + minimum applied on save; locked at quote time.</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-2 border-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span>{formatUSD(subtotalCents)}</span>
              </div>
              {regionCode && previewJobCents != null && previewJobCents !== subtotalCents && (
                <div className="flex justify-between text-base text-gray-600">
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
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatUSD(totalCents)}</span>
              </div>
              {booking.surge_label && (
                <p className="text-sm text-amber-700 font-medium">{booking.surge_label}</p>
              )}
              <div className="flex justify-between text-lg font-bold bg-gray-800 text-white px-3 py-2 rounded -mx-2 -mb-2 mt-2">
                <span>Deposit ({depositPercentage}%):</span>
                <span>{formatUSD(depositCents)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Status</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Deposit Paid:</span>
                  <span className={`ml-2 font-medium ${depositPaid ? 'text-green-600' : 'text-gray-400'}`}>
                    {depositPaid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Balance Paid:</span>
                  <span className={`ml-2 font-medium ${balancePaid ? 'text-green-600' : 'text-gray-400'}`}>
                    {balancePaid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fully Paid:</span>
                  <span className={`ml-2 font-medium ${fullyPaid ? 'text-green-600' : 'text-gray-400'}`}>
                    {fullyPaid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Quote */}
            <button
              type="button"
              onClick={handleSaveQuote}
              disabled={isSavingQuote || lineItems.length === 0}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSavingQuote ? 'Saving...' : 'Save Quote'}
            </button>

            {/* Download Invoice when fully paid */}
            {fullyPaid && lineItems.length > 0 && (
              <PDFDownloadLink
                document={<InvoicePdfDocument booking={booking} lineItems={lineItems} />}
                fileName={`invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
                className="block w-full px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-opacity-90 transition text-center"
              >
                Download Invoice
              </PDFDownloadLink>
            )}

            {/* Stripe note when not configured */}
            {!isStripeConfigured() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> Stripe not configured. Track payments manually in Payment Status above.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phase 4B: Customer Portal Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Customer Portal</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {portalToken && !isTokenRevoked ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portal Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portalUrl || ''}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyPortalUrl}
                    className="px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this link with the customer to access their booking portal.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGeneratePortalToken(true)}
                  disabled={isGeneratingToken}
                  className="px-4 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGeneratingToken ? 'Rotating...' : 'Rotate Link'}
                </button>
              </div>
            </>
          ) : isTokenRevoked ? (
            <>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-semibold mb-2">Portal Link Revoked</p>
                <p className="text-xs text-yellow-700">The previous portal link has been revoked. Generate a new link to share with the customer.</p>
              </div>
              <button
                onClick={() => handleGeneratePortalToken(false)}
                disabled={isGeneratingToken}
                className="px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingToken ? 'Generating...' : 'Generate Portal Link'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Generate a secure portal link for the customer to view their booking, make payments, and download invoices.
              </p>
              <button
                onClick={() => handleGeneratePortalToken(false)}
                disabled={isGeneratingToken}
                className="px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingToken ? 'Generating...' : 'Generate Portal Link'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Team Assignment - Collapsible */}
      <div className="bg-white border rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setTeamExpanded(!teamExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🍳</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-900">Team Assignment</h2>
              <p className="text-sm text-gray-500">
                {assignedChef ? `Chef: ${assignedChef.name}` : 'Chef: Not assigned'} |{' '}
                {assignedFarmers.length > 0 ? ` Farmers: ${assignedFarmers.length}` : ' Farmers: None'}
              </p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">
            {teamExpanded ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>

        {teamExpanded && (
          <div className="px-6 pb-6 border-t space-y-6 pt-6 transition-all duration-300 ease-in-out">
            {/* Phase 2AD: Recommended Chefs (scheduling optimizer) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Recommended Chefs
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Ranked by tier (40%), performance (40%), workload balance (20%). Only available chefs with no conflict.
              </p>
              {recommendedLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : recommendedWarning && recommendedChefs.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{recommendedWarning}</p>
                </div>
              ) : recommendedChefs.length > 0 ? (
                <ul className="space-y-2 mb-2">
                  {recommendedChefs.map((rec) => (
                    <li key={rec.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="font-medium text-gray-900">{rec.name}</span>
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">{rec.tierLabel}</span>
                        {rec.lastRating != null && (
                          <span className="ml-2 text-sm text-gray-600">Rating {rec.lastRating}</span>
                        )}
                        <span className="ml-2 text-xs text-green-600">{rec.availabilityStatus}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleChefAssignment(rec.id)}
                        disabled={teamSaving}
                        className="px-3 py-1.5 text-sm bg-forestDark text-white rounded hover:bg-[#144a30] disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recommendations (no event date or no eligible chefs).</p>
              )}
            </div>

            {/* Assign Chef */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Assign Chef
              </h3>
              {activeChefs.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Chef</option>
                    {activeChefs.map((chef) => (
                      <option key={chef.id} value={chef.id} title={chef.featured ? 'Top-rated, verified chef' : undefined}>
                        {chef.featured ? '⭐ Featured · ' : ''}{chef.name}{chef.tierLabel ? ` — ${chef.tierLabel}` : ''}{chef.specialties?.length ? ` · ${Array.isArray(chef.specialties) ? chef.specialties.join(', ') : chef.specialties}` : ''}
                      </option>
                    ))}
                  </select>
                  <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={overrideAvailability}
                      onChange={(e) => setOverrideAvailability(e.target.checked)}
                    />
                    Override availability (assign even if chef marked unavailable or double-booked)
                  </label>
                </>
              )}
            </div>

            {/* Assign Farmers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Assign Farmers
              </h3>
              <div className="space-y-3">
                <select
                  value=""
                  onChange={(e) => handleFarmerAssignment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <div className="border rounded-lg divide-y">
                    {assignedFarmers.map((assignment: any) => (
                      <div key={assignment.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{assignment.farmer?.name ?? 'Farmer'}</p>
                          <p className="text-sm text-gray-500">{assignment.role || 'General supplier'}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Coordination Notes
              </label>
              <textarea
                value={teamNotes}
                onChange={(e) => setTeamNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about team coordination, special instructions, delivery details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveTeamAssignments}
              disabled={teamSaving}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {teamSaving ? 'Saving...' : 'Save Team Assignments'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <strong>Keyboard Shortcuts:</strong>{' '}
        ⌘/Ctrl + S = Save Changes | ⌘/Ctrl + K = Copy Portal Link | ⌘/Ctrl + Q = Toggle Quote | ⌘/Ctrl + T = Toggle Team
      </div>
    </div>
  )
}


