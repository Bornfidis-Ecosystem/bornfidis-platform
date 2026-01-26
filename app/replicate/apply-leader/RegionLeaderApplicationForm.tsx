'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { replicationRegionSchema, type ReplicationRegionInput } from '@/lib/validation'

export default function RegionLeaderApplicationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<ReplicationRegionInput>>({
    expected_farmers: 0,
    expected_chefs: 0,
    capital_needed_cents: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const validated = replicationRegionSchema.parse(formData)

      const response = await fetch('/api/replication/apply-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/replicate/apply-leader/thank-you')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Region Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bornfidis Kingston"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.country || ''}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
              required
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region Description</label>
          <textarea
            value={formData.region_description || ''}
            onChange={(e) => setFormData({ ...formData, region_description: e.target.value })}
            rows={3}
            placeholder="Describe your region and community..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Leader Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.leader_name || ''}
            onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            required
          />
          {errors.leader_name && <p className="text-red-500 text-xs mt-1">{errors.leader_name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.leader_email || ''}
              onChange={(e) => setFormData({ ...formData, leader_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
              required
            />
            {errors.leader_email && <p className="text-red-500 text-xs mt-1">{errors.leader_email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.leader_phone || ''}
              onChange={(e) => setFormData({ ...formData, leader_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.leader_bio || ''}
            onChange={(e) => setFormData({ ...formData, leader_bio: e.target.value })}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Experience</label>
          <textarea
            value={formData.leader_experience || ''}
            onChange={(e) => setFormData({ ...formData, leader_experience: e.target.value })}
            rows={3}
            placeholder="Describe your experience with food systems, community organizing, regenerative agriculture, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Vision & Goals
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impact Goal</label>
          <textarea
            value={formData.impact_goal || ''}
            onChange={(e) => setFormData({ ...formData, impact_goal: e.target.value })}
            rows={4}
            placeholder="What impact do you hope to create in your region? What communities will you serve?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Farmers</label>
            <input
              type="number"
              min="0"
              value={formData.expected_farmers || 0}
              onChange={(e) => setFormData({ ...formData, expected_farmers: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Chefs</label>
            <input
              type="number"
              min="0"
              value={formData.expected_chefs || 0}
              onChange={(e) => setFormData({ ...formData, expected_chefs: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capital Needed (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.capital_needed_cents ? (formData.capital_needed_cents / 100).toFixed(2) : ''}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value) || 0
              setFormData({ ...formData, capital_needed_cents: Math.round(dollars * 100) })
            }}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
          />
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
        className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
