'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { impactInvestorSchema, type ImpactInvestorInput } from '@/lib/validation'

export default function ImpactInvestorForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<ImpactInvestorInput>>({
    capital_committed_cents: 0,
    region_interest: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const validated = impactInvestorSchema.parse(formData)

      const response = await fetch('/api/replication/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/replicate/invest/thank-you')
      } else {
        setErrors({ submit: data.error || 'Failed to submit application' })
      }
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: error.message || 'Validation error' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRegionInterest = () => {
    const region = prompt('Enter region of interest:')
    if (region && !formData.region_interest?.includes(region)) {
      setFormData({
        ...formData,
        region_interest: [...(formData.region_interest || []), region],
      })
    }
  }

  const removeRegionInterest = (index: number) => {
    const updated = formData.region_interest?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, region_interest: updated })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Investor Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
          <input
            type="text"
            value={formData.organization || ''}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            placeholder="Organization name (if applicable)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Investment Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Regions of Interest</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={addRegionInterest}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
            >
              + Add Region
            </button>
          </div>
          {formData.region_interest && formData.region_interest.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.region_interest.map((region, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-full text-sm flex items-center gap-2"
                >
                  {region}
                  <button
                    type="button"
                    onClick={() => removeRegionInterest(idx)}
                    className="text-[#1a5f3f] hover:text-[#154a32]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capital Committed (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.capital_committed_cents ? (formData.capital_committed_cents / 100).toFixed(2) : ''}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value) || 0
              setFormData({ ...formData, capital_committed_cents: Math.round(dollars * 100) })
            }}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
          <select
            value={formData.investment_type || ''}
            onChange={(e) => setFormData({ ...formData, investment_type: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
          >
            <option value="">-- Select type --</option>
            <option value="grant">Grant</option>
            <option value="loan">Loan</option>
            <option value="equity">Equity</option>
            <option value="donation">Donation</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Investment Inquiry'}
      </button>
    </form>
  )
}
