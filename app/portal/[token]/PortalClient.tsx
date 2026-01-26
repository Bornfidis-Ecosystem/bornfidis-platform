'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePdfDocument } from '@/components/pdf/InvoicePdf'
import { formatUSD } from '@/lib/money'
import { QuoteLineItem } from '@/types/booking'

interface PortalData {
  booking_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  event_date: string
  event_time?: string
  location: string
  guests?: number
  status: string
  quote: {
    subtotal_cents: number
    tax_cents: number
    service_fee_cents: number
    total_cents: number
    notes?: string
    line_items: any[]
  }
  deposit: {
    percentage: number
    amount_cents: number
    paid: boolean
    paid_at?: string
  }
  balance: {
    amount_cents: number
    paid: boolean
    paid_at?: string
  }
  fully_paid: boolean
  fully_paid_at?: string
  invoice_available: boolean
}

interface PortalClientProps {
  portalData: PortalData
  token: string
}

export default function PortalClient({ portalData, token }: PortalClientProps) {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancel' | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  
  // Message form state
  const [messageName, setMessageName] = useState(portalData.customer_name || '')
  const [messageEmail, setMessageEmail] = useState(portalData.customer_email || '')
  const [messageText, setMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageStatus, setMessageStatus] = useState<'success' | 'error' | null>(null)

  // Check for payment status in URL
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      setPaymentStatus('success')
      // Clean URL after showing message
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname)
      }, 5000)
    } else if (payment === 'cancel') {
      setPaymentStatus('cancel')
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname)
        setPaymentStatus(null)
      }, 5000)
    }
  }, [searchParams])

  const handlePayDeposit = async () => {
    setIsProcessingPayment(true)
    try {
      const response = await fetch(`/api/portal/${token}/pay-deposit`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create payment session')
        setIsProcessingPayment(false)
      }
    } catch (error) {
      console.error('Error creating deposit payment:', error)
      alert('An error occurred. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  const handlePayBalance = async () => {
    setIsProcessingPayment(true)
    try {
      const response = await fetch(`/api/portal/${token}/pay-balance`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create payment session')
        setIsProcessingPayment(false)
      }
    } catch (error) {
      console.error('Error creating balance payment:', error)
      alert('An error occurred. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingMessage(true)
    setMessageStatus(null)

    try {
      const response = await fetch(`/api/portal/${token}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: messageName,
          email: messageEmail,
          message: messageText,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessageStatus('success')
        setMessageText('')
        setTimeout(() => setMessageStatus(null), 5000)
      } else {
        setMessageStatus('error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessageStatus('error')
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Ensure lineItems is always an array
  const lineItems: QuoteLineItem[] = (() => {
    const items = portalData.quote.line_items
    if (!items) return []
    if (Array.isArray(items)) return items
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })()
  const hasQuote = portalData.quote.total_cents > 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Bornfidis Provisions</h1>
          <div className="h-1 w-24 bg-[#FFBC00]"></div>
          <p className="text-green-100 mt-4 text-sm">Your Booking Portal</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold">✓ Payment successful!</p>
            <p className="text-sm mt-1">Your payment has been processed. Thank you!</p>
          </div>
        )}
        {paymentStatus === 'cancel' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-semibold">Payment canceled</p>
            <p className="text-sm mt-1">You can try again when you're ready.</p>
          </div>
        )}

        {/* Event Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Event Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Event Date</p>
              <p className="font-medium text-gray-900">
                {new Date(portalData.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {portalData.event_time && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Event Time</p>
                <p className="font-medium text-gray-900">{portalData.event_time}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="font-medium text-gray-900">{portalData.location}</p>
            </div>
            {portalData.guests && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Number of Guests</p>
                <p className="font-medium text-gray-900">{portalData.guests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quote Summary Card */}
        {hasQuote ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Quote Summary
            </h2>
            
            {/* Line Items */}
            {lineItems.length > 0 && (
              <div className="mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-semibold">Item</th>
                      <th className="text-right py-2 text-gray-600 font-semibold">Qty</th>
                      <th className="text-right py-2 text-gray-600 font-semibold">Price</th>
                      <th className="text-right py-2 text-gray-600 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="text-right py-3 text-gray-700">{item.quantity}</td>
                        <td className="text-right py-3 text-gray-700">{formatUSD(item.unit_price_cents)}</td>
                        <td className="text-right py-3 font-medium text-gray-900">
                          {formatUSD(item.quantity * item.unit_price_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatUSD(portalData.quote.subtotal_cents)}</span>
              </div>
              {portalData.quote.tax_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatUSD(portalData.quote.tax_cents)}</span>
                </div>
              )}
              {portalData.quote.service_fee_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatUSD(portalData.quote.service_fee_cents)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#1a5f3f] border-t border-gray-300 pt-2 mt-2">
                <span>Total</span>
                <span>{formatUSD(portalData.quote.total_cents)}</span>
              </div>
            </div>

            {portalData.quote.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{portalData.quote.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Quote Summary
            </h2>
            <p className="text-gray-600">Quote is in progress. We'll update this section soon.</p>
          </div>
        )}

        {/* Payment Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Payment Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Deposit ({portalData.deposit.percentage}%)</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">{formatUSD(portalData.deposit.amount_cents)}</span>
                {portalData.deposit.paid ? (
                  <span className="ml-2 text-green-600 text-sm">✓ Paid</span>
                ) : (
                  <span className="ml-2 text-gray-400 text-sm">Pending</span>
                )}
              </div>
            </div>
            {portalData.balance.amount_cents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining Balance</span>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{formatUSD(portalData.balance.amount_cents)}</span>
                  {portalData.balance.paid ? (
                    <span className="ml-2 text-green-600 text-sm">✓ Paid</span>
                  ) : (
                    <span className="ml-2 text-gray-400 text-sm">Pending</span>
                  )}
                </div>
              </div>
            )}
            {portalData.fully_paid && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1a5f3f]">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Fully Paid ✓
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Actions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Payment Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {!portalData.deposit.paid && hasQuote && (
              <button
                onClick={handlePayDeposit}
                disabled={isProcessingPayment}
                className="px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Pay Deposit (${formatUSD(portalData.deposit.amount_cents)})`
                )}
              </button>
            )}
            {portalData.deposit.paid && !portalData.balance.paid && portalData.balance.amount_cents > 0 && (
              <button
                onClick={handlePayBalance}
                disabled={isProcessingPayment}
                className="px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Pay Remaining Balance (${formatUSD(portalData.balance.amount_cents)})`
                )}
              </button>
            )}
            {portalData.fully_paid && portalData.invoice_available && lineItems.length > 0 && (
              <PDFDownloadLink
                document={<InvoicePdfDocument booking={portalData as any} lineItems={lineItems} />}
                fileName={`invoice-${portalData.customer_name.replace(/\s+/g, '-')}-${portalData.booking_id.slice(0, 8)}.pdf`}
                className="px-6 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-[#e6a600] transition flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </PDFDownloadLink>
            )}
            {!hasQuote && (
              <p className="text-gray-500 text-sm">Quote in progress. Payment options will appear once your quote is ready.</p>
            )}
          </div>
        </div>

        {/* Send Message Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Send a Message
          </h2>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label htmlFor="message_name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="message_name"
                value={messageName}
                onChange={(e) => setMessageName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="message_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="message_email"
                value={messageEmail}
                onChange={(e) => setMessageEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="message_text" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message_text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent resize-y"
                placeholder="Ask a question or share any details..."
              />
            </div>
            {messageStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            {messageStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Failed to send message. Please try again.
              </div>
            )}
            <button
              type="submit"
              disabled={isSendingMessage}
              className="px-6 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingMessage ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200">
          <p className="italic">
            "May the Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace."
          </p>
          <p className="mt-2 font-semibold">— Numbers 6:24-26</p>
        </div>
      </main>
    </div>
  )
}
