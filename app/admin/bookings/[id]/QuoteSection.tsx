'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { getQuote, saveQuote, markQuoteSent, createStripeDepositLink } from '../quote-actions'
import { QuotePdfDocument } from '@/components/pdf/QuotePdf'
import { QuoteItem, QuoteDraft, BookingQuote } from '@/types/quote'
import { BookingInquiry } from '@/types/booking'
import { formatMoney, centsToDollars, dollarsToCents, parseDollarsToCents } from '@/lib/money'
import { isStripeConfigured } from '@/lib/stripe'

interface QuoteSectionProps {
  booking: BookingInquiry
}

export default function QuoteSection({ booking }: QuoteSectionProps) {
  const router = useRouter()
  const [quote, setQuote] = useState<BookingQuote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Local state for editing
  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState('')
  const [taxDollars, setTaxDollars] = useState('')
  const [depositPercent, setDepositPercent] = useState(30)

  // Load quote on mount
  useEffect(() => {
    loadQuote()
  }, [booking.id])

  const loadQuote = async () => {
    setIsLoading(true)
    try {
      const result = await getQuote(booking.id)
      if (result.success && result.quote) {
        setQuote(result.quote)
        setItems(result.quote.items || [])
        setNotes(result.quote.notes || '')
        setTaxDollars(result.quote.tax_cents > 0 ? centsToDollars(result.quote.tax_cents).toFixed(2) : '')
        if (result.quote.total_cents > 0) {
          const percent = Math.round((result.quote.deposit_cents / result.quote.total_cents) * 100)
          setDepositPercent(percent)
        }
      } else {
        // Initialize empty quote
        setItems([])
        setNotes('')
        setTaxDollars('')
        setDepositPercent(30)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to load quote' })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        booking_id: booking.id,
        title: '',
        description: '',
        quantity: 1,
        unit_price_cents: 0,
        line_total_cents: 0,
        sort_order: items.length,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })))
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }

    // Recalculate line total if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price_cents') {
      const item = updated[index]
      const unitPrice = field === 'unit_price_cents' ? parseDollarsToCents(String(value)) : item.unit_price_cents
      const quantity = field === 'quantity' ? Number(value) : item.quantity
      updated[index].line_total_cents = unitPrice * quantity
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

      const draft: QuoteDraft = {
        items: validItems,
        notes: notes || undefined,
        tax_dollars: taxDollars ? parseFloat(taxDollars) : undefined,
        deposit_percent: depositPercent,
      }

      const result = await saveQuote(booking.id, draft)
      if (result.success && result.quote) {
        setQuote(result.quote)
        setMessage({ type: 'success', text: 'Quote saved successfully!' })
        router.refresh()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save quote' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkQuoteSent = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const result = await markQuoteSent(booking.id)
      if (result.success) {
        setMessage({ type: 'success', text: 'Quote marked as sent!' })
        router.refresh()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to mark quote as sent' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateDepositLink = async () => {
    setIsCreatingLink(true)
    setMessage(null)

    try {
      const result = await createStripeDepositLink(booking.id)
      if (result.success && result.url) {
        window.open(result.url, '_blank')
        setMessage({ type: 'success', text: 'Payment link created! Opening in new tab...' })
        router.refresh()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create payment link' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsCreatingLink(false)
    }
  }

  // Calculate totals locally for display
  const subtotalCents = items.reduce((sum, item) => sum + item.line_total_cents, 0)
  const taxCents = taxDollars ? dollarsToCents(parseFloat(taxDollars) || 0) : 0
  const totalCents = subtotalCents + taxCents
  const depositCents = Math.round((totalCents * depositPercent) / 100)

  if (isLoading) {
    return (
      <div className="border-t pt-6">
        <div className="text-center text-gray-500">Loading quote...</div>
      </div>
    )
  }

  const currentQuote: BookingQuote = quote || {
    booking_id: booking.id,
    currency: 'USD',
    subtotal_cents: subtotalCents,
    tax_cents: taxCents,
    total_cents: totalCents,
    deposit_cents: depositCents,
    items: items,
    notes: notes,
  }

  return (
    <div className="border-t pt-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-navy">Quote & Deposit</h2>
        {quote && quote.quote_sent_at && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Sent on {new Date(quote.quote_sent_at).toLocaleDateString()}
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
                <th className="border p-2 text-right w-32">Total</th>
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
                items.map((item, index) => (
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
                        value={formatMoney(item.unit_price_cents, 'USD').replace('$', '')}
                        onChange={(e) => {
                          const cents = parseDollarsToCents(e.target.value)
                          updateItem(index, 'unit_price_cents', cents)
                        }}
                        placeholder="0.00"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                      />
                    </td>
                    <td className="border p-2 text-right text-sm font-medium">
                      {formatMoney(item.line_total_cents, 'USD')}
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
                ))
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes for the customer (e.g., payment terms, special instructions)..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent resize-y"
        />
      </div>

      {/* Tax and Deposit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <span className="font-medium">{formatMoney(subtotalCents, 'USD')}</span>
          </div>
          {taxCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatMoney(taxCents, 'USD')}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-navy border-t pt-2 mt-2">
            <span>Total:</span>
            <span>{formatMoney(totalCents, 'USD')}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gold bg-navy -mx-4 -mb-4 px-4 py-2 mt-2 rounded-b-lg">
            <span>Deposit ({depositPercent}%):</span>
            <span>{formatMoney(depositCents, 'USD')}</span>
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
            document={<QuotePdfDocument booking={booking} quote={currentQuote} />}
            fileName={`quote-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
            className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Generate PDF
          </PDFDownloadLink>
        )}

        {isStripeConfigured() ? (
          <button
            onClick={handleCreateDepositLink}
            disabled={isCreatingLink || totalCents === 0 || depositCents === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingLink ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Deposit Link'
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

        {quote && quote.total_cents > 0 && (
          <button
            onClick={handleMarkQuoteSent}
            disabled={isSaving || !!quote.quote_sent_at}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quote.quote_sent_at ? 'Quote Already Sent' : 'Mark as Quote Sent'}
          </button>
        )}

        {quote && quote.stripe_payment_link_url && (
          <a
            href={quote.stripe_payment_link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition inline-block"
          >
            View Payment Link
          </a>
        )}
      </div>

      {/* Payment Status */}
      {quote && quote.stripe_payment_status && (
        <div className="text-sm">
          <span className="text-gray-600">Payment Status: </span>
          <span
            className={`font-medium ${
              quote.stripe_payment_status === 'paid'
                ? 'text-green-600'
                : quote.stripe_payment_status === 'unpaid'
                ? 'text-orange-600'
                : 'text-gray-600'
            }`}
          >
            {quote.stripe_payment_status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
