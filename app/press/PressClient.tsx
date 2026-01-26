'use client'

import { PressKit } from '@/types/launch'

interface PressClientProps {
  initialData: {
    pressKits: PressKit[]
  }
}

export default function PressClient({ initialData }: PressClientProps) {
  const handleDownload = async (pressKit: PressKit) => {
    // Track download
    await fetch(`/api/press/download/${pressKit.id}`, { method: 'POST' })
    // Open download
    window.open(pressKit.file_url, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Press Information */}
      <section className="bg-[#f0fdf4] p-8 rounded-lg border border-[#d1fae5]">
        <h2 className="text-2xl font-semibold text-[#1a5f3f] mb-4">Press Contact</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:press@bornfidis.com" className="text-[#1a5f3f] hover:underline">
              press@bornfidis.com
            </a>
          </p>
          <p>
            <strong>For Media Inquiries:</strong> Please use the contact information above or submit a partner inquiry.
          </p>
        </div>
      </section>

      {/* Press Kits */}
      <section>
        <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6">Download Press Kit</h2>
        {initialData.pressKits.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500 mb-2">Press kit coming soon!</p>
            <p className="text-sm text-gray-600">
              We're preparing comprehensive media resources. Check back soon or contact us directly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {initialData.pressKits.map((kit) => (
              <div key={kit.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#1a5f3f] transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">{kit.title}</h3>
                    {kit.description && (
                      <p className="text-gray-600 mb-2">{kit.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Version {kit.version}</span>
                      {kit.file_size_bytes && (
                        <span>{(kit.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      <span>{kit.download_count} downloads</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(kit)}
                    className="px-6 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition whitespace-nowrap"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media Guidelines */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-[#1a5f3f] mb-4">Media Guidelines</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            When covering Bornfidis Provisions, please:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Accurately represent our mission and values</li>
            <li>Use official branding and logos from the press kit</li>
            <li>Credit photographers and content creators</li>
            <li>Contact us for interviews or additional information</li>
            <li>Respect the privacy of our community members</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
