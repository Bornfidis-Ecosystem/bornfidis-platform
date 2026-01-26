'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { getQuoteLineItems, upsertQuoteLineItems, updateQuoteSummary } from '../actions'
import { BookingInquiry, QuoteLineItem } from '@/types/booking'
import { dollarsToCents, centsToDollars, formatUSD, parseDollarsToCents } from '@/lib/money'
import { isStripeConfigured } from '@/lib/stripe'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'

interface QuoteBuilderProps {
  booking: BookingInquiry
  initialItems: QuoteLineItem[]
}

export default function QuoteBuilder({ booking, initialItems }: QuoteBuilderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [items, setItems] = useState<QuoteLineItem[]>(initialItems)
  const [quoteNotes, setQuoteNotes] = useState(booking.quote_notes || '')
  const [taxDollars, setTaxDollars] = useState(booking.tax_cents ? centsToDollars(booking.tax_cents).toFixed(2) : '')
  const [serviceFeeDollars, setServiceFeeDollars] = useState(booking.service_fee_cents ? centsToDollars(booking.service_fee_cents).toFixed(2) : '')
  const [depositPercent, setDepositPercent] = useState(booking.deposit_percent || 30)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingBalance, setIsCreatingBalance] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check for payment success messages
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'balance_success') {
      setMessage({ type: 'success', text: 'Balance payment successful.' })
      setTimeout(() => setMessage(null), 5000)
      // Clean URL
      router.replace(`/admin/bookings/${booking.id}`, { scroll: false })
    } else if (payment === 'balance_cancel') {
      setMessage({ type: 'error', text: 'Payment canceled.' })
      setTimeout(() => setMessage(null), 5000)
      router.replace(`/admin/bookings/${booking.id}`, { scroll: false })
    }
  }, [searchParams, router, booking.id])

  // Calculate totals
  const subtotalCents = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unit_price_cents
    return sum + lineTotal
  }, 0)

  const taxCents = taxDollars ? dollarsToCents(parseFloat(taxDollars) || 0) : 0
  const serviceFeeCents = serviceFeeDollars ? dollarsToCents(parseFloat(serviceFeeDollars) || 0) : 0
  const totalCents = subtotalCents + taxCents + serviceFeeCents

  // Calculate deposit
  const depositCents = Math.round((totalCents * depositPercent) / 100)
  const depositPaidCents = booking.deposit_amount_cents || 0
  const remainingBalanceCents = totalCents - depositPaidCents

  // Payment status
  const depositPaid = !!booking.paid_at && depositPaidCents > 0
  const balancePaid = !!booking.balance_paid_at
  const fullyPaid = !!booking.fully_paid_at

  const addItem = () => {
    setItems([
      ...items,
      {
        booking_id: booking.id,
        title: '',
        description: '',
        quantity: 1,
        unit_price_cents: 0,
        sort_order: items.length,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })))
  }

  const updateItem = (index: number, field: keyof QuoteLineItem, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }

    // Recalculate line total if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price_cents') {
      const item = updated[index]
      const unitPrice = field === 'unit_price_cents' ? (typeof value === 'string' ? parseDollarsToCents(value) : value) : item.unit_price_cents
      const quantity = field === 'quantity' ? Number(value) : item.quantity
      // Line total is calculated, not stored
    }

    setItems(updated)
  }

  const handleSaveQuote = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Validate items
      const validItems = items.filter((item) => item.title.trim() && item.unit_price_cents > 0)
      if (validItems.length === 0) {
        setMessage({ type: 'error', text: 'Please add at least one item with a title and price' })
        setIsSaving(false)
        return
      }

      // Calculate line totals for each item
      const itemsWithTotals = validItems.map((item) => ({
        ...item,
        // Ensure unit_price_cents is a number
        unit_price_cents: typeof item.unit_price_cents === 'string' ? parseDollarsToCents(String(item.unit_price_cents)) : item.unit_price_cents,
      }))

      // Save line items
      const itemsResult = await upsertQuoteLineItems(booking.id, itemsWithTotals)
      if (!itemsResult.success) {
        setMessage({ type: 'error', text: itemsResult.error || 'Failed to save line items' })
        setIsSaving(false)
        return
      }

      // Save quote summary
      const summaryResult = await updateQuoteSummary(booking.id, {
        quote_notes: quoteNotes || null,
        deposit_percent: depositPercent,
        tax_cents: taxCents,
        service_fee_cents: serviceFeeCents,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        balance_amount_cents: remainingBalanceCents,
        quote_status: booking.quote_status || 'draft',
      })

      if (!summaryResult.success) {
        setMessage({ type: 'error', text: summaryResult.error || 'Failed to save quote summary' })
        setIsSaving(false)
        return
      }

      setMessage({ type: 'success', text: 'Quote saved successfully!' })
      router.refresh()
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendFinalPayment = async () => {
    if (remainingBalanceCents <= 0) {
      setMessage({ type: 'error', text: 'No remaining balance to pay' })
      return
    }

    if (!depositPaid) {
      setMessage({ type: 'error', text: 'Deposit must be paid before sending final payment' })
      return
    }

    if (balancePaid) {
      setMessage({ type: 'error', text: 'Balance has already been paid' })
      return
    }

    setIsCreatingBalance(true)
    setMessage(null)

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
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'No checkout URL received' })
        setIsCreatingBalance(false)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create balance payment link' })
      setIsCreatingBalance(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">Quote Builder</h2>
        {booking.quote_status && booking.quote_status !== 'draft' && (
          <span className={`px-3 py-1 text-sm font-medium rounded ${
            booking.quote_status === 'sent' ? 'bg-blue-100 text-blue-800' :
            booking.quote_status === 'accepted' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {booking.quote_status.charAt(0).toUpperCase() + booking.quote_status.slice(1)}
          </span>
        )}
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Line Items Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Line Items</label>
          <button
            onClick={addItem}
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border p-4 text-center text-gray-500">
                    No items yet. Click "Add Item" to get started.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const lineTotal = item.quantity * (typeof item.unit_price_cents === 'string' ? parseDollarsToCents(String(item.unit_price_cents)) : item.unit_price_cents)
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(index, 'title', e.target.value)}
                          placeholder="Item title"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                        />
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          value={typeof item.unit_price_cents === 'string' ? item.unit_price_cents : formatUSD(item.unit_price_cents).replace('$', '')}
                          onChange={(e) => {
                            const cents = parseDollarsToCents(e.target.value)
                            updateItem(index, 'unit_price_cents', cents)
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
                          onClick={() => removeItem(index)}
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
      <div>
        <label htmlFor="quote_notes" className="block text-sm font-medium text-gray-700 mb-2">
          Quote Notes
        </label>
        <textarea
          id="quote_notes"
          value={quoteNotes}
          onChange={(e) => setQuoteNotes(e.target.value)}
          rows={4}
          placeholder="Add notes for the customer (e.g., payment terms, special instructions)..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
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
          <label htmlFor="deposit_percent" className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Percentage
          </label>
          <input
            type="number"
            id="deposit_percent"
            min="0"
            max="100"
            value={depositPercent}
            onChange={(e) => setDepositPercent(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
        </div>
      </div>

      {/* Totals Panel */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-navy">
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
            <span>Deposit ({depositPercent}%):</span>
            <span>{formatUSD(depositCents)}</span>
          </div>
          {depositPaid && (
            <div className="flex justify-between text-sm text-green-600 mt-2">
              <span>Deposit Paid:</span>
              <span className="font-medium">-{formatUSD(depositPaidCents)}</span>
            </div>
          )}
          {remainingBalanceCents > 0 && (
            <div className="flex justify-between text-base font-bold text-orange-600 border-t pt-2 mt-2">
              <span>Remaining Balance:</span>
              <span>{formatUSD(remainingBalanceCents)}</span>
            </div>
          )}
          {remainingBalanceCents <= 0 && totalCents > 0 && (
            <div className="flex justify-between text-base font-bold text-green-600 border-t pt-2 mt-2">
              <span>Fully Paid:</span>
              <span>✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Status</h3>
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSaveQuote}
          disabled={isSaving || items.length === 0}
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
            'Save Quote'
          )}
        </button>

        {totalCents > 0 && (
          <PDFDownloadLink
            document={<InvoicePdfDocument booking={booking} lineItems={items} />}
            fileName={`invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
            className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Download Invoice PDF
          </PDFDownloadLink>
        )}

        {isStripeConfigured() ? (
          <button
            onClick={handleSendFinalPayment}
            disabled={
              isCreatingBalance ||
              totalCents === 0 ||
              remainingBalanceCents <= 0 ||
              !depositPaid ||
              balancePaid
            }
            className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingBalance ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : balancePaid ? (
              'Balance Paid'
            ) : (
              'Send Final Payment'
            )}
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            title="Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables."
          >
            Stripe Not Configured
          </button>
        )}
      </div>
    </div>
  )
}
