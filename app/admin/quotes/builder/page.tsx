'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast as uiToast } from '@/components/ui/Toast'
import { CulinaryCard } from '@/components/culinary-os'
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
import { formatDateOnly, parseLocalDateOnly } from '@/lib/date-utils'

const fieldClass =
  'w-full rounded-none border border-culinary-outline bg-culinary-bone px-4 py-3 font-culinary-sans text-sm text-culinary-ink outline-none focus:border-culinary-navy focus:ring-1 focus:ring-culinary-navy/30'

const labelClass = 'mb-2 block font-culinary-sans text-sm font-medium text-culinary-text-muted'

function formatDateReadable(dateString: string) {
  if (!dateString) return ''
  const date = parseLocalDateOnly(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return formatDateOnly(dateString, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function copyText(text: string) {
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      uiToast.success('Copied to clipboard')
      return
    }

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

  const btnSecondary =
    'rounded-none border border-culinary-outline bg-culinary-bone px-6 py-3 font-culinary-sans text-sm font-semibold text-culinary-navy transition-colors duration-refined ease-refined hover:border-culinary-gold-line hover:bg-culinary-surface-low'

  return (
    <div className="w-full bg-culinary-bone px-gutter py-stack-md">
      <div className="mx-auto max-w-6xl space-y-stack-md">
        <div>
          <Link
            href="/admin/quotes"
            className="mb-3 inline-block font-culinary-sans text-sm font-medium text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted"
          >
            ← Event quotes queue
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-culinary-display text-2xl font-bold text-culinary-navy">Bornfidis Provisions Quote Builder</h1>
              <p className="mt-1 font-culinary-sans text-sm text-culinary-text-muted">
                Preview only — does not save to the database or create a portal deposit.
              </p>
            </div>

            {hasPrefill && (
              <div className="inline-flex items-center rounded-none border border-culinary-gold-line bg-culinary-surface-low px-3 py-1 font-culinary-sans text-sm font-semibold text-culinary-navy">
                Prefilled from booking
              </div>
            )}
          </div>
        </div>

        <CulinaryCard className="border-amber-300 bg-amber-50/90 print:hidden">
          <p className="font-culinary-sans text-sm font-semibold text-amber-950">Preview / Labs tool</p>
          <p className="mt-1 font-culinary-sans text-sm text-amber-900/90">
            To collect a real deposit, open the booking and use{' '}
            <Link href="/admin/bookings" className="underline font-medium">
              Quote &amp; Payment
            </Link>
            , then send the client portal link. This page only builds copy-ready text.
          </p>
        </CulinaryCard>

        <CulinaryCard as="form" onSubmit={handleSubmit} className="print:hidden sm:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="clientName" className={labelClass}>
                Client Name
              </label>
              <input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                className={fieldClass}
                placeholder="e.g. Sarah Johnson"
                required
              />
            </div>

            <div>
              <label htmlFor="eventType" className={labelClass}>
                Event Type
              </label>
              <input
                id="eventType"
                value={form.eventType}
                onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                className={fieldClass}
                placeholder="e.g. Anniversary Dinner"
                required
              />
            </div>

            <div>
              <label htmlFor="eventDate" className={labelClass}>
                Event Date
              </label>
              <input
                id="eventDate"
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                className={fieldClass}
                required
                title="Select event date"
              />
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className={fieldClass}
                placeholder="e.g. Port Antonio villa"
                required
              />
            </div>

            <div>
              <label htmlFor="guestCount" className={labelClass}>
                Guest Count
              </label>
              <input
                id="guestCount"
                type="number"
                value={form.guestCount}
                onChange={(e) => setIntField('guestCount', e.target.value)}
                className={fieldClass}
                min={1}
                placeholder="e.g. 8"
                title="Number of guests"
                required
              />
            </div>

            <div>
              <label htmlFor="packageType" className={labelClass}>
                Package Type
              </label>
              <select
                id="packageType"
                value={form.packageType}
                onChange={(e) => setForm((prev) => ({ ...prev, packageType: e.target.value as PackageType }))}
                className={fieldClass}
              >
                {PACKAGE_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="serviceStyle" className={labelClass}>
                Service Style
              </label>
              <select
                id="serviceStyle"
                value={form.serviceStyle}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceStyle: e.target.value as ServiceStyle }))}
                className={fieldClass}
              >
                {SERVICE_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="menuTemplate" className={labelClass}>
                Menu Template
              </label>
              <select
                id="menuTemplate"
                value={form.menuTemplate}
                onChange={(e) => setForm((prev) => ({ ...prev, menuTemplate: e.target.value as MenuTemplateId }))}
                className={fieldClass}
              >
                {MENU_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="customNotes" className={labelClass}>
                Custom Notes
              </label>
              <textarea
                id="customNotes"
                value={form.customNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, customNotes: e.target.value }))}
                className={`min-h-[110px] ${fieldClass}`}
                placeholder="Dietary needs, special requests, timing notes, and anything the client should feel."
              />
            </div>
          </div>

          <div className="mt-6 space-y-5 border-t border-culinary-outline pt-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="basePrice">
                  Base Price (USD)
                </label>
                <input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(e) => setNumberField('basePrice', e.target.value)}
                  className={fieldClass}
                  min={0}
                  placeholder="0.00"
                  title="Base price in USD"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="travelFee">
                  Travel Fee (USD)
                </label>
                <input
                  id="travelFee"
                  type="number"
                  step="0.01"
                  value={form.travelFee}
                  onChange={(e) => setNumberField('travelFee', e.target.value)}
                  className={fieldClass}
                  min={0}
                  placeholder="0.00"
                  title="Travel fee in USD"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="staffingFee">
                  Staffing Fee (USD)
                </label>
                <input
                  id="staffingFee"
                  type="number"
                  step="0.01"
                  value={form.staffingFee}
                  onChange={(e) => setNumberField('staffingFee', e.target.value)}
                  className={fieldClass}
                  min={0}
                  placeholder="0.00"
                  title="Staffing fee in USD"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="addOns">
                  Add-ons <span className="text-xs font-normal text-culinary-text-muted">(one per line: Label - Price)</span>
                </label>
                <textarea
                  id="addOns"
                  value={form.addOns}
                  onChange={(e) => setForm((prev) => ({ ...prev, addOns: e.target.value }))}
                  className={`min-h-[120px] ${fieldClass}`}
                  placeholder={`Extra Course - 120\nChef’s Welcome Cocktail - 90\nDessert Upgrade - 75`}
                  title="Add-ons list (Label - Price per line)"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="depositPercent">
                  Deposit % (default 40)
                </label>
                <input
                  id="depositPercent"
                  type="number"
                  step="1"
                  value={form.depositPercent}
                  onChange={(e) => setNumberField('depositPercent', e.target.value)}
                  className={fieldClass}
                  min={0}
                  max={100}
                  placeholder="40"
                  title="Deposit percentage"
                  required
                />

                <div className="mt-3 rounded-none border border-culinary-outline bg-culinary-surface-low p-4 font-culinary-sans text-sm text-culinary-text-muted">
                  Deposit is calculated from the total estimate (base + travel + staffing + add-ons).
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="rounded-none border border-red-200 bg-red-50 p-4 font-culinary-sans text-sm text-red-800">
                <div className="mb-2 font-semibold">Fix these issues:</div>
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-none border border-culinary-navy bg-culinary-navy px-6 py-3 font-culinary-sans font-semibold text-culinary-on-navy transition-colors duration-refined ease-refined hover:opacity-90"
              >
                Generate Quote
              </button>

              <button
                type="button"
                className={btnSecondary}
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
        </CulinaryCard>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 print:hidden">
            <h2 className="font-culinary-display text-xl font-bold text-culinary-navy">Quote Preview</h2>

            {quote && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => copyText(quote.whatsappText)}
                  className="rounded-none border border-culinary-gold-line bg-culinary-gold px-4 py-2 font-culinary-sans font-semibold text-culinary-navy transition-opacity duration-refined ease-refined hover:opacity-90"
                >
                  Copy WhatsApp Reply
                </button>
                <button type="button" onClick={() => copyText(quote.emailText)} className={btnSecondary}>
                  Copy Email Quote
                </button>
                <button type="button" onClick={() => window.print()} className={btnSecondary}>
                  Print Quote
                </button>
              </div>
            )}
          </div>

          {quote ? (
            <CulinaryCard className="print:block sm:p-7">
              <div className="grid gap-4 md:grid-cols-3 md:items-start">
                <div className="md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <h3 className="font-culinary-display text-2xl font-bold text-culinary-navy">Client Quote</h3>
                    <p className="font-culinary-sans text-sm text-culinary-text-muted">{quote.menuTemplateName}</p>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="font-culinary-sans text-sm text-culinary-text-muted">Client</p>
                      <p className="font-culinary-sans font-semibold text-culinary-ink">{quote.clientName}</p>
                    </div>
                    <div>
                      <p className="font-culinary-sans text-sm text-culinary-text-muted">Guests</p>
                      <p className="font-culinary-sans font-semibold text-culinary-ink">{quote.guestCount}</p>
                    </div>
                    <div>
                      <p className="font-culinary-sans text-sm text-culinary-text-muted">Event</p>
                      <p className="font-culinary-sans font-semibold text-culinary-ink">{quote.eventType}</p>
                    </div>
                    <div>
                      <p className="font-culinary-sans text-sm text-culinary-text-muted">Date</p>
                      <p className="font-culinary-sans font-semibold text-culinary-ink">{formatDateReadable(quote.eventDate)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-culinary-sans text-sm text-culinary-text-muted">Location</p>
                      <p className="font-culinary-sans font-semibold text-culinary-ink">{quote.location}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-none border border-culinary-outline bg-culinary-surface-low p-4">
                    <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">Menu Summary</p>
                    <ul className="mt-2 space-y-1">
                      {quote.menuItems.map((item) => (
                        <li key={item} className="flex gap-2 font-culinary-sans text-sm">
                          <span className="text-culinary-gold" aria-hidden>
                            ✦
                          </span>
                          <span className="text-culinary-ink">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {quote.customNotes.trim() && (
                      <div className="mt-4">
                        <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">Custom Notes</p>
                        <p className="mt-1 whitespace-pre-wrap font-culinary-sans text-sm text-culinary-text-muted">
                          {quote.customNotes.trim()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-none border border-culinary-navy bg-culinary-navy p-4 text-culinary-on-navy">
                  <p className="font-culinary-sans text-sm font-semibold text-culinary-gold">Estimate</p>
                  <div className="mt-2 space-y-2 font-culinary-sans text-sm">
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

                  <div className="mt-4 border-t border-white/15 pt-4">
                    <div className="flex items-center justify-between font-culinary-sans text-sm">
                      <span className="text-culinary-on-navy/90">Total estimate</span>
                      <span className="font-bold text-culinary-on-navy">
                        {formatCurrency(dollarsToCents(quote.pricing.totalEstimate))}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-culinary-sans text-sm">
                      <span className="text-culinary-on-navy/90">Deposit ({quote.pricing.depositPercent}%)</span>
                      <span className="font-bold text-culinary-gold">
                        {formatCurrency(dollarsToCents(quote.pricing.depositAmount))}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 font-culinary-sans text-xs text-culinary-on-navy/80">
                    Next step: confirm and arrange the deposit to secure the date.
                  </div>
                </div>
              </div>

              {quote.pricing.addOnLines.length > 0 && (
                <div className="mt-5">
                  <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">Add-ons</p>
                  <ul className="mt-2 space-y-1 font-culinary-sans text-sm text-culinary-ink">
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
                  <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">WhatsApp Reply (copy-ready)</p>
                  <textarea
                    readOnly
                    aria-label="WhatsApp reply text"
                    value={quote.whatsappText}
                    className={`mt-2 min-h-[220px] resize-y font-mono ${fieldClass}`}
                  />
                </div>
                <div>
                  <p className="font-culinary-sans text-sm font-semibold text-culinary-ink">Email Quote (copy-ready)</p>
                  <textarea
                    readOnly
                    aria-label="Email quote text"
                    value={quote.emailText}
                    className={`mt-2 min-h-[220px] resize-y font-mono ${fieldClass}`}
                  />
                </div>
              </div>
            </CulinaryCard>
          ) : (
            <div className="rounded-none border border-dashed border-culinary-outline bg-culinary-bone p-7 text-center font-culinary-sans text-sm text-culinary-text-muted print:block">
              Generate a quote to preview a client-ready card plus copyable WhatsApp and email text.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
