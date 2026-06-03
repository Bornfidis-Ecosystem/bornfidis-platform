'use client'

import { useState } from 'react'

interface FormState {
  client_name: string
  client_email: string
  client_phone: string
  event_type: string
  event_date: string
  guest_count: string
  location: string
  dietary_notes: string
  budget_indication: string
  additional_notes: string
  website_url: string
}

interface QuoteResult {
  quote_number: string
  quote_id?: string
  total_usd: number
  deposit_usd: number
  confidence: 'high' | 'medium' | 'low'
  confidence_reason?: string | null
  /** When `QUOTE_AUTO_SEND=false`, email is not sent until an admin approves. */
  review_pending?: boolean
}

const EMPTY_FORM: FormState = {
  client_name: '',
  client_email: '',
  client_phone: '',
  event_type: '',
  event_date: '',
  guest_count: '',
  location: '',
  dietary_notes: '',
  budget_indication: '',
  additional_notes: '',
  website_url: '',
}

const EVENT_TYPES = [
  'Farm-to-table dinner',
  'Private chef experience',
  'Cooking class',
  'Catered event',
  'Corporate retreat dining',
  'Wedding catering',
  'Other',
]

export function EventInquiryForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<QuoteResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/public/quote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: form.client_name,
          client_email: form.client_email,
          client_phone: form.client_phone,
          event_type: form.event_type,
          event_date: form.event_date,
          guest_count: Number(form.guest_count),
          location: form.location,
          dietary_notes: form.dietary_notes || undefined,
          budget_indication: form.budget_indication || undefined,
          additional_notes: form.additional_notes || undefined,
          website_url: form.website_url,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        const msg =
          data.message ||
          data.error ||
          (typeof data.details === 'object' ? 'Please check the form fields' : null) ||
          'Something went wrong'
        throw new Error(typeof msg === 'string' ? msg : 'Something went wrong')
      }

      setResult({
        quote_number: data.quote_number,
        quote_id: data.quote_id,
        total_usd: data.total_usd,
        deposit_usd: data.deposit_usd,
        confidence: data.confidence,
        confidence_reason: data.confidence_reason,
        review_pending: data.review_pending === true,
      })
      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unexpected error')
      setStatus('error')
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 13l4 4L19 7"
              stroke="#0f6e56"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-medium text-gray-900">
          {result.review_pending ? 'Quote saved' : 'Quote on its way'}
        </h2>
        <p className="mb-8 text-sm text-gray-500">
          {result.review_pending ? (
            <>
              Your quote <strong>{result.quote_number}</strong> is saved for internal review. When
              approved, we&apos;ll email it to <strong>{form.client_email}</strong>.
            </>
          ) : (
            <>
              We&apos;ve sent your event quote to <strong>{form.client_email}</strong>. Check your
              inbox — it should arrive within a minute.
            </>
          )}
        </p>

        <div className="mb-8 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Quote ref</span>
            <span className="font-medium text-gray-900">{result.quote_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total estimate</span>
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                result.total_usd,
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit to confirm</span>
            <span className="font-medium text-green-700">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                result.deposit_usd,
              )}
            </span>
          </div>
          {result.confidence !== 'high' && result.confidence_reason && (
            <p className="border-t border-gray-100 pt-2 text-xs text-amber-600">
              Note: {result.confidence_reason}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setForm(EMPTY_FORM)
            setResult(null)
          }}
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          Submit another inquiry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-medium text-gray-900">Book an event</h1>
        <p className="text-sm text-gray-500">
          Tell us about your event and we&apos;ll send a detailed quote within minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="website_url"
          value={form.website_url}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden
        />

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Your details
          </legend>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="client_name">
              Full name *
            </label>
            <input
              id="client_name"
              name="client_name"
              type="text"
              required
              value={form.client_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700" htmlFor="client_email">
                Email *
              </label>
              <input
                id="client_email"
                name="client_email"
                type="email"
                required
                value={form.client_email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700" htmlFor="client_phone">
                Phone *
              </label>
              <input
                id="client_phone"
                name="client_phone"
                type="tel"
                required
                minLength={7}
                value={form.client_phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="+1 876 000 0000"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Event details
          </legend>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="event_type">
              Event type *
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              value={form.event_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select an event type</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700" htmlFor="event_date">
                Date *
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                required
                value={form.event_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700" htmlFor="guest_count">
                Guests *
              </label>
              <input
                id="guest_count"
                name="guest_count"
                type="number"
                required
                min={1}
                max={500}
                value={form.guest_count}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="location">
              Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Port Antonio, Jamaica"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            Preferences
          </legend>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="dietary_notes">
              Dietary requirements
            </label>
            <input
              id="dietary_notes"
              name="dietary_notes"
              type="text"
              value={form.dietary_notes}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Vegan, gluten-free, nut allergy…"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="budget_indication">
              Budget range
            </label>
            <input
              id="budget_indication"
              name="budget_indication"
              type="text"
              value={form.budget_indication}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="e.g. $2,000 – $3,500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700" htmlFor="additional_notes">
              Anything else
            </label>
            <textarea
              id="additional_notes"
              name="additional_notes"
              rows={3}
              value={form.additional_notes}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Special requests, venue notes, theme…"
            />
          </div>
        </fieldset>

        {status === 'error' && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:bg-green-300"
        >
          {status === 'loading' ? 'Generating your quote…' : 'Get a quote'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your quote will be emailed to you automatically. No account needed.
        </p>
      </form>
    </div>
  )
}
