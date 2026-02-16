'use client'

import { useState } from 'react'
import { LegacyDocument, PrayerRequest } from '@/types/legacy'

interface PublicLegacyClientProps {
  legacyData: {
    documents: LegacyDocument[]
    prayers: PrayerRequest[]
  }
}

export default function PublicLegacyClient({ legacyData }: PublicLegacyClientProps) {
  const [prayers, setPrayers] = useState(legacyData.prayers)
  const [showPrayerForm, setShowPrayerForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const visionDocuments = legacyData.documents.filter(d => d.category === 'vision')
  const doctrineDocuments = legacyData.documents.filter(d => d.category === 'doctrine')
  const unansweredPrayers = prayers.filter(p => !p.answered)
  const answeredPrayers = prayers.filter(p => p.answered)

  const handleSubmitPrayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      submitted_by: formData.get('name') as string,
      email: formData.get('email') as string,
      region: formData.get('region') as string,
      request: formData.get('request') as string,
      is_public: true,
    }

    try {
      const response = await fetch('/api/legacy/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Prayer request submitted. Thank you!' })
        setShowPrayerForm(false)
        e.currentTarget.reset()
        // Refresh prayers list
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit prayer request' })
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

      {/* Vision Story */}
      <section>
        <h2 className="text-3xl font-bold text-forestDark mb-6 text-center">Our Vision</h2>
        {visionDocuments.length === 0 ? (
          <div className="bg-[#f0fdf4] p-8 rounded-lg shadow-md border border-[#d1fae5]">
            <p className="text-gray-700 leading-relaxed text-lg">
              Bornfidis Provisions is more than a business—it's a movement of faith, regeneration, and community transformation.
              We envision a world where every meal connects us to the land, to each other, and to our Creator.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg mt-4">
              Our vision is to build a regenerative food system that:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2 ml-4">
              <li>Restores soil health and regenerates the land</li>
              <li>Empowers local farmers and chefs with fair income</li>
              <li>Nourishes communities with faith-anchored meals</li>
              <li>Trains disciples in regenerative practices</li>
              <li>Builds a global network of regenerative hubs</li>
              <li>Leaves a legacy for generations to come</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {visionDocuments.map((doc) => (
              <div key={doc.id} className="bg-[#f0fdf4] p-6 rounded-lg shadow-md border border-[#d1fae5]">
                <h3 className="text-xl font-semibold text-forestDark mb-2">{doc.title}</h3>
                {doc.summary && <p className="text-gray-700 mb-4">{doc.summary}</p>}
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{doc.content}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Generational Covenant */}
      <section className="bg-[#1a5f3f] text-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Generational Covenant</h2>
        <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
        <div className="space-y-4 text-green-100 leading-relaxed max-w-3xl mx-auto">
          <p>
            We commit to building Bornfidis as a legacy that will thrive for 100+ years, passing on not just a business,
            but a movement of faith, regeneration, and community transformation.
          </p>
          <p>
            <strong className="text-white">Our Covenant:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>To steward the land with care and regeneration</li>
            <li>To honor and support farmers, chefs, and community members</li>
            <li>To train and empower the next generation of leaders</li>
            <li>To maintain our faith-anchored foundation</li>
            <li>To build systems that outlast us</li>
            <li>To leave a legacy of abundance, not scarcity</li>
          </ul>
          <p className="mt-6 italic">
            "The righteous will flourish like a palm tree, they will grow like a cedar of Lebanon;
            planted in the house of the Lord, they will flourish in the courts of our God.
            They will still bear fruit in old age, they will stay fresh and green."
          </p>
          <p className="text-right font-semibold">— Psalm 92:12-14</p>
        </div>
      </section>

      {/* Doctrine Documents */}
      {doctrineDocuments.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-forestDark mb-6 text-center">Our Foundation</h2>
          <div className="space-y-4">
            {doctrineDocuments.map((doc) => (
              <div key={doc.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-forestDark mb-2">{doc.title}</h3>
                {doc.summary && <p className="text-gray-700 mb-4">{doc.summary}</p>}
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{doc.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prayer Wall */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-forestDark">Prayer Wall</h2>
          <button
            onClick={() => setShowPrayerForm(!showPrayerForm)}
            className="px-6 py-2 bg-[#FFBC00] text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
          >
            {showPrayerForm ? 'Cancel' : 'Submit Prayer Request'}
          </button>
        </div>

        {showPrayerForm && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-forestDark mb-4">Submit a Prayer Request</h3>
            <form onSubmit={handleSubmitPrayer} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
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
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Region (Optional)
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                />
              </div>
              <div>
                <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-1">
                  Prayer Request
                </label>
                <textarea
                  id="request"
                  name="request"
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </form>
          </div>
        )}

        {/* Unanswered Prayers */}
        {unansweredPrayers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-forestDark mb-4">Prayer Requests</h3>
            <div className="space-y-4">
              {unansweredPrayers.map((prayer) => (
                <div key={prayer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{prayer.submitted_by}</p>
                      {prayer.region && <p className="text-xs text-gray-500">{prayer.region}</p>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(prayer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{prayer.request}</p>
                  <p className="text-xs text-gray-500 mt-2">Prayers: {prayer.prayer_count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answered Prayers */}
        {answeredPrayers.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-forestDark mb-4">Answered Prayers</h3>
            <div className="space-y-4">
              {answeredPrayers.map((prayer) => (
                <div key={prayer.id} className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{prayer.submitted_by}</p>
                      {prayer.region && <p className="text-xs text-gray-500">{prayer.region}</p>}
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Answered
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{prayer.request}</p>
                  {prayer.answer && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-1">Answer:</p>
                      <p className="text-sm text-green-700">{prayer.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {prayers.length === 0 && (
          <p className="text-gray-500 text-center py-8">No prayer requests yet. Be the first to submit one!</p>
        )}
      </section>
    </div>
  )
}

