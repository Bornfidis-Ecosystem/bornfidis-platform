'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitBooking } from '@/app/actions'
import { submitWithOfflineFallback } from '@/lib/offline-sync'
import { toast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BrandedCard } from '@/components/ui/BrandedCard'
import { TextField, TextareaField, SelectField } from '@/components/ui/FormField'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { BOOKING_UPSELL_OPTIONS } from '@/lib/booking-upsells'
import { bookEyebrow, bookSection } from '@/components/booking/book-culinary-classes'

const budgetTiers = [
  { value: '', label: 'Select budget tier' },
  { value: '150_200', label: '$150–$200 per person' },
  { value: '200_250', label: '$200–$250 per person' },
  { value: '250_300_plus', label: '$250–$300+ per person' },
]

const experienceTypeOptions = [
  { value: '', label: 'Select experience type' },
  { value: 'Private Dinner', label: 'Private Dinner' },
  { value: 'Weekend Retreat', label: 'Weekend Retreat' },
  { value: 'Retreat & Events', label: 'Retreat & Events' },
  { value: 'Gathering & Celebrations', label: 'Gathering & Celebrations' },
  { value: 'Not sure yet — guide me', label: 'Not sure yet — guide me' },
]

const occasionOptions = [
  { value: '', label: 'Select occasion' },
  { value: 'Romantic Dinner', label: 'Romantic Dinner' },
  { value: 'Birthday Celebration', label: 'Birthday Celebration' },
  { value: 'Anniversary', label: 'Anniversary' },
  { value: 'Private Gathering', label: 'Private Gathering' },
  { value: 'Family Dinner', label: 'Family Dinner' },
  { value: 'Brunch Experience', label: 'Brunch Experience' },
  { value: 'Other', label: 'Other' },
]

const diningStyles = [
  { value: '', label: 'Select dining style' },
  { value: 'plated_fine_dining', label: 'Plated Fine Dining' },
  { value: 'family_style_elevated', label: 'Family-Style Elevated' },
  { value: 'tasting_menu', label: 'Tasting Menu' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'not_sure_yet', label: 'Not Sure Yet' },
]

const optionClass = 'bg-[#fdf8f8] text-[#2c2c2c]'

