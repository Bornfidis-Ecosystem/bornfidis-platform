'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitBooking } from '@/app/actions'
import { submitWithOfflineFallback } from '@/lib/offline-sync'
import { toast } from '@/components/ui/Toast'

export default function BookPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    location: '',
    guests: '',
    budgetRange: '',
    dietaryRestrictions: '',
    notes: '',
    website_url: '', // Honeypot
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Try online submission first with offline fallback
      const offlineResult = await submitWithOfflineFallback(
        formData,
        '/api/submit-booking'
      )

      if (offlineResult.success) {
        toast.success('Booking submitted successfully!')
        router.push('/thanks')
      } else if (offlineResult.offline) {
        toast.info('Your booking has been saved offline and will be submitted when you\'re back online.')
        router.push('/thanks')
      } else {
        setError(offlineResult.error || 'Something went wrong. Please try again.')
        toast.error(offlineResult.error || 'Failed to submit booking')
      }
    } catch (err: any) {
      // Fallback: try server action directly
      try {
        const result = await submitBooking(formData)
        
        if (result.success) {
          toast.success('Booking submitted successfully!')
          router.push('/thanks')
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
          toast.error(result.error || 'Failed to submit booking')
        }
      } catch (fallbackErr) {
        setError('An unexpected error occurred. Please try again.')
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <header className="bg-navy text-white w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Link href="/" className="text-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 md:py-12 max-w-7xl w-full">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-navy mb-2">Request a Booking</h1>
          <p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-base">
            Fill out the form below and we&apos;ll get back to you within 24 hours with availability and a custom quote.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-4 md:p-8 rounded-lg shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-navy mb-4">Event Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="location"
                    name="location"
                    required
                    rows={3}
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Full address or venue name"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min="1"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-navy mb-4">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  >
                    <option value="">Select a range</option>
                    <option value="under_1000">Under $1,000</option>
                    <option value="1000_2000">$1,000 - $2,000</option>
                    <option value="2000_5000">$2,000 - $5,000</option>
                    <option value="5000_plus">$5,000+</option>
                    <option value="flexible">Flexible / Not Sure</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <textarea
                    id="dietaryRestrictions"
                    name="dietaryRestrictions"
                    rows={3}
                    value={formData.dietaryRestrictions}
                    onChange={handleChange}
                    placeholder="Vegetarian, vegan, gluten-free, allergies, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Anything else we should know?"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="website_url">Website URL</label>
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
