'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import { updateBooking, updateBookingQuote } from '../actions'
import { BookingInquiry, BookingStatus, QuoteLineItem } from '@/types/booking'
import { dollarsToCents, centsToDollars, formatUSD, parseDollarsToCents } from '@/lib/money'
import { isStripeConfigured } from '@/lib/stripe'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import IngredientSourcingSection from './IngredientSourcingSection'

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
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Portal token state
  const [portalToken, setPortalToken] = useState<string | null>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [isTokenRevoked, setIsTokenRevoked] = useState(false)

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNotes, setDepositNotes] = useState('')
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false)

  // Quote Builder state
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
  const [isRequestingBalance, setIsRequestingBalance] = useState(false)

  // Check for payment success messages
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      setSaveMessage({ type: 'success', text: 'Payment successful!' })
      setTimeout(() => setSaveMessage(null), 5000)
      router.replace(`/admin/bookings/${booking.id}`, { scroll: false })
    } else if (payment === 'cancel') {
      setSaveMessage({ type: 'error', text: 'Payment canceled.' })
      setTimeout(() => setSaveMessage(null), 5000)
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
        setSaveMessage({ type: 'success', text: force ? 'Portal link rotated successfully!' : 'Portal link generated successfully!' })
        router.refresh()
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to generate portal link' })
      }
    } catch (error) {
      console.error('Error generating portal token:', error)
      setSaveMessage({ type: 'error', text: 'Failed to generate portal link' })
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const handleCopyPortalUrl = () => {
    if (portalUrl) {
      navigator.clipboard.writeText(portalUrl)
      setSaveMessage({ type: 'success', text: 'Portal URL copied to clipboard!' })
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const statusOptions: { value: BookingStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'booked', label: 'Booked' },
    { value: 'declined', label: 'Declined' },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await updateBooking(booking.id, {
        status,
        admin_notes: adminNotes,
      })

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Booking updated successfully!' })
        // Refresh the page data
        router.refresh()
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to update booking' })
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = status !== booking.status || adminNotes !== (booking.admin_notes || '')

  // Calculate quote totals
  const subtotalCents = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price_cents)
  }, 0)
  const taxCents = taxDollars ? dollarsToCents(parseFloat(taxDollars) || 0) : 0
  const serviceFeeCents = serviceFeeDollars ? dollarsToCents(parseFloat(serviceFeeDollars) || 0) : 0
  const totalCents = subtotalCents + taxCents + serviceFeeCents
  const depositCents = Math.round((totalCents * depositPercentage) / 100)
  const balanceCents = Math.max(totalCents - depositCents, 0)

  // Payment status
  const depositPaid = !!booking.paid_at && (booking.deposit_amount_cents || 0) > 0
  const balancePaid = !!booking.balance_paid_at
  const fullyPaid = !!booking.fully_paid_at

  // Quote Builder handlers
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
    setSaveMessage(null)

    try {
      // Validate line items
      const validItems = lineItems.filter((item) => item.title.trim() && item.unit_price_cents > 0)
      if (validItems.length === 0) {
        setSaveMessage({ type: 'error', text: 'Please add at least one item with a title and price' })
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
        setSaveMessage({ type: 'success', text: 'Quote saved successfully!' })
        router.refresh()
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save quote' })
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSavingQuote(false)
    }
  }

  const handleRequestBalance = async () => {
    if (!depositPaid) {
      setSaveMessage({ type: 'error', text: 'Deposit must be paid before requesting balance payment' })
      return
    }

    if (balancePaid) {
      setSaveMessage({ type: 'error', text: 'Balance has already been paid' })
      return
    }

    if (balanceCents <= 0) {
      setSaveMessage({ type: 'error', text: 'No balance due' })
      return
    }

    setIsRequestingBalance(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/stripe/create-balance-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.id,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create balance payment session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setSaveMessage({ type: 'error', text: 'No checkout URL received' })
        setIsRequestingBalance(false)
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to create balance payment link' })
      setIsRequestingBalance(false)
    }
  }

  const handleCreateDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setSaveMessage({ type: 'error', text: 'Please enter a valid deposit amount' })
      return
    }

    setIsCreatingDeposit(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/stripe/create-deposit-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: parseFloat(depositAmount),
          customer_email: booking.email,
          customer_name: booking.name,
          internal_notes: depositNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create deposit session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setSaveMessage({ type: 'error', text: 'No checkout URL received' })
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to create deposit payment link' })
      setIsCreatingDeposit(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Dropdown */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as BookingStatus)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Phase 1.5: Quick Action Buttons */}
      {(status === 'pending' || status === 'reviewed') && (
        <div className="flex gap-3">
          <button
            onClick={async () => {
              setIsSaving(true)
              setSaveMessage(null)
              try {
                const result = await updateBooking(booking.id, {
                  status: 'booked',
                  admin_notes: adminNotes,
                })
                if (result.success) {
                  setStatus('booked')
                  setSaveMessage({ type: 'success', text: 'Booking approved! Confirmation email sent to customer.' })
                  router.refresh()
                  setTimeout(() => setSaveMessage(null), 5000)
                } else {
                  setSaveMessage({ type: 'error', text: result.error || 'Failed to approve booking' })
                }
              } catch (error: any) {
                setSaveMessage({ type: 'error', text: error.message || 'An error occurred' })
              } finally {
                setIsSaving(false)
              }
            }}
            disabled={isSaving}
            className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                ✓ Approve Booking
              </>
            )}
          </button>
          <button
            onClick={async () => {
              setIsSaving(true)
              setSaveMessage(null)
              try {
                const result = await updateBooking(booking.id, {
                  status: 'declined',
                  admin_notes: adminNotes,
                })
                if (result.success) {
                  setStatus('declined')
                  setSaveMessage({ type: 'success', text: 'Booking declined. Notification email sent to customer.' })
                  router.refresh()
                  setTimeout(() => setSaveMessage(null), 5000)
                } else {
                  setSaveMessage({ type: 'error', text: result.error || 'Failed to decline booking' })
                }
              } catch (error: any) {
                setSaveMessage({ type: 'error', text: error.message || 'An error occurred' })
              } finally {
                setIsSaving(false)
              }
            }}
            disabled={isSaving}
            className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                ✕ Decline
              </>
            )}
          </button>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
          Admin Notes
        </label>
        <textarea
          id="admin_notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={6}
          placeholder="Add internal notes about this booking..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">These notes are only visible to admins.</p>
      </div>

      {/* Save Button & Feedback */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-6 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        {saveMessage && (
          <div
            className={`px-4 py-2 rounded-lg ${saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {saveMessage.text}
          </div>
        )}

        {hasChanges && !saveMessage && (
          <span className="text-sm text-gray-500">You have unsaved changes</span>
        )}
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

      {/* Quote Builder Section - Phase 3C */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Quote Builder</h3>

        {/* Line Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Line Items</label>
            <button
              onClick={addLineItem}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-navy text-white text-sm">
                  <th className="border p-2 text-left">Title</th>
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-center w-20">Qty</th>
                  <th className="border p-2 text-right w-32">Unit Price</th>
                  <th className="border p-2 text-right w-32">Line Total</th>
                  <th className="border p-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border p-4 text-center text-gray-500">
                      No items yet. Click "Add Item" to get started.
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => {
                    const lineTotal = item.quantity * item.unit_price_cents
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                            placeholder="Item title"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Optional description"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={formatUSD(item.unit_price_cents).replace('$', '')}
                            onChange={(e) => {
                              const cents = parseDollarsToCents(e.target.value)
                              updateLineItem(index, 'unit_price_cents', cents)
                            }}
                            placeholder="0.00"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                          />
                        </td>
                        <td className="border p-2 text-right text-sm font-medium">
                          {formatUSD(lineTotal)}
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quote Notes */}
        <div className="mb-4">
          <label htmlFor="quote_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Quote Notes
          </label>
          <textarea
            id="quote_notes"
            value={quoteNotes}
            onChange={(e) => setQuoteNotes(e.target.value)}
            rows={3}
            placeholder="Add notes for the customer..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
          />
        </div>

        {/* Tax, Service Fee, Deposit % */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="deposit_percentage" className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Percentage
            </label>
            <input
              type="number"
              id="deposit_percentage"
              min="0"
              max="100"
              value={depositPercentage}
              onChange={(e) => setDepositPercentage(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>
        </div>

        {/* Totals Panel */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-navy mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatUSD(subtotalCents)}</span>
            </div>
            {taxCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formatUSD(taxCents)}</span>
              </div>
            )}
            {serviceFeeCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-medium">{formatUSD(serviceFeeCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-navy border-t pt-2 mt-2">
              <span>Total:</span>
              <span>{formatUSD(totalCents)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gold bg-navy -mx-4 -mb-4 px-4 py-2 mt-2 rounded-b-lg">
              <span>Deposit ({depositPercentage}%):</span>
              <span>{formatUSD(depositCents)}</span>
            </div>
            {depositPaid && (
              <div className="flex justify-between text-sm text-green-600 mt-2">
                <span>Deposit Paid:</span>
                <span className="font-medium">-{formatUSD(booking.deposit_amount_cents || 0)}</span>
              </div>
            )}
            {balanceCents > 0 && (
              <div className="flex justify-between text-base font-bold text-orange-600 border-t pt-2 mt-2">
                <span>Balance Due:</span>
                <span>{formatUSD(balanceCents)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status Panel */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Status</h4>
          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
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
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-medium">{formatUSD(totalCents)}</span>
            </div>
            <div>
              <span className="text-gray-600">Deposit Amount:</span>
              <span className="ml-2 font-medium">{formatUSD(booking.deposit_amount_cents || 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Balance Amount:</span>
              <span className="ml-2 font-medium">{formatUSD(booking.balance_amount_cents || balanceCents)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveQuote}
            disabled={isSavingQuote || lineItems.length === 0}
            className="px-6 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSavingQuote ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Quote'
            )}
          </button>

          {isStripeConfigured() ? (
            <>
              {totalCents > 0 && !depositPaid && (
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition"
                >
                  Send Deposit
                </button>
              )}
              {depositPaid && !balancePaid && balanceCents > 0 && (
                <button
                  onClick={handleRequestBalance}
                  disabled={isRequestingBalance}
                  className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRequestingBalance ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Send Balance Payment'
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              disabled
              className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
              title="Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables."
            >
              Stripe Not Configured
            </button>
          )}

          {/* Phase 4A: Download Invoice button (shown when fully paid) */}
          {fullyPaid && lineItems.length > 0 && (
            <PDFDownloadLink
              document={<InvoicePdfDocument booking={booking} lineItems={lineItems} />}
              fileName={`invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
            >
              Download Invoice
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Deposit Payment Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy">Deposit Payment</h3>
            {booking.paid_at && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Paid on {new Date(booking.paid_at).toLocaleDateString()}
                {booking.deposit_amount_cents && (
                  <span className="ml-2">
                    (${(booking.deposit_amount_cents / 100).toFixed(2)})
                  </span>
                )}
              </p>
            )}
            {booking.stripe_session_id && !booking.paid_at && (
              <p className="text-sm text-orange-600 mt-1">
                Payment link created (pending payment)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Send Deposit Payment</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  min="0.01"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  disabled={isCreatingDeposit}
                />
              </div>

              <div>
                <label htmlFor="deposit_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes (optional)
                </label>
                <textarea
                  id="deposit_notes"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this deposit payment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
                  disabled={isCreatingDeposit}
                />
              </div>

              {saveMessage && (
                <div
                  className={`px-4 py-2 rounded-lg ${saveMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateDeposit}
                  disabled={isCreatingDeposit || !depositAmount}
                  className="flex-1 px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingDeposit ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Payment Link'
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsDepositModalOpen(false)
                    setDepositAmount('')
                    setDepositNotes('')
                    setSaveMessage(null)
                  }}
                  disabled={isCreatingDeposit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Phase 5B: Chef Assignment & Payout Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Chef Assignment & Payout</h3>
        <ChefAssignmentSection bookingId={booking.id} bookingTotalCents={totalCents} booking={booking} />
      </div>
    </div>
  )
}

// Phase 5C: Chef Assignment & Payout Component with Slider
function ChefAssignmentSection({ bookingId, bookingTotalCents, booking }: { bookingId: string; bookingTotalCents: number; booking: BookingInquiry }) {
  const [chefs, setChefs] = useState<Array<{ id: string; name: string; payout_percentage: number }>>([])
  const [selectedChefId, setSelectedChefId] = useState('')
  const [payoutPercentage, setPayoutPercentage] = useState(70)
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRunningPayout, setIsRunningPayout] = useState(false)
  const [bookingChef, setBookingChef] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch active chefs
    fetch('/api/admin/chefs/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.chefs) {
          setChefs(data.chefs)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    // Fetch existing booking_chef assignment
    fetch(`/api/admin/bookings/${bookingId}/booking-chef`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.booking_chef) {
          setBookingChef(data.booking_chef)
          setSelectedChefId(data.booking_chef.chef_id)
          setPayoutPercentage(data.booking_chef.payout_percentage || 70)
          setAssignmentNotes(data.booking_chef.notes || '')
        }
      })
      .catch(() => { })
  }, [bookingId])

  // Phase 5C: Calculate payout amounts based on slider
  const chefPayoutCents = Math.round(bookingTotalCents * (payoutPercentage / 100))
  const platformFeeCents = bookingTotalCents - chefPayoutCents

  const handleAssign = async () => {
    if (!selectedChefId) {
      setMessage({ type: 'error', text: 'Please select a chef' })
      return
    }

    if (bookingTotalCents <= 0) {
      setMessage({ type: 'error', text: 'Booking must have a quote total before assigning a chef' })
      return
    }

    setIsAssigning(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign-chef-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chef_id: selectedChefId,
          payout_percentage: payoutPercentage,
          notes: assignmentNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Chef assigned! Payout: $${(data.booking_chef.payout_amount_cents / 100).toFixed(2)}` })
        setBookingChef(data.booking_chef)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to assign chef' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUpdatePayout = async () => {
    if (!bookingChef) return

    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/booking-chef`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payout_percentage: payoutPercentage,
          notes: assignmentNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Payout percentage updated!' })
        setBookingChef(data.booking_chef)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update payout' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveAssignment = async () => {
    if (!confirm('Are you sure you want to remove this chef assignment?')) return

    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/booking-chef`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Chef assignment removed' })
        setBookingChef(null)
        setSelectedChefId('')
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove assignment' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRunPayout = async () => {
    setIsRunningPayout(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/run-payout`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        if (data.payoutCreated) {
          setMessage({ type: 'success', text: `Payout processed! Transfer ID: ${data.transferId}` })
        } else if (data.blockers) {
          setMessage({ type: 'error', text: `Cannot payout: ${data.blockers.join(', ')}` })
        } else {
          setMessage({ type: 'success', text: data.message || 'Payout already processed' })
        }
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to run payout' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsRunningPayout(false)
    }
  }

  const currentPayoutAmount = bookingChef?.payout_amount_cents || booking.chef_payout_amount_cents || chefPayoutCents
  const canRunPayout =
    booking.fully_paid_at &&
    bookingChef &&
    bookingChef.status !== 'paid' &&
    booking.chef_payout_status !== 'paid' &&
    booking.chef_payout_status !== 'blocked'

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading chefs...</div>
  }

  if (chefs.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No active chefs available. Approve and onboard chefs in <a href="/admin/chefs" className="underline">Chef Network</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Phase 5C: Chef Assignment with Payout Slider */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-semibold text-navy mb-2">Assign Chef</h4>
        {bookingChef ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Assigned Chef</p>
                <p className="text-sm text-green-700">{bookingChef.chef?.name || 'Loading...'}</p>
              </div>
              <span className="text-xs text-green-600">✓ Assigned</span>
            </div>
          </div>
        ) : null}
        <div>
          <label htmlFor="chef_select" className="block text-sm font-medium text-gray-700 mb-2">
            {bookingChef ? 'Change Chef' : 'Select Chef'}
          </label>
          <select
            id="chef_select"
            value={selectedChefId}
            onChange={(e) => setSelectedChefId(e.target.value)}
            disabled={!!bookingChef}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">-- Select a chef --</option>
            {chefs.map(chef => (
              <option key={chef.id} value={chef.id}>{chef.name}</option>
            ))}
          </select>
        </div>

        {/* Phase 5C: Payout Split Slider */}
        {bookingTotalCents > 0 && (
          <div>
            <label htmlFor="payout_slider" className="block text-sm font-medium text-gray-700 mb-2">
              Payout Split: <span className="font-semibold text-[#1a5f3f]">{payoutPercentage}%</span> Chef / <span className="font-semibold text-gold">{100 - payoutPercentage}%</span> Platform
            </label>
            <input
              type="range"
              id="payout_slider"
              min="0"
              max="100"
              value={payoutPercentage}
              onChange={(e) => setPayoutPercentage(parseInt(e.target.value))}
              disabled={!!bookingChef && bookingChef.status === 'paid'}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a5f3f] disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, #1a5f3f 0%, #1a5f3f ${payoutPercentage}%, #FFBC00 ${payoutPercentage}%, #FFBC00 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="assignment_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Notes (optional)
          </label>
          <textarea
            id="assignment_notes"
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            rows={2}
            placeholder="Add any notes about this assignment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
          />
        </div>

        {bookingTotalCents > 0 && (
          <div className="bg-white rounded p-3 text-sm space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Booking Total:</span>
              <span className="font-bold text-navy">${(bookingTotalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Chef Payout ({payoutPercentage}%):</span>
              <span className="font-semibold text-[#1a5f3f]">${(chefPayoutCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee ({100 - payoutPercentage}%):</span>
              <span className="font-semibold text-gold">${(platformFeeCents / 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message.text}
          </div>
        )}

        {!bookingChef ? (
          <button
            onClick={handleAssign}
            disabled={isAssigning || !selectedChefId || bookingTotalCents <= 0}
            className="w-full px-4 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning...' : 'Assign Chef'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdatePayout}
              disabled={isUpdating || bookingChef.status === 'paid'}
              className="flex-1 px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Payout Split'}
            </button>
            <button
              onClick={handleRemoveAssignment}
              disabled={isUpdating || bookingChef.status === 'paid'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Phase 5C: Payout Status Panel */}
      {bookingChef && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-navy mb-2">Payout Status</h4>

          <div className="bg-white rounded p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payout Status:</span>
              <span className={`font-medium ${booking.chef_payout_status === 'paid' ? 'text-green-600' :
                booking.chef_payout_status === 'blocked' ? 'text-red-600' :
                  booking.chef_payout_status === 'pending' ? 'text-yellow-600' :
                    'text-gray-400'
                }`}>
                {booking.chef_payout_status || 'not_applicable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payout Amount:</span>
              <span className="font-medium text-[#1a5f3f]">${(currentPayoutAmount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payout Percentage:</span>
              <span className="font-medium">{bookingChef.payout_percentage}%</span>
            </div>
            {booking.chef_payout_paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid At:</span>
                <span className="font-medium text-sm">
                  {new Date(booking.chef_payout_paid_at).toLocaleString()}
                </span>
              </div>
            )}
            {booking.stripe_transfer_id && (
              <div className="flex justify-between">
                <span className="text-gray-600">Stripe Transfer:</span>
                <span className="font-medium text-xs font-mono">{booking.stripe_transfer_id}</span>
              </div>
            )}
            {booking.chef_payout_blockers && booking.chef_payout_blockers.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-red-600 font-medium mb-1">Blockers:</p>
                <ul className="list-disc list-inside text-xs text-red-600">
                  {booking.chef_payout_blockers.map((blocker, idx) => (
                    <li key={idx}>{blocker}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {canRunPayout && (
            <button
              onClick={handleRunPayout}
              disabled={isRunningPayout}
              className="w-full px-4 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningPayout ? 'Processing...' : 'Run Payout Now'}
            </button>
          )}

          {booking.chef_payout_status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">✓ Payout completed</p>
            </div>
          )}

          {booking.chef_payout_status === 'blocked' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">⚠️ Payout blocked</p>
              <p className="text-xs text-red-600 mt-1">Check blockers above and resolve issues before payout can proceed.</p>
            </div>
          )}
        </div>
      )}

      {/* Phase 5D: Job Completion & Payout Hold Controls */}
      {bookingChef && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-navy mb-2">Job Completion & Payout Controls</h4>

          {/* Job Completion Status */}
          <div className="bg-white rounded p-3 text-sm space-y-2 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Job Completion:</span>
              {booking.job_completed_at ? (
                <div className="text-right">
                  <span className="font-medium text-green-600">✓ Completed</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(booking.job_completed_at).toLocaleString()}
                    {booking.job_completed_by && ` by ${booking.job_completed_by}`}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Not completed</span>
              )}
            </div>

            {booking.job_completed_by === 'chef' && !booking.job_completed_at && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/bookings/${bookingId}/confirm-completion`, {
                      method: 'POST',
                    })
                    const data = await response.json()
                    if (data.success) {
                      router.refresh()
                    } else {
                      alert(data.error || 'Failed to confirm completion')
                    }
                  } catch (error) {
                    alert('An error occurred')
                  }
                }}
                className="w-full px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition text-sm"
              >
                Confirm Completion
              </button>
            )}

            {!booking.job_completed_at && booking.job_completed_by !== 'chef' && (
              <p className="text-xs text-gray-500 italic">Chef has not marked job as complete yet.</p>
            )}
          </div>

          {/* Payout Hold Controls */}
          <div className="bg-white rounded p-3 text-sm space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={booking.payout_hold || false}
                  onChange={async (e) => {
                    const hold = e.target.checked
                    const reason = hold ? prompt('Enter reason for payout hold:') : ''
                    if (hold && !reason) {
                      e.target.checked = false
                      return
                    }
                    try {
                      const response = await fetch(`/api/admin/bookings/${bookingId}/payout-hold`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hold, reason }),
                      })
                      const data = await response.json()
                      if (data.success) {
                        router.refresh()
                      } else {
                        alert(data.error || 'Failed to set payout hold')
                        e.target.checked = !hold
                      }
                    } catch (error) {
                      alert('An error occurred')
                      e.target.checked = !hold
                    }
                  }}
                  className="w-4 h-4 text-[#1a5f3f] rounded focus:ring-[#1a5f3f]"
                />
                <span className="text-gray-700 font-medium">Put Payout On Hold</span>
              </label>
              {booking.payout_hold && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">ON HOLD</span>
              )}
            </div>

            {booking.payout_hold && booking.payout_hold_reason && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600 font-medium mb-1">Hold Reason:</p>
                <p className="text-xs text-red-600">{booking.payout_hold_reason}</p>
              </div>
            )}

            {booking.payout_hold && (
              <button
                onClick={async () => {
                  if (!confirm('Release payout hold and attempt payout?')) return
                  try {
                    const response = await fetch(`/api/admin/bookings/${bookingId}/release-payout`, {
                      method: 'POST',
                    })
                    const data = await response.json()
                    if (data.success) {
                      alert(data.message || 'Payout hold released')
                      router.refresh()
                    } else {
                      alert(data.error || 'Failed to release payout')
                    }
                  } catch (error) {
                    alert('An error occurred')
                  }
                }}
                className="w-full px-4 py-2 bg-[#FFBC00] text-navy rounded-lg font-semibold hover:bg-opacity-90 transition text-sm"
              >
                Release Payout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Phase 6A: Farmer Assignment Section */}
      <FarmerAssignmentSection bookingId={bookingId} bookingTotalCents={bookingTotalCents} booking={booking} />

      {/* Phase 6B: Ingredient Sourcing Section */}
      <IngredientSourcingSection bookingId={bookingId} booking={booking} />
    </div>
  )
}

