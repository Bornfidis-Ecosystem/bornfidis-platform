'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast as uiToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/formatCurrency'
import { dollarsToCents } from '@/lib/money'
import {
  MENU_TEMPLATES,
  PACKAGE_TYPES,
  SERVICE_STYLES,
  MenuTemplateId,
  PackageType,
  ServiceStyle,
} from '@/lib/quotes/menuTemplates'
import {
  buildQuotePreview,
  DEFAULT_QUOTE_FORM_STATE,
  QuoteFormState,
  QuotePreview,
  validateQuoteForm,
} from '@/lib/quotes/quoteBuilder'

function formatDateReadable(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function copyText(text: string) {
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      uiToast.success('Copied to clipboard')
      return
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
    uiToast.success('Copied to clipboard')
  } catch {
    uiToast.error('Copy failed. Please try again.')
  }
}

export default function AdminQuotesPage() {
  const searchParams = useSearchParams()
  const didPrefill = useRef(false)

  const [form, setForm] = useState<QuoteFormState>(DEFAULT_QUOTE_FORM_STATE)
  const [quote, setQuote] = useState<QuotePreview | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const hasPrefill = useMemo(() => {
    const clientName = searchParams.get('clientName')
    const guestCount = searchParams.get('guestCount')
    const eventDate = searchParams.get('eventDate')
    return Boolean(clientName || guestCount || eventDate)
  }, [searchParams])

  useEffect(() => {
    if (didPrefill.current) return

    const clientName = searchParams.get('clientName')
    const guestCountRaw = searchParams.get('guestCount')
    const eventDate = searchParams.get('eventDate')

    if (!clientName && !guestCountRaw && !eventDate) return

    setForm((prev) => {
      const guestCount = guestCountRaw ? parseInt(guestCountRaw, 10) : prev.guestCount
      return {
        ...prev,
        clientName: clientName ?? prev.clientName,
        guestCount: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : prev.guestCount,
        eventDate: eventDate ?? prev.eventDate,
      }
    })

    didPrefill.current = true
  }, [searchParams])

  function setNumberField<K extends keyof QuoteFormState>(key: K, raw: string) {
    const n = raw === '' ? 0 : parseFloat(raw)
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }))
  }

  function setIntField<K extends keyof QuoteFormState>(key: K, raw: string) {
    const n = raw === '' ? 0 : parseInt(raw, 10)
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validateQuoteForm(form)
    if (nextErrors.length) {
      setErrors(nextErrors)
      setQuote(null)
      uiToast.error('Please fix the highlighted fields')
      return
    }
    setErrors([])
    setQuote(buildQuotePreview(form))
    uiToast.success('Quote generated')
  }

  return (
    <div className="w-full bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin/quotes"
            className="mb-3 inline-block text-sm font-medium text-green-800 hover:underline"
          >
            ← Event quotes queue
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-navy">Bornfidis Provisions Quote Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create a client-ready quote preview for private chef bookings (no database required).
              </p>
            </div>

            {hasPrefill && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 text-gold text-sm font-semibold">
                Prefilled from booking
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-navy/10 p-5 sm:p-7 print:hidden">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="e.g. Sarah Johnson"
                required
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <input
                id="eventType"
                value={form.eventType}
                onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="e.g. Anniversary Dinner"
                required
              />
            </div>

            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                id="eventDate"
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                required
                title="Select event date"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="e.g. Port Antonio villa"
                required
              />
            </div>

            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                Guest Count
              </label>
              <input
                id="guestCount"
                type="number"
                value={form.guestCount}
                onChange={(e) => setIntField('guestCount', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                min={1}
                placeholder="e.g. 8"
                title="Number of guests"
                required
              />
            </div>

            <div>
              <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-2">
                Package Type
              </label>
              <select
                id="packageType"
                value={form.packageType}
                onChange={(e) => setForm((prev) => ({ ...prev, packageType: e.target.value as PackageType }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              >
                {PACKAGE_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="serviceStyle" className="block text-sm font-medium text-gray-700 mb-2">
                Service Style
              </label>
              <select
                id="serviceStyle"
                value={form.serviceStyle}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceStyle: e.target.value as ServiceStyle }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              >
                {SERVICE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="menuTemplate" className="block text-sm font-medium text-gray-700 mb-2">
                Menu Template
              </label>
              <select
                id="menuTemplate"
                value={form.menuTemplate}
                onChange={(e) => setForm((prev) => ({ ...prev, menuTemplate: e.target.value as MenuTemplateId }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              >
                {MENU_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="customNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Notes
              </label>
              <textarea
                id="customNotes"
                value={form.customNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, customNotes: e.target.value }))}
                className="w-full min-h-[110px] rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="Dietary needs, special requests, timing notes, and anything the client should feel."
              />
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (USD)</label>
                <input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setNumberField('basePrice', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  min={0}
                  placeholder="0.00"
                  title="Base price in USD"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Fee (USD)</label>
                <input
                  id="travelFee"
                  type="number"
                  step="0.01"
                  value={form.travelFee}
                  onChange={(e) => setNumberField('travelFee', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  min={0}
                  placeholder="0.00"
                  title="Travel fee in USD"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staffing Fee (USD)</label>
                <input
                  id="staffingFee"
                  type="number"
                  step="0.01"
                  value={form.staffingFee}
                  onChange={(e) => setNumberField('staffingFee', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  min={0}
                  placeholder="0.00"
                  title="Staffing fee in USD"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add-ons <span className="text-xs text-gray-500">(one per line: Label - Price)</span>
                </label>
                <textarea
                  id="addOns"
                  value={form.addOns}
                  onChange={(e) => setForm((prev) => ({ ...prev, addOns: e.target.value }))}
                  className="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  placeholder={`Extra Course - 120\nChef’s Welcome Cocktail - 90\nDessert Upgrade - 75`}
                  title="Add-ons list (Label - Price per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit % (default 40)</label>
                <input
                  id="depositPercent"
                  type="number"
                  step="1"
                  value={form.depositPercent}
                  onChange={(e) => setNumberField('depositPercent', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  min={0}
                  max={100}
                  placeholder="40"
                  title="Deposit percentage"
                  required
                />

                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Deposit is calculated from the total estimate (base + travel + staffing + add-ons).
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-semibold mb-2">Fix these issues:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button type="submit" className="px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-opacity-90 transition">
                Generate Quote
              </button>

              <button
                type="button"
                className="px-6 py-3 border border-navy/20 text-navy rounded-xl font-semibold hover:bg-navy hover:text-white transition"
                onClick={() => {
                  setForm(DEFAULT_QUOTE_FORM_STATE)
                  setQuote(null)
                  setErrors([])
                  uiToast.info('Form reset')
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 print:hidden">
            <h2 className="text-xl font-bold text-navy">Quote Preview</h2>

            {quote && (
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => copyText(quote.whatsappText)}
                  className="px-4 py-2 bg-gold text-navy font-semibold rounded-xl hover:opacity-90 transition"
                >
                  Copy WhatsApp Reply
                </button>
                <button
                  type="button"
                  onClick={() => copyText(quote.emailText)}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-xl hover:bg-navy hover:text-white transition"
                >
                  Copy Email Quote
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-navy/20 text-navy font-semibold rounded-xl hover:bg-navy hover:text-white transition"
                >
                  Print Quote
                </button>
              </div>
            )}
          </div>

          {quote ? (
            <div className="bg-white rounded-2xl border border-navy/10 shadow-sm p-5 sm:p-7 print:block">
              <div className="grid gap-4 md:grid-cols-3 md:items-start">
                <div className="md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <h3 className="text-2xl font-bold text-navy">Client Quote</h3>
                    <p className="text-sm text-gray-600">{quote.menuTemplateName}</p>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-semibold text-gray-900">{quote.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-semibold text-gray-900">{quote.guestCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Event</p>
                      <p className="font-semibold text-gray-900">{quote.eventType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">{formatDateReadable(quote.eventDate)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{quote.location}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Menu Summary</p>
                    <ul className="mt-2 space-y-1">
                      {quote.menuItems.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-gold" aria-hidden>
                            ✦
                          </span>
                          <span className="text-gray-800">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {quote.customNotes.trim() && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-900">Custom Notes</p>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{quote.customNotes.trim()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-navy text-white p-4">
                  <p className="text-sm font-semibold text-gold">Estimate</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Base</span>
                      <span className="font-semibold">{formatCurrency(dollarsToCents(quote.pricing.basePrice))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Travel</span>
                      <span className="font-semibold">{formatCurrency(dollarsToCents(quote.pricing.travelFee))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Staffing</span>
                      <span className="font-semibold">{formatCurrency(dollarsToCents(quote.pricing.staffingFee))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Add-ons</span>
                      <span className="font-semibold">{formatCurrency(dollarsToCents(quote.pricing.addOnsTotal))}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/15">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90">Total estimate</span>
                      <span className="font-bold text-white">{formatCurrency(dollarsToCents(quote.pricing.totalEstimate))}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/90">Deposit ({quote.pricing.depositPercent}%)</span>
                      <span className="font-bold text-gold">{formatCurrency(dollarsToCents(quote.pricing.depositAmount))}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-white/80">
                    Next step: confirm and arrange the deposit to secure the date.
                  </div>
                </div>
              </div>

              {quote.pricing.addOnLines.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900">Add-ons</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-800">
                    {quote.pricing.addOnLines.map((l) => (
                      <li key={`${l.label}-${l.price}`} className="flex items-center justify-between">
                        <span>{l.label}</span>
                        <span className="font-semibold">{formatCurrency(dollarsToCents(l.price))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp Reply (copy-ready)</p>
                  <textarea
                    readOnly
                    aria-label="WhatsApp reply text"
                    value={quote.whatsappText}
                    className="mt-2 w-full min-h-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 resize-y"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Quote (copy-ready)</p>
                  <textarea
                    readOnly
                    aria-label="Email quote text"
                    value={quote.emailText}
                    className="mt-2 w-full min-h-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 resize-y"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-navy/20 shadow-sm p-7 text-center text-sm text-gray-600 print:block">
              Generate a quote to preview a client-ready card plus copyable WhatsApp and email text.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

