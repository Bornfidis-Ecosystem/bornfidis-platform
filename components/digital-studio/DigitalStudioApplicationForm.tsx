'use client'

import { FormEvent, useState } from 'react'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import {
  bookBody,
  bookFieldClass,
  bookLabelClass,
} from '@/components/booking/book-culinary-classes'
import { DIGITAL_STUDIO_FORM } from '@/lib/digital-studio-content'

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'farm-food-producer', label: 'Farm or food producer' },
  { value: 'guest-house', label: 'Guest house or small hospitality property' },
  { value: 'other', label: 'Other — describe below' },
] as const

const WEBSITE_STATUS = [
  { value: 'yes-needs-work', label: 'Yes, needs work' },
  { value: 'yes-needs-rebuild', label: 'Yes, needs a rebuild' },
  { value: 'no-scratch', label: 'No, starting from scratch' },
] as const

const TIMELINES = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3-months', label: 'Next 1–3 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const

export function DigitalStudioApplicationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [businessType, setBusinessType] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      businessName: String(formData.get('businessName') ?? '').trim(),
      contactName: String(formData.get('contactName') ?? '').trim(),
      contactEmail: String(formData.get('contactEmail') ?? '').trim(),
      businessType: String(formData.get('businessType') ?? ''),
      businessTypeOther: String(formData.get('businessTypeOther') ?? '').trim() || undefined,
      biggestGap: String(formData.get('biggestGap') ?? '').trim(),
      websiteStatus: String(formData.get('websiteStatus') ?? ''),
      timeline: String(formData.get('timeline') ?? ''),
      notes: String(formData.get('notes') ?? '').trim() || undefined,
      website_url: String(formData.get('website_url') ?? ''),
    }

    try {
      const res = await fetch('/api/digital-studio/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      form.reset()
      setBusinessType('')
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-[#ffbc00]/40 bg-white p-8 md:p-10">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-[#ffbc00]">
          {DIGITAL_STUDIO_FORM.successTitle}
        </p>
        <p className={`${bookBody} mt-4 max-w-xl`}>{DIGITAL_STUDIO_FORM.successBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#ffbc00]/35 bg-white p-6 md:p-10">
      <p className={`${bookBody} mb-8 max-w-xl text-sm`}>{DIGITAL_STUDIO_FORM.intro}</p>

      <div className="absolute left-[-9999px] top-0" aria-hidden="true">
        <label htmlFor="ds-website-url">Website URL</label>
        <input
          type="text"
          id="ds-website-url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="ds-business-name" className={bookLabelClass}>
            Business name
          </label>
          <input
            id="ds-business-name"
            name="businessName"
            type="text"
            required
            autoComplete="organization"
            className={bookFieldClass}
          />
        </div>

        <div>
          <label htmlFor="ds-contact-name" className={bookLabelClass}>
            Your name
          </label>
          <input
            id="ds-contact-name"
            name="contactName"
            type="text"
            required
            autoComplete="name"
            className={bookFieldClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ds-contact-email" className={bookLabelClass}>
            Email
          </label>
          <input
            id="ds-contact-email"
            name="contactEmail"
            type="email"
            required
            autoComplete="email"
            className={bookFieldClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ds-business-type" className={bookLabelClass}>
            What type of business is this?
          </label>
          <select
            id="ds-business-type"
            name="businessType"
            required
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className={`${bookFieldClass} cursor-pointer`}
          >
            <option value="" disabled>
              Select one
            </option>
            {BUSINESS_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {businessType === 'other' ? (
          <div className="md:col-span-2">
            <label htmlFor="ds-business-type-other" className={bookLabelClass}>
              Describe your business
            </label>
            <input
              id="ds-business-type-other"
              name="businessTypeOther"
              type="text"
              required
              className={bookFieldClass}
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label htmlFor="ds-biggest-gap" className={bookLabelClass}>
            What&apos;s the biggest gap right now?
          </label>
          <input
            id="ds-biggest-gap"
            name="biggestGap"
            type="text"
            required
            placeholder="Website, booking system, brand, operating documents…"
            className={bookFieldClass}
          />
        </div>

        <div>
          <label htmlFor="ds-website-status" className={bookLabelClass}>
            Do you currently have a website?
          </label>
          <select
            id="ds-website-status"
            name="websiteStatus"
            required
            defaultValue=""
            className={`${bookFieldClass} cursor-pointer`}
          >
            <option value="" disabled>
              Select one
            </option>
            {WEBSITE_STATUS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ds-timeline" className={bookLabelClass}>
            Rough timeline
          </label>
          <select
            id="ds-timeline"
            name="timeline"
            required
            defaultValue=""
            className={`${bookFieldClass} cursor-pointer`}
          >
            <option value="" disabled>
              Select one
            </option>
            {TIMELINES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ds-notes" className={bookLabelClass}>
            Anything else we should know? <span className="font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id="ds-notes"
            name="notes"
            rows={3}
            className={`${bookFieldClass} resize-y min-h-[4.5rem]`}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-6 font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <PrimaryButton
        type="submit"
        theme="culinary"
        className="mt-8"
        disabled={submitting}
      >
        {submitting ? 'Sending…' : 'Submit application'}
      </PrimaryButton>
    </form>
  )
}
