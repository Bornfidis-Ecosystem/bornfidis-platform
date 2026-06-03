'use client'

import { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import { BookingInquiry, QuoteLineItem } from '@/types/booking'
import { formatUSD, centsToDollars } from '@/lib/money'

interface BookingInvoiceClientProps {
  booking: BookingInquiry
  lineItems: QuoteLineItem[]
}

export default function BookingInvoiceClient({ booking, lineItems }: BookingInvoiceClientProps) {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate totals
  const subtotalCents = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price_cents)
  }, 0)
  
  const taxCents = booking.tax_cents || 0
  const serviceFeeCents = booking.service_fee_cents || 0
  const totalCents = subtotalCents + taxCents + serviceFeeCents
  
  const depositPaidCents = booking.deposit_amount_cents || 0
  const balanceDueCents = totalCents - depositPaidCents

  // Payment status
  const depositPaid = !!booking.paid_at && depositPaidCents > 0
  const balancePaid = !!booking.balance_paid_at
  const fullyPaid = !!booking.fully_paid_at

  const handlePayBalance = async () => {
    if (balanceDueCents <= 0) {
      setMessage({ type: 'error', text: 'No balance due' })
      return
    }

    if (!depositPaid) {
      setMessage({ type: 'error', text: 'Deposit must be paid first' })
      return
    }

    if (balancePaid) {
      setMessage({ type: 'error', text: 'Balance has already been paid' })
      return
    }

    setIsCreatingPayment(true)
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
        throw new Error(data.error || 'Failed to create payment session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'No checkout URL received' })
        setIsCreatingPayment(false)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create payment link' })
      setIsCreatingPayment(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-navy pb-4">
          <h1 className="text-3xl font-bold text-navy">Bornfidis Provisions</h1>
          <p className="text-gray-600 text-sm mt-1">Faith-anchored culinary excellence</p>
          <h2 className="text-2xl font-bold text-navy mt-4">INVOICE</h2>
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

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Invoice Date:</span>
            <span className="ml-2 text-gray-900">
              {booking.quote_updated_at
                ? new Date(booking.quote_updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Invoice #:</span>
            <span className="ml-2 text-gray-900">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Client Information */}
        <div>
          <h3 className="text-lg font-semibold text-navy mb-3 border-b border-gold pb-2">Bill To</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{booking.name}</span>
            </div>
            {booking.email && (
              <div>
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{booking.email}</span>
              </div>
            )}
            {booking.phone && (
              <div>
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{booking.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div>
          <h3 className="text-lg font-semibold text-navy mb-3 border-b border-gold pb-2">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Event Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(booking.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {booking.event_time && (
              <div>
                <span className="font-semibold text-gray-700">Event Time:</span>
                <span className="ml-2 text-gray-900">{booking.event_time}</span>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="font-semibold text-gray-700">Location:</span>
              <span className="ml-2 text-gray-900">{booking.location}</span>
            </div>
            {booking.guests && (
              <div>
                <span className="font-semibold text-gray-700">Number of Guests:</span>
                <span className="ml-2 text-gray-900">{booking.guests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="text-lg font-semibold text-navy mb-3 border-b border-gold pb-2">Services</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-navy text-white text-sm">
                  <th className="border p-2 text-left">Item</th>
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-center w-20">Qty</th>
                  <th className="border p-2 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border p-4 text-center text-gray-500">
                      No items
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => {
                    const lineTotal = item.quantity * item.unit_price_cents
                    return (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="border p-2 text-sm">{item.title}</td>
                        <td className="border p-2 text-sm text-gray-600">{item.description || '—'}</td>
                        <td className="border p-2 text-sm text-center">{item.quantity}</td>
                        <td className="border p-2 text-sm text-right font-medium">{formatUSD(lineTotal)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 ml-auto w-64">
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
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gold">
          <h3 className="text-lg font-semibold text-navy mb-3">Payment Summary</h3>
          <div className="space-y-2">
            {depositPaidCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit Received:</span>
                <span className="font-medium text-green-600">-{formatUSD(depositPaidCents)}</span>
              </div>
            )}
            {booking.paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit Paid On:</span>
                <span className="text-gray-900">
                  {new Date(booking.paid_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {balanceDueCents > 0 && (
              <div className="flex justify-between text-base font-bold text-orange-600 border-t pt-2 mt-2">
                <span>Balance Due:</span>
                <span>{formatUSD(balanceDueCents)}</span>
              </div>
            )}
            {balanceDueCents <= 0 && depositPaidCents > 0 && (
              <div className="flex justify-between text-base font-bold text-green-600 border-t pt-2 mt-2">
                <span>Fully Paid</span>
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

        {/* Notes */}
        {booking.quote_notes && (
          <div>
            <h3 className="text-lg font-semibold text-navy mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.quote_notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {totalCents > 0 && (
            <PDFDownloadLink
              document={<InvoicePdfDocument booking={booking} lineItems={lineItems} />}
              fileName={`invoice-${booking.name.replace(/\s+/g, '-')}-${booking.id.slice(0, 8)}.pdf`}
              className="px-6 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Download Invoice PDF
            </PDFDownloadLink>
          )}

          {balanceDueCents > 0 && depositPaid && !balancePaid && (
            <button
              onClick={handlePayBalance}
              disabled={isCreatingPayment}
              className="px-6 py-2 bg-gold text-navy rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreatingPayment ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                `Pay Balance (${formatUSD(balanceDueCents)})`
              )}
            </button>
          )}

          {balancePaid && (
            <div className="px-6 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
              Balance Paid ✓
            </div>
          )}
        </div>

        {/* Blessing Footer */}
        <div className="mt-8 pt-6 border-t text-center bg-gray-50 rounded-lg p-6">
          <p className="text-navy italic text-sm leading-relaxed">
            "May the Lord bless you and keep you;<br />
            the Lord make his face shine on you and be gracious to you;<br />
            the Lord turn his face toward you and give you peace."<br />
            <span className="mt-2 block">— Numbers 6:24-26</span>
          </p>
        </div>
      </div>
    </div>
  )
}

