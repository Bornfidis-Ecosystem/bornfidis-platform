'use client'

import { useState } from 'react'
import { submitFarmerRegistration } from '@/lib/farmer-intake-actions'

const CROP_OPTIONS = [
  'Yam',
  'Sweet Yam',
  'Yellow Yam',
  'Breadfruit',
  'Roasted Breadfruit',
  'Dasheen',
  'Coco',
  'Taro',
  'Sweet Potato',
  'Callaloo',
  'Cho-cho',
  'Coconut',
  'Jelly Coconut',
  'Banana',
  'Green Banana',
  'Ripe Banana',
  'Plantain',
  'Green Plantain',
  'Tomatoes',
  'Peppers',
  'Scotch Bonnet',
  'Scallion',
  'Thyme',
  'Pimento',
  'Ginger',
  'Turmeric',
  'Pumpkin',
  'Squash',
  'Other',
]

const PARISH_OPTIONS = [
  'Portland',
  'St. Thomas',
  'St. Mary',
  'St. Ann',
  'St. Catherine',
  'Kingston',
  'Other',
]

interface FormData {
  name: string
  phone: string
  location: string
  farmName: string
  parish: string
  crops: string[]
  farmSize: string
  weeklyVolume: string
  preferredDay: string
  notes: string
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  location: '',
  farmName: '',
  parish: 'Portland',
  crops: [],
  farmSize: '',
  weeklyVolume: '',
  preferredDay: 'Wednesday',
  notes: '',
}

export default function FarmerIntakeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCropToggle = (crop: string) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter((c) => c !== crop)
        : [...prev.crops, crop],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.location?.trim()) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (formData.crops.length === 0) {
      setError('Please select at least one crop')
      setLoading(false)
      return
    }

    let phone = formData.phone.replace(/\D/g, '')
    if (phone.length === 10 && phone.startsWith('876')) {
      // Already formatted
    } else if (phone.length === 7) {
      phone = '876' + phone
    } else if (phone.length === 10 && !phone.startsWith('876')) {
      setError('Please enter a valid Jamaican phone number')
      setLoading(false)
      return
    } else {
      setError('Please enter a valid phone number (7 or 10 digits)')
      setLoading(false)
      return
    }

    const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

    const result = await submitFarmerRegistration({
      ...formData,
      phone: formattedPhone,
      whatsapp: formattedPhone,
      farmName: formData.farmName || null,
      parish: formData.parish || 'Portland',
      crops: formData.crops,
      farmSize: formData.farmSize ? parseFloat(formData.farmSize) : null,
      weeklyVolume: formData.weeklyVolume ? parseFloat(formData.weeklyVolume) : null,
      preferredDay: formData.preferredDay || 'Wednesday',
      notes: formData.notes || null,
    })

    setLoading(false)

    if (result.success && result.data) {
      setSuccess(true)
      console.log(`Send WhatsApp to ${formattedPhone}: Farmer ID ${result.data.id} registered`)
    } else {
      setError(result.error ?? 'Registration failed')
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">Registration Complete!</h2>
          <p className="text-lg text-gray-700 mb-4">
            Thank you for registering with Bornfidis Provisions!
          </p>
          <p className="text-gray-600 mb-6">
            We&apos;ll contact you within 24 hours via WhatsApp to discuss:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Pricing for your crops</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Collection schedule</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Quality requirements</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Payment terms</span>
            </li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-400 rounded p-4">
            <p className="font-bold text-yellow-800 mb-2">Questions? Contact us:</p>
            <p className="text-lg font-bold">📱 876-448-8446</p>
            <p className="text-sm text-gray-600">Chef Brian Maylor</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-green-800 to-green-900 text-white rounded-t-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🌱</div>
            <div>
              <h1 className="text-3xl font-bold">Farmer Registration</h1>
              <p className="text-green-100">Bornfidis Provisions - Portland Parish</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-gray-700">
            <strong>🤝 Partnership Opportunity:</strong> We&apos;re looking for quality farmers to
            supply our Villa Chef service and Kingston delivery route. Fair prices, weekly
            collections, long-term partnerships.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-lg shadow-lg p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">
              Personal Information
            </h3>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                placeholder="e.g., Winston Brown"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Phone Number (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                placeholder="876-xxx-xxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll use WhatsApp for quick communication
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">
              Farm Location
            </h3>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Farm Location/District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                placeholder="e.g., Windsor, Moore Town, Manchioneal"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Parish <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.parish}
                onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
              >
                {PARISH_OPTIONS.map((parish) => (
                  <option key={parish} value={parish}>
                    {parish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Farm Name (Optional)
              </label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                placeholder="e.g., Green Valley Farm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">
              What Do You Grow? <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600">Select all that apply</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CROP_OPTIONS.map((crop) => (
                <label
                  key={crop}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                    formData.crops.includes(crop)
                      ? 'bg-green-50 border-green-600'
                      : 'bg-white border-gray-300 hover:border-green-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.crops.includes(crop)}
                    onChange={() => handleCropToggle(crop)}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className="text-sm font-medium">{crop}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">
              Farm Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  Farm Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                  placeholder="e.g., 2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700">
                  Typical Weekly Volume (lbs)
                </label>
                <input
                  type="number"
                  value={formData.weeklyVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, weeklyVolume: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Preferred Collection Day
              </label>
              <select
                value={formData.preferredDay}
                onChange={(e) =>
                  setFormData({ ...formData, preferredDay: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday (Current Route)</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Flexible">Flexible</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Our main collection day is Wednesday
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-600 focus:outline-none"
                rows={3}
                placeholder="Any special information we should know? Organic certification? Specialty crops? Best contact times?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Registering...' : '🌱 Register as Supplier'}
          </button>

          <p className="text-center text-sm text-gray-500">
            By registering, you agree to be contacted by Bornfidis Provisions via WhatsApp to
            discuss partnership opportunities.
          </p>
        </form>

        <div className="mt-6 bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-700">
            <strong>Questions?</strong> Call/WhatsApp Chef Brian:{' '}
            <span className="font-bold text-green-800">876-448-8446</span>
          </p>
        </div>
      </div>
    </div>
  )
}
