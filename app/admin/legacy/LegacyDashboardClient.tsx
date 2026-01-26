'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LegacyLeader, LegacyDocument, PrayerRequest, LegacySummary } from '@/types/legacy'

interface LegacyDashboardClientProps {
  initialData: {
    leaders: LegacyLeader[]
    documents: LegacyDocument[]
    prayers: PrayerRequest[]
  }
}

export default function LegacyDashboardClient({ initialData }: LegacyDashboardClientProps) {
  const router = useRouter()
  const [leaders, setLeaders] = useState(initialData.leaders)
  const [documents, setDocuments] = useState(initialData.documents)
  const [prayers, setPrayers] = useState(initialData.prayers)
  const [activeTab, setActiveTab] = useState<'overview' | 'succession' | 'documents' | 'prayers'>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate summary
  const summary: LegacySummary = {
    total_leaders: leaders.length,
    succession_ready_count: leaders.filter(l => l.succession_ready).length,
    active_leaders: leaders.filter(l => l.status === 'active').length,
    total_documents: documents.length,
    public_documents: documents.filter(d => d.is_public).length,
    total_prayer_requests: prayers.length,
    answered_prayers: prayers.filter(p => p.answered).length,
    unanswered_prayers: prayers.filter(p => !p.answered).length,
  }

  const successionReadyLeaders = leaders.filter(l => l.succession_ready)
  const activeDocuments = documents.filter(d => d.is_active)
  const unansweredPrayers = prayers.filter(p => !p.answered).slice(0, 10)

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
          {(['overview', 'succession', 'documents', 'prayers'] as const).map((tab) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Leaders</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_leaders}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.active_leaders} active</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Succession Ready</h3>
              <p className="text-3xl font-bold text-[#FFBC00]">{summary.succession_ready_count}</p>
              <p className="text-xs text-gray-500 mt-1">Leaders prepared</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Legacy Documents</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_documents}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.public_documents} public</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Prayer Requests</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_prayer_requests}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.answered_prayers} answered</p>
            </div>
          </div>

          {/* Succession Ready Leaders */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Succession Ready Leaders
            </h2>
            {successionReadyLeaders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No succession-ready leaders yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {successionReadyLeaders.map((leader) => (
                  <div key={leader.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-[#1a5f3f]">{leader.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{leader.role}</p>
                    {leader.region && <p className="text-xs text-gray-500 mt-1">{leader.region}</p>}
                    {leader.succession_notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">{leader.succession_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prayer Requests */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Recent Prayer Requests
            </h2>
            {unansweredPrayers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No unanswered prayer requests.</p>
            ) : (
              <div className="space-y-3">
                {unansweredPrayers.map((prayer) => (
                  <div key={prayer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{prayer.submitted_by}</p>
                        {prayer.region && <p className="text-xs text-gray-500">{prayer.region}</p>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(prayer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{prayer.request}</p>
                    <p className="text-xs text-gray-500 mt-2">Prayers: {prayer.prayer_count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Succession Tab */}
      {activeTab === 'succession' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Succession Planner</h2>
            <button
              onClick={() => alert('Add Leader - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Leader
            </button>
          </div>
          {leaders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leaders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Succession Ready</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaders.map((leader) => (
                    <tr key={leader.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{leader.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{leader.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leader.region || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          leader.status === 'active' ? 'bg-green-100 text-green-800' :
                          leader.status === 'emeritus' ? 'bg-gray-100 text-gray-800' :
                          leader.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {leader.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {leader.succession_ready ? (
                          <span className="px-2 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-full text-xs font-semibold">
                            Ready
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

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Vision Archive</h2>
            <button
              onClick={() => alert('Add Document - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Document
            </button>
          </div>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents yet.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1a5f3f]">{doc.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{doc.category}</p>
                    </div>
                    <div className="flex gap-2">
                      {doc.is_public && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Public
                        </span>
                      )}
                      {doc.is_active && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {doc.summary && <p className="text-sm text-gray-700 mt-2">{doc.summary}</p>}
                  <p className="text-xs text-gray-500 mt-2">Version {doc.version}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prayers Tab */}
      {activeTab === 'prayers' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Prayer Dashboard
          </h2>
          {prayers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No prayer requests yet.</p>
          ) : (
            <div className="space-y-4">
              {prayers.map((prayer) => (
                <div key={prayer.id} className={`border rounded-lg p-4 ${
                  prayer.answered ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{prayer.submitted_by}</p>
                      {prayer.region && <p className="text-xs text-gray-500">{prayer.region}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {new Date(prayer.created_at).toLocaleDateString()}
                      </span>
                      {prayer.answered && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Answered
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{prayer.request}</p>
                  {prayer.answered && prayer.answer && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-1">Answer:</p>
                      <p className="text-sm text-green-700">{prayer.answer}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Prayers: {prayer.prayer_count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
