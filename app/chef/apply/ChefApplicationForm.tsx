'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { chefApplicationSchema, ChefApplicationInput } from '@/lib/validation'

export default function ChefApplicationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<ChefApplicationInput>({
    email: '',
    name: '',
    phone: '',
    bio: '',
    experience_years: undefined,
    specialties: [],
    certifications: [],
    website_url: '',
    instagram_handle: '',
  })
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Validate form data
      const validated = chefApplicationSchema.parse(formData)

      const response = await fetch('/api/chef/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We\'ll review it and get back to you soon.' })
        // Redirect to confirmation or dashboard
        setTimeout(() => {
          router.push('/chef/apply/thank-you')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application' })
      }
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const errorMessages = error.errors.map((e: any) => e.message).join(', ')
        setMessage({ type: 'error', text: errorMessages })
      } else {
        setMessage({ type: 'error', text: error.message || 'An error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties?.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialtyInput.trim()],
      })
      setSpecialtyInput('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties?.filter(s => s !== specialty) || [],
    })
  }

  const addCertification = () => {
    if (certificationInput.trim() && !formData.certifications?.includes(certificationInput.trim())) {
      setFormData({
        ...formData,
        certifications: [...(formData.certifications || []), certificationInput.trim()],
      })
      setCertificationInput('')
    }
  }

  const removeCertification = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications?.filter(c => c !== cert) || [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio / About You
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          placeholder="Tell us about your culinary background, philosophy, and what draws you to Bornfidis Provisions..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 50 characters recommended</p>
      </div>

      {/* Experience Years */}
      <div>
        <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience
        </label>
        <input
          type="number"
          id="experience_years"
          min="0"
          max="50"
          value={formData.experience_years || ''}
          onChange={(e) => setFormData({ ...formData, experience_years: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={specialtyInput}
            onChange={(e) => setSpecialtyInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSpecialty()
              }
            }}
            placeholder="e.g., Farm-to-Table, Mediterranean, Vegan"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Add
          </button>
        </div>
        {formData.specialties && formData.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-[#1a5f3f] rounded-full text-sm"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty)}
                  className="text-[#1a5f3f] hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={certificationInput}
            onChange={(e) => setCertificationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCertification()
              }
            }}
            placeholder="e.g., ServSafe, Culinary School Diploma"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          />
          <button
            type="button"
            onClick={addCertification}
            className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Add
          </button>
        </div>
        {formData.certifications && formData.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.certifications.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-[#1a5f3f] rounded-full text-sm"
              >
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(cert)}
                  className="text-[#1a5f3f] hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
          Website URL
        </label>
        <input
          type="url"
          id="website_url"
          value={formData.website_url}
          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
        />
      </div>

      {/* Instagram */}
      <div>
        <label htmlFor="instagram_handle" className="block text-sm font-medium text-gray-700 mb-2">
          Instagram Handle
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            @
          </span>
          <input
            type="text"
            id="instagram_handle"
            value={formData.instagram_handle}
            onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
            placeholder="yourhandle"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent"
          />
        </div>
      </div>

      {/* Message */}
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

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </form>
  )
}
