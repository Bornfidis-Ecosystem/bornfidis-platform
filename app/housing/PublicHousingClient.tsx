'use client'

import { useState } from 'react'
import { HousingProject } from '@/types/housing'

interface PublicHousingClientProps {
  housingData: {
    projects: HousingProject[]
  }
}

export default function PublicHousingClient({ housingData }: PublicHousingClientProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      family_size: parseInt(formData.get('family_size') as string),
      project_id: selectedProject || formData.get('project_id') as string,
      status: 'applied' as const,
    }

    try {
      const response = await fetch('/api/housing/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We will be in touch soon.' })
        setShowApplicationForm(false)
        e.currentTarget.reset()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit application' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-12">
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

      {/* Vision */}
      <section>
        <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6 text-center">Our Vision</h2>
        <div className="bg-[#f0fdf4] p-8 rounded-lg shadow-md border border-[#d1fae5]">
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Bornfidis Provisions believes in building generational wealth through faith-aligned housing.
            We envision communities where families can own their homes, build equity, and pass on
            inheritance to future generations.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Our housing covenant is built on:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Community Ownership:</strong> Land held in trust for the community</li>
            <li><strong>Equity Building:</strong> Residents build equity toward full ownership</li>
            <li><strong>Fair Pricing:</strong> Affordable housing that builds wealth</li>
            <li><strong>Generational Transfer:</strong> Homes can be passed to next generation</li>
            <li><strong>Faith Foundation:</strong> Built on biblical principles of stewardship</li>
          </ul>
        </div>
      </section>

      {/* Covenant */}
      <section className="bg-[#1a5f3f] text-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Housing Covenant</h2>
        <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
        <div className="space-y-4 text-green-100 leading-relaxed max-w-3xl mx-auto">
          <p>
            We commit to building housing that serves families for generations. Our covenant ensures:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Land is held in trust, protecting it for future generations</li>
            <li>Residents build equity through fair rent-to-own programs</li>
            <li>Homes are maintained and improved for long-term value</li>
            <li>Ownership can be transferred to family members</li>
            <li>Community governance ensures fair and just practices</li>
          </ul>
          <p className="mt-6 italic">
            "The Lord will guide you always; he will satisfy your needs in a sun-scorched land
            and will strengthen your frame. You will be like a well-watered garden, like a spring
            whose waters never fail."
          </p>
          <p className="text-right font-semibold">— Isaiah 58:11</p>
        </div>
      </section>

      {/* Active Projects */}
      {housingData.projects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[#1a5f3f] mb-6 text-center">Active Housing Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {housingData.projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-4">{project.region}</p>
                {project.description && (
                  <p className="text-sm text-gray-700 mb-4">{project.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Total Units:</span>
                    <span className="ml-2 font-medium">{project.units_total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Available:</span>
                    <span className="ml-2 font-medium text-green-600">{project.units_available}</span>
                  </div>
                </div>
                {project.trust_established && (
                  <p className="text-xs text-green-600 mb-4">✓ Community Trust Established</p>
                )}
                <button
                  onClick={() => {
                    setSelectedProject(project.id)
                    setShowApplicationForm(true)
                  }}
                  className="w-full px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
                >
                  Apply for Housing
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Application Form */}
      {showApplicationForm && (
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-[#1a5f3f] mb-4">Apply for Housing</h2>
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            <div>
              <label htmlFor="family_size" className="block text-sm font-medium text-gray-700 mb-1">
                Family Size *
              </label>
              <input
                type="number"
                id="family_size"
                name="family_size"
                required
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
              />
            </div>
            {!selectedProject && (
              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Project *
                </label>
                <select
                  id="project_id"
                  name="project_id"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                >
                  <option value="">Select a project...</option>
                  {housingData.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.region}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selectedProject && (
              <input type="hidden" name="project_id" value={selectedProject} />
            )}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowApplicationForm(false)
                  setSelectedProject('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Call to Action */}
      {!showApplicationForm && (
        <section className="bg-[#FFBC00] p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-bold text-[#1a5f3f] mb-4">Ready to Apply?</h2>
          <p className="text-[#1a5f3f] mb-6 max-w-2xl mx-auto">
            Join our housing covenant and start building generational wealth through faith-aligned housing.
          </p>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="px-8 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition"
          >
            Apply for Housing
          </button>
        </section>
      )}
    </div>
  )
}
