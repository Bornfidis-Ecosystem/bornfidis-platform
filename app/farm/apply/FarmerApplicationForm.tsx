'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { farmerApplicationSchema, type FarmerApplicationInput } from '@/lib/validation'

export default function FarmerApplicationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<FarmerApplicationInput>>({
    country: 'Jamaica',
    certifications: [],
    crops: [],
    proteins: [],
    processing_capabilities: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      // Validate form data
      const validated = farmerApplicationSchema.parse(formData)

      const response = await fetch('/api/farm/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/farm/apply/thank-you')
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

  const handleArrayChange = (field: 'certifications' | 'crops' | 'proteins' | 'processing_capabilities', value: string) => {
    const current = formData[field] || []
    if (value && !current.includes(value)) {
      setFormData({ ...formData, [field]: [...current, value] })
    }
  }

  const removeArrayItem = (field: 'certifications' | 'crops' | 'proteins' | 'processing_capabilities', index: number) => {
    const current = formData[field] || []
    setFormData({ ...formData, [field]: current.filter((_, i) => i !== index) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Basic Information
        </h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name / Farm Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location / Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            required
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="parish" className="block text-sm font-medium text-gray-700 mb-1">
              Parish
            </label>
            <input
              type="text"
              id="parish"
              value={formData.parish || ''}
              onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={formData.country || 'Jamaica'}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Regenerative Practices */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Regenerative Practices
        </h3>

        <div>
          <label htmlFor="regenerative_practices" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your regenerative practices
          </label>
          <textarea
            id="regenerative_practices"
            value={formData.regenerative_practices || ''}
            onChange={(e) => setFormData({ ...formData, regenerative_practices: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent resize-y"
            placeholder="Describe your sustainable farming practices, soil health methods, biodiversity efforts, etc."
          />
          {errors.regenerative_practices && <p className="text-red-500 text-xs mt-1">{errors.regenerative_practices}</p>}
        </div>
      </div>

      {/* Products & Capabilities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Products & Capabilities
        </h3>

        <div>
          <label htmlFor="crops" className="block text-sm font-medium text-gray-700 mb-1">
            Crops (press Enter to add)
          </label>
          <input
            type="text"
            id="crops"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  handleArrayChange('crops', value)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            placeholder="e.g., Tomatoes, Callaloo, Scotch Bonnet"
          />
          {formData.crops && formData.crops.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.crops.map((crop, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                >
                  {crop}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('crops', idx)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="proteins" className="block text-sm font-medium text-gray-700 mb-1">
            Proteins (press Enter to add)
          </label>
          <input
            type="text"
            id="proteins"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  handleArrayChange('proteins', value)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            placeholder="e.g., Fish, Goat, Chicken"
          />
          {formData.proteins && formData.proteins.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.proteins.map((protein, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {protein}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('proteins', idx)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="processing_capabilities" className="block text-sm font-medium text-gray-700 mb-1">
            Processing Capabilities (press Enter to add)
          </label>
          <input
            type="text"
            id="processing_capabilities"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  handleArrayChange('processing_capabilities', value)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            placeholder="e.g., Drying, Smoking, Pickling, Canning"
          />
          {formData.processing_capabilities && formData.processing_capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.processing_capabilities.map((cap, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                >
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('processing_capabilities', idx)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (press Enter to add)
          </label>
          <input
            type="text"
            id="certifications"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  handleArrayChange('certifications', value)
                  e.currentTarget.value = ''
                }
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
            placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
          />
          {formData.certifications && formData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gold text-navy rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('certifications', idx)}
                    className="text-navy hover:text-navy-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact & Social */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b border-[#FFBC00] pb-2">
          Contact & Social
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
              placeholder="https://..."
            />
            {errors.website_url && <p className="text-red-500 text-xs mt-1">{errors.website_url}</p>}
          </div>

          <div>
            <label htmlFor="instagram_handle" className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Handle
            </label>
            <input
              type="text"
              id="instagram_handle"
              value={formData.instagram_handle || ''}
              onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
              placeholder="@yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  )
}

