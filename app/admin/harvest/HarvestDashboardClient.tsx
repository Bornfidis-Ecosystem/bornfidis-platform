'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HarvestMetric, KingdomFund, ImpactTransaction, HarvestSummary } from '@/types/harvest'
import { ReplicationRegion } from '@/types/replication'
import { formatUSD } from '@/lib/money'

interface HarvestDashboardClientProps {
  initialData: {
    metrics: HarvestMetric[]
    funds: KingdomFund[]
    transactions: ImpactTransaction[]
    regions: ReplicationRegion[]
  }
}

export default function HarvestDashboardClient({ initialData }: HarvestDashboardClientProps) {
  const router = useRouter()
  const [metrics, setMetrics] = useState(initialData.metrics)
  const [funds, setFunds] = useState(initialData.funds)
  const [transactions, setTransactions] = useState(initialData.transactions)
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'funds' | 'transactions'>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculate summary statistics
  const summary: HarvestSummary = metrics.reduce(
    (acc, metric) => ({
      total_food_tons: acc.total_food_tons + metric.food_tons,
      total_farmers_supported: acc.total_farmers_supported + metric.farmers_supported,
      total_chefs_deployed: acc.total_chefs_deployed + metric.chefs_deployed,
      total_meals_served: acc.total_meals_served + metric.meals_served,
      total_land_regenerated_acres: acc.total_land_regenerated_acres + metric.land_regenerated_acres,
      total_disciples_trained: acc.total_disciples_trained + metric.disciples_trained,
      total_community_events: acc.total_community_events + metric.community_events,
      total_scholarships_funded: acc.total_scholarships_funded + metric.scholarships_funded,
    }),
    {
      total_food_tons: 0,
      total_farmers_supported: 0,
      total_chefs_deployed: 0,
      total_meals_served: 0,
      total_land_regenerated_acres: 0,
      total_disciples_trained: 0,
      total_community_events: 0,
      total_scholarships_funded: 0,
    }
  )

  const totalFundBalance = funds.reduce((sum, fund) => sum + fund.balance_cents, 0)

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
          {(['overview', 'metrics', 'funds', 'transactions'] as const).map((tab) => (
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
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Food (Tons)</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_food_tons.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Meals Served</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_meals_served.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Land Regenerated (Acres)</h3>
              <p className="text-3xl font-bold text-[#1a5f3f]">{summary.total_land_regenerated_acres.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Kingdom Funds</h3>
              <p className="text-3xl font-bold text-[#FFBC00]">{formatUSD(totalFundBalance)}</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Farmers Supported</h3>
              <p className="text-2xl font-bold text-[#1a5f3f]">{summary.total_farmers_supported}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Chefs Deployed</h3>
              <p className="text-2xl font-bold text-[#1a5f3f]">{summary.total_chefs_deployed}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Disciples Trained</h3>
              <p className="text-2xl font-bold text-[#1a5f3f]">{summary.total_disciples_trained}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
              Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{transaction.source}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'credit' ? '+' : '-'}
                          {formatUSD(transaction.amount_cents)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{transaction.purpose || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Harvest Metrics</h2>
            <button
              onClick={() => alert('Add Metric - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Add Metric
            </button>
          </div>
          {metrics.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No metrics recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Food (Tons)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Meals</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Land (Acres)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Farmers</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Chefs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.map((metric) => (
                    <tr key={metric.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(metric.period_start).toLocaleDateString()} - {new Date(metric.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{metric.food_tons}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{metric.meals_served.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{metric.land_regenerated_acres}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{metric.farmers_supported}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{metric.chefs_deployed}</td>
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
            <h2 className="text-xl font-semibold text-[#1a5f3f]">Kingdom Funds</h2>
            <button
              onClick={() => alert('Create Fund - Feature coming soon')}
              className="px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
            >
              Create Fund
            </button>
          </div>
          {funds.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No funds created yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funds.map((fund) => (
                <div key={fund.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-[#1a5f3f]">{fund.fund_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      fund.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {fund.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{fund.purpose}</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className="text-2xl font-bold text-[#FFBC00]">{formatUSD(fund.balance_cents)}</p>
                    {fund.target_balance_cents && (
                      <p className="text-sm text-gray-500 mt-1">
                        Target: {formatUSD(fund.target_balance_cents)} ({Math.round((fund.balance_cents / fund.target_balance_cents) * 100)}%)
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 capitalize">Type: {fund.fund_type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
            Impact Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{transaction.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        {formatUSD(transaction.amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{transaction.purpose || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
