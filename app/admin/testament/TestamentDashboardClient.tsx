'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LivingTestament, CommissionedLeader, TestamentSummary } from '@/types/testament'

interface TestamentDashboardClientProps {
  initialData: {
    testimonies: LivingTestament[]
    leaders: CommissionedLeader[]
  }
}

export default function TestamentDashboardClient({ initialData }: TestamentDashboardClientProps) {
  const router = useRouter()
  const [testimonies, setTestimonies] = useState(initialData.testimonies)
  const [leaders, setLeaders] = useState(initialData.leaders)
  const [activeTab, setActiveTab] = useState<'overview' | 'testimonies' | 'leaders' | 'scripture'>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate summary
  const summary: TestamentSummary = {
    total_testimonies: testimonies.length,
    public_testimonies: testimonies.filter(t => t.is_public).length,
    featured_testimonies: testimonies.filter(t => t.is_featured).length,
    total_commissioned: leaders.length,
    covenant_signed_count: leaders.filter(l => l.covenant_signed).length,
    public_leaders: leaders.filter(l => l.is_public).length,
  }

  const featuredTestimonies = testimonies.filter(t => t.is_featured).slice(0, 5)
  const publicLeaders = leaders.filter(l => l.is_public && l.covenant_signed)

  return (
    <div className="space-y-6">
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'testimonies', 'leaders', 'scripture'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-[#FFBC00] text-[#1a5f3f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Testimonies</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_testimonies}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.public_testimonies} public</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Featured Testimonies</h3>
              <p className="text-3xl font-bold text-[#FFBC00]">{summary.featured_testimonies}</p>
              <p className="text-xs text-gray-500 mt-1">On public page</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Commissioned Leaders</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_commissioned}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.covenant_signed_count} signed covenant</p>
            </div>
          </div>

          {/* Featured Testimonies */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Featured Testimonies
            </h2>
            {featuredTestimonies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No featured testimonies yet.</p>
            ) : (
              <div className="space-y-4">
                {featuredTestimonies.map((testimony) => (
                  <div key={testimony.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-[#1a5f3f]">{testimony.title}</h3>
                    <p className="text-sm text-gray-600 italic mb-2">"{testimony.scripture}"</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{testimony.testimony}</p>
                    {testimony.author_name && (
                      <p className="text-xs text-gray-500 mt-2">— {testimony.author_name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commissioned Leaders */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Commissioned Leaders
            </h2>
            {publicLeaders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No public commissioned leaders yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicLeaders.slice(0, 6).map((leader) => (
                  <div key={leader.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-[#1a5f3f]">{leader.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{leader.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{leader.region}</p>
                    {leader.covenant_signed && (
                      <p className="text-xs text-green-600 mt-2">✓ Covenant Signed</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Testimonies Tab */}
      {activeTab === 'testimonies' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Write Testimonies</h2>
            <button
              onClick={() => alert('Add Testimony - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Testimony
            </button>
          </div>
          {testimonies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No testimonies yet.</p>
          ) : (
            <div className="space-y-4">
              {testimonies.map((testimony) => (
                <div key={testimony.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1a5f3f]">{testimony.title}</h3>
                      <p className="text-sm text-gray-600 italic">"{testimony.scripture}"</p>
                    </div>
                    <div className="flex gap-2">
                      {testimony.is_featured && (
                        <span className="px-2 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      )}
                      {testimony.is_public && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">{testimony.testimony}</p>
                  {testimony.author_name && (
                    <p className="text-xs text-gray-500">— {testimony.author_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaders Tab */}
      {activeTab === 'leaders' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Commission Leaders</h2>
            <button
              onClick={() => alert('Commission Leader - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Commission Leader
            </button>
          </div>
          {leaders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No commissioned leaders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commissioned</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Covenant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaders.map((leader) => (
                    <tr key={leader.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leader.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{leader.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leader.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leader.commissioned_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {leader.covenant_signed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Signed
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scripture Tab */}
      {activeTab === 'scripture' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Publish Scripture Anchors
          </h2>
          <p className="text-gray-600 mb-4">
            Scripture anchors are published through testimonies. Each testimony includes a scripture reference
            and can be featured on the public testament page.
          </p>
          <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#d1fae5]">
            <p className="text-sm text-gray-700">
              To publish a scripture anchor, create a testimony with a scripture reference. Featured testimonies
              will appear prominently on the public testament page.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