export function BookingInquiryForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventDate: '',
    location: '',
    guestCount: '',
    experienceType: '',
    occasion: '',
    budgetTier: '',
    diningStyle: '',
    allergies: '',
    kitchenNotes: '',
    message: '',
    upsellInterests: [] as string[],
    website_url: '',
  })

  const minDate = new Date().toISOString().split('T')[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const buildPayload = () => ({
    fullName: formData.fullName,
    name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    eventDate: formData.eventDate,
    eventTime: '',
    location: formData.location,
    guestCount: formData.guestCount,
    guests: formData.guestCount,
    occasion: formData.occasion,
    budgetTier: formData.budgetTier,
    budgetRange: formData.budgetTier,
    diningStyle: formData.diningStyle,
    allergies: formData.allergies,
    dietaryRestrictions: formData.allergies,
    kitchenNotes: formData.kitchenNotes,
    message: formData.message,
    notes: formData.message,
    upsellInterests: formData.upsellInterests,
    website_url: formData.website_url,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const payload = buildPayload()

    const thanksInquiry = (bookingId?: string) => {
      const q = bookingId
        ? `?type=inquiry&booking_id=${encodeURIComponent(bookingId)}`
        : '?type=inquiry'
      router.push(`/thanks${q}`)
    }

    try {
      const offlineResult = await submitWithOfflineFallback(payload, '/api/submit-booking')
      if (offlineResult.success) {
        toast.success('Your inquiry was sent.')
        thanksInquiry(offlineResult.bookingId)
      } else if (offlineResult.offline) {
        toast.info("Saved offline — we'll send when you're back online.")
        router.push('/thanks?type=inquiry')
      } else {
        setError(offlineResult.error || 'Something went wrong. Please try again.')
        toast.error(offlineResult.error || 'Failed to submit')
      }
    } catch {
      try {
        const result = await submitBooking(payload)
        if (result.success) {
          toast.success('Your inquiry was sent.')
          const id = (result as { bookingId?: string }).bookingId
          thanksInquiry(id)
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
          toast.error(result.error || 'Failed to submit')
        }
      } catch {
        setError('An unexpected error occurred. Please try again.')
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking-form" className={`scroll-mt-24 ${bookSection}`}>
      <PageContainer wide>
        <SectionHeading
          theme="culinary"
          eyebrow="Inquiry"
          title="Request Your Experience"
          subtitle="Tell us about your event and we'll prepare a custom dining experience for you."
        />
        <BrandedCard theme="culinary" className="mt-10">
          {error ? (
            <div
              className="mb-6 rounded-none border border-red-700/40 bg-red-50 px-4 py-3 font-sans text-sm text-red-900 shadow-none"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="relative space-y-8">
            <div className="sr-only" aria-hidden>
              <label htmlFor="website_url">Website</label>
              <input
                type="text"
                id="website_url"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website_url}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-5 md:space-y-6">
                <p className={bookEyebrow}>Your details</p>
                <TextField
                  theme="culinary"
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <TextField
                  theme="culinary"
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  theme="culinary"
                  label="Phone Number"
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  theme="culinary"
                  label="Event Date"
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  required
                  min={minDate}
                  value={formData.eventDate}
                  onChange={handleChange}
                />
                <TextareaField
                  theme="culinary"
                  label="Event Location"
                  id="location"
                  name="location"
                  required
                  rows={3}
                  placeholder="Address, city, or property — be as specific as you can."
                  value={formData.location}
                  onChange={handleChange}
                />
                <TextField
                  theme="culinary"
                  label="Number of Guests"
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min={1}
                  required
                  placeholder="e.g. 8"
                  value={formData.guestCount}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-5 md:space-y-6">
                <p className={bookEyebrow}>Event & preferences</p>
                <SelectField
                  theme="culinary"
                  label="Experience Type"
                  id="experienceType"
                  name="experienceType"
                  required
                  value={formData.experienceType}
                  onChange={handleChange}
                >
                  {experienceTypeOptions.map((o) => (
                    <option key={o.label} value={o.value} disabled={o.value === ''} className={optionClass}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  theme="culinary"
                  label="Occasion"
                  id="occasion"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                >
                  {occasionOptions.map((o) => (
                    <option key={o.label} value={o.value} disabled={o.value === ''} className={optionClass}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  theme="culinary"
                  label="Budget Tier"
                  id="budgetTier"
                  name="budgetTier"
                  required
                  value={formData.budgetTier}
                  onChange={handleChange}
                >
                  {budgetTiers.map((o) => (
                    <option key={o.label} value={o.value} disabled={o.value === ''} className={optionClass}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  theme="culinary"
                  label="Dining Style"
                  id="diningStyle"
                  name="diningStyle"
                  required
                  value={formData.diningStyle}
                  onChange={handleChange}
                >
                  {diningStyles.map((o) => (
                    <option key={o.label} value={o.value} disabled={o.value === ''} className={optionClass}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <TextareaField
                  theme="culinary"
                  label="Allergies or Dietary Restrictions"
                  id="allergies"
                  name="allergies"
                  rows={2}
                  placeholder="Nuts, shellfish, alcohol-free, etc. — or none"
                  value={formData.allergies}
                  onChange={handleChange}
                />
                <TextareaField
                  theme="culinary"
                  label="Kitchen Access Notes"
                  id="kitchenNotes"
                  name="kitchenNotes"
                  rows={3}
                  placeholder="Equipment, layout, service window…"
                  value={formData.kitchenNotes}
                  onChange={handleChange}
                />
                <TextareaField
                  theme="culinary"
                  label="Additional Details"
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Anything else we should know."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>

            <CheckboxGroup
              theme="culinary"
              legend="Enhance Your Experience (Optional)"
              name="upsell"
              options={BOOKING_UPSELL_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={formData.upsellInterests}
              onChange={(next) => setFormData((p) => ({ ...p, upsellInterests: next }))}
            />

            <div className="pt-2">
              <PrimaryButton
                theme="culinary"
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] sm:max-w-md"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" className="text-[#fdf8f8]" />
                    Sending…
                  </span>
                ) : (
                  'Request My Experience'
                )}
              </PrimaryButton>
            </div>
          </form>
        </BrandedCard>
      </PageContainer>
    </section>
  )
}
