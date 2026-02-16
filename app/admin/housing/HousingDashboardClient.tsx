'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HousingProject, HousingResident, LegacyFund, HousingSummary } from '@/types/housing'
import { formatUSD } from '@/lib/money'

interface HousingDashboardClientProps {
  initialData: {
    projects: HousingProject[]
    residents: HousingResident[]
    funds: LegacyFund[]
  }
}

export default function HousingDashboardClient({ initialData }: HousingDashboardClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState(initialData.projects)
  const [residents, setResidents] = useState(initialData.residents)
  const [funds, setFunds] = useState(initialData.funds)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'residents' | 'funds'>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate summary
  const summary: HousingSummary = {
    total_projects: projects.length,
    active_projects: projects.filter(p => p.project_status === 'active').length,
    total_units: projects.reduce((sum, p) => sum + p.units_total, 0),
    occupied_units: projects.reduce((sum, p) => sum + p.units_occupied, 0),
    available_units: projects.reduce((sum, p) => sum + p.units_available, 0),
    total_residents: residents.length,
    active_residents: residents.filter(r => r.status === 'active' || r.status === 'owner').length,
    owners: residents.filter(r => r.status === 'owner').length,
    total_legacy_funds: funds.length,
    total_legacy_balance_cents: funds.reduce((sum, f) => sum + f.balance_cents, 0),
  }

  const activeProjects = projects.filter(p => p.project_status === 'active')
  const activeResidents = residents.filter(r => r.status === 'active' || r.status === 'owner')
  const activeFunds = funds.filter(f => f.is_active)

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
          {(['overview', 'projects', 'residents', 'funds'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-[#FFBC00] text-forestDark'
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
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Projects</h3>
              <p className="text-3xl font-bold text-forestDark">{summary.total_projects}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.active_projects} active</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Units</h3>
              <p className="text-3xl font-bold text-forestDark">{summary.total_units}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.occupied_units} occupied</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Residents</h3>
              <p className="text-3xl font-bold text-forestDark">{summary.active_residents}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.owners} owners</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Legacy Funds</h3>
              <p className="text-3xl font-bold text-gold">{formatUSD(summary.total_legacy_balance_cents)}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.total_legacy_funds} funds</p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-forestDark mb-4 pb-2 border-b border-[#FFBC00]">
              Active Projects
            </h2>
            {activeProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active projects yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-forestDark">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.region}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Units:</span>
                        <span className="ml-2 font-medium">{project.units_occupied}/{project.units_total}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Available:</span>
                        <span className="ml-2 font-medium">{project.units_available}</span>
                      </div>
                    </div>
                    {project.trust_established && (
                      <p className="text-xs text-green-600 mt-2">✓ Trust Established</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Residents */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-forestDark mb-4 pb-2 border-b border-[#FFBC00]">
              Recent Residents
            </h2>
            {activeResidents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active residents yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Equity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeResidents.slice(0, 10).map((resident) => (
                      <tr key={resident.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {projects.find(p => p.id === resident.project_id)?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {formatUSD(resident.equity_cents)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            resident.status === 'owner' ? 'bg-gold text-forestDark' :
                            resident.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {resident.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-forestDark">Project Builder</h2>
            <button
              onClick={() => alert('Add Project - Feature coming soon')}
              className="px-4 py-2 bg-gold text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Project
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trust</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {project.units_occupied}/{project.units_total} ({project.units_available} available)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          project.project_status === 'active' ? 'bg-green-100 text-green-800' :
                          project.project_status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.project_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {project.trust_established ? (
                          <span className="text-green-600">✓</span>
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

      {/* Residents Tab */}
      {activeTab === 'residents' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-forestDark">Resident Equity Tracker</h2>
            <button
              onClick={() => alert('Add Resident - Feature coming soon')}
              className="px-4 py-2 bg-gold text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Resident
            </button>
          </div>
          {residents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No residents yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Equity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Own By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {residents.map((resident) => (
                    <tr key={resident.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resident.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {projects.find(p => p.id === resident.project_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatUSD(resident.equity_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatUSD(resident.monthly_payment_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resident.own_by_date ? new Date(resident.own_by_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          resident.status === 'owner' ? 'bg-gold text-forestDark' :
                          resident.status === 'active' ? 'bg-green-100 text-green-800' :
                          resident.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {resident.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Funds Tab */}
      {activeTab === 'funds' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-forestDark">Trust Dashboard</h2>
            <button
              onClick={() => alert('Create Fund - Feature coming soon')}
              className="px-4 py-2 bg-gold text-forestDark rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Create Fund
            </button>
          </div>
          {funds.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No legacy funds yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funds.map((fund) => (
                <div key={fund.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-forestDark">{fund.family_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{fund.purpose}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      fund.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {fund.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-2xl font-bold text-gold">{formatUSD(fund.balance_cents)}</p>
                    {fund.target_balance_cents && (
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {formatUSD(fund.target_balance_cents)} ({Math.round((fund.balance_cents / fund.target_balance_cents) * 100)}%)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 capitalize">Type: {fund.fund_type}</p>
                  {fund.beneficiary_name && (
                    <p className="text-xs text-gray-500 mt-1">Beneficiary: {fund.beneficiary_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