// Phase 6A: Farmer Assignment Component
function FarmerAssignmentSection({ bookingId, bookingTotalCents, booking }: { bookingId: string; bookingTotalCents: number; booking: BookingInquiry }) {
  const [farmers, setFarmers] = useState<Array<{ id: string; name: string; payout_percentage: number }>>([])
  const [selectedFarmerId, setSelectedFarmerId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'produce' | 'fish' | 'meat' | 'dairy' | 'spice' | 'beverage'>('produce')
  const [payoutPercent, setPayoutPercent] = useState(60)
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [bookingFarmers, setBookingFarmers] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch active farmers
    fetch('/api/admin/farmers/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.farmers) {
          setFarmers(data.farmers)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    // Fetch assigned farmers
    fetch(`/api/admin/bookings/${bookingId}/booking-farmers`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.booking_farmers) {
          setBookingFarmers(data.booking_farmers)
        }
      })
      .catch(() => { })
  }, [bookingId])

  const handleAssign = async () => {
    if (!selectedFarmerId) {
      setMessage({ type: 'error', text: 'Please select a farmer' })
      return
    }

    if (bookingTotalCents <= 0) {
      setMessage({ type: 'error', text: 'Booking must have a quote total before assigning a farmer' })
      return
    }

    setIsAssigning(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign-farmer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmer_id: selectedFarmerId,
          role: selectedRole,
          payout_percent: payoutPercent,
          notes: assignmentNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Farmer assigned! Payout: $${(data.booking_farmer.payout_amount_cents / 100).toFixed(2)}` })
        setSelectedFarmerId('')
        setAssignmentNotes('')
        router.refresh()
        // Reload assigned farmers
        fetch(`/api/admin/bookings/${bookingId}/booking-farmers`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.booking_farmers) {
              setBookingFarmers(data.booking_farmers)
            }
          })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to assign farmer' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Remove this farmer assignment?')) return

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/booking-farmers/${assignmentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Farmer assignment removed' })
        router.refresh()
        // Reload assigned farmers
        fetch(`/api/admin/bookings/${bookingId}/booking-farmers`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.booking_farmers) {
              setBookingFarmers(data.booking_farmers)
            }
          })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove assignment' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
  }

  const farmerPayoutCents = Math.round(bookingTotalCents * (payoutPercent / 100))

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading farmers...</div>
  }

  if (farmers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No active farmers available. Approve farmers in <a href="/admin/farmers" className="underline">Island Harvest Hub</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-semibold text-[#1a5f3f] mb-2">Assign Farmers & Producers</h4>

      {/* Assigned Farmers List */}
      {bookingFarmers.length > 0 && (
        <div className="bg-white rounded p-3 space-y-2 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Assigned Farmers:</p>
          {bookingFarmers.map((bf: any) => (
            <div key={bf.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{bf.farmer?.name || 'Loading...'}</div>
                <div className="text-xs text-gray-600">
                  Role: <span className="font-semibold capitalize">{bf.role}</span> •
                  Payout: <span className="font-semibold text-[#1a5f3f]">${(bf.payout_amount_cents / 100).toFixed(2)}</span> ({bf.payout_percent}%)
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Status: <span className={`font-semibold ${bf.payout_status === 'paid' ? 'text-green-600' :
                    bf.payout_status === 'on_hold' ? 'text-red-600' :
                      bf.payout_status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                    }`}>{bf.payout_status}</span>
                </div>
              </div>
              <button
                onClick={() => handleRemove(bf.id)}
                className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign New Farmer */}
      <div className="bg-white rounded p-3 space-y-3 border border-gray-200">
        <div>
          <label htmlFor="farmer_select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Farmer
          </label>
          <select
            id="farmer_select"
            value={selectedFarmerId}
            onChange={(e) => setSelectedFarmerId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          >
            <option value="">-- Select a farmer --</option>
            {farmers.map(farmer => (
              <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="farmer_role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="farmer_role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          >
            <option value="produce">Produce</option>
            <option value="fish">Fish</option>
            <option value="meat">Meat</option>
            <option value="dairy">Dairy</option>
            <option value="spice">Spice</option>
            <option value="beverage">Beverage</option>
          </select>
        </div>

        {bookingTotalCents > 0 && (
          <div>
            <label htmlFor="farmer_payout_slider" className="block text-sm font-medium text-gray-700 mb-1">
              Payout: <span className="font-semibold text-[#1a5f3f]">{payoutPercent}%</span>
            </label>
            <input
              type="range"
              id="farmer_payout_slider"
              min="0"
              max="100"
              value={payoutPercent}
              onChange={(e) => setPayoutPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a5f3f]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Farmer Payout:</span>
                <span className="font-semibold text-[#1a5f3f]">${(farmerPayoutCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="farmer_notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="farmer_notes"
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            rows={2}
            placeholder="Add notes about this assignment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent resize-y"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={isAssigning || !selectedFarmerId || bookingTotalCents <= 0}
          className="w-full px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAssigning ? 'Assigning...' : 'Assign Farmer'}
        </button>
      </div>
    </div>
  )
}
