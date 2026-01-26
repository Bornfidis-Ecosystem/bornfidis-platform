'use client'

import { useState } from 'react'
import { partnerInquirySchema, PartnerInquiryInput } from '@/lib/validation'

export default function PartnersClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState<PartnerInquiryInput>({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    organization_type: undefined,
    partnership_interest: undefined,
    message: '',
    website_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const validated = partnerInquirySchema.parse(formData)

      const response = await fetch('/api/partners/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Inquiry submitted! We will be in touch soon.' })
        setFormData({
          organization_name: '',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          organization_type: undefined,
          partnership_interest: undefined,
          message: '',
          website_url: '',
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit inquiry' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Partnership Types */}
      <section>
        <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6">Partnership Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5]">
            <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">Media Partners</h3>
            <p className="text-gray-700 mb-4">
              Help us share the Bornfidis story through coverage, documentaries, and storytelling.
            </p>
          </div>
          <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5]">
            <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">Nonprofit Partners</h3>
            <p className="text-gray-700 mb-4">
              Collaborate on community development, food security, and regenerative agriculture initiatives.
            </p>
          </div>
          <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5]">
            <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">Business Partners</h3>
            <p className="text-gray-700 mb-4">
              Partner on distribution, supply chain, or complementary services.
            </p>
          </div>
          <div className="bg-[#f0fdf4] p-6 rounded-lg border border-[#d1fae5]">
            <h3 className="text-xl font-semibold text-[#1a5f3f] mb-3">Church Partners</h3>
            <p className="text-gray-700 mb-4">
              Connect faith communities with regenerative food and community development.
            </p>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="bg-white border-2 border-[#1a5f3f] rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-[#1a5f3f] mb-6">Partner Interest Form</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Type
              </label>
              <select
                id="organization_type"
                value={formData.organization_type || ''}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value as any || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              >
                <option value="">Select type...</option>
                <option value="media">Media</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="business">Business</option>
                <option value="church">Church</option>
                <option value="government">Government</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                id="contact_email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="partnership_interest" className="block text-sm font-medium text-gray-700 mb-1">
                Partnership Interest
              </label>
              <select
                id="partnership_interest"
                value={formData.partnership_interest || ''}
                onChange={(e) => setFormData({ ...formData, partnership_interest: e.target.value as any || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              >
                <option value="">Select interest...</option>
                <option value="sponsorship">Sponsorship</option>
                <option value="collaboration">Collaboration</option>
                <option value="media">Media Coverage</option>
                <option value="distribution">Distribution</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              placeholder="Tell us about your organization and how you'd like to partner..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </form>
      </section>
    </div>
  )
}
