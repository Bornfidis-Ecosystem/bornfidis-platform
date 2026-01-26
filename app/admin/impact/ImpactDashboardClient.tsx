'use client'

import { formatUSD } from '@/lib/money'

import { ImpactEvent } from '@/types/impact'

interface ImpactData {
  totalRevenue: number
  completedBookings: number
  totalFarmers: number
  totalChefs: number
  avgRegenerativeScore: number
  totalFarmerIncome: number
  communityMealsFunded: number
  totalIngredients: number
  familiesSupported: number
  totalSoilPoints: number
  impactEvents: ImpactEvent[]
  recentSnapshots: any[]
}

interface ImpactDashboardClientProps {
  impactData: ImpactData
}

export default function ImpactDashboardClient({ impactData }: ImpactDashboardClientProps) {
  const getRegenerativeScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRegenerativeScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Soil Health Score */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-[#1a5f3f]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a5f3f]">Regenerative Score</h3>
            <div className={`text-3xl font-bold ${getRegenerativeScoreColor(impactData.avgRegenerativeScore)}`}>
              {impactData.avgRegenerativeScore}
            </div>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getRegenerativeScoreBg(impactData.avgRegenerativeScore)} transition-all`}
              style={{ width: `${impactData.avgRegenerativeScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Average regenerative score across {impactData.totalIngredients} ingredient{impactData.totalIngredients !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Farmer Income */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-[#FFBC00]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a5f3f]">Farmer Income</h3>
            <div className="text-3xl font-bold text-[#1a5f3f]">
              {formatUSD(impactData.totalFarmerIncome)}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total paid to {impactData.totalFarmers} regenerative farmer{impactData.totalFarmers !== 1 ? 's' : ''}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Network Size:</span>
              <span className="font-semibold">{impactData.totalFarmers} farmers, {impactData.totalChefs} chefs</span>
            </div>
          </div>
        </div>

        {/* Community Meals */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a5f3f]">Community Meals</h3>
            <div className="text-3xl font-bold text-green-600">
              {impactData.communityMealsFunded.toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Estimated meals funded through our platform
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Completed Events:</span>
              <span className="font-semibold">{impactData.completedBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Impact */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a5f3f] mb-4">Revenue & Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-[#1a5f3f]">{formatUSD(impactData.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Bookings</span>
              <span className="font-semibold">{impactData.completedBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average per Booking</span>
              <span className="font-semibold">
                {impactData.completedBookings > 0
                  ? formatUSD(Math.round(impactData.totalRevenue / impactData.completedBookings))
                  : '$0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a5f3f] mb-4">Network Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Farmers</span>
              <span className="font-semibold text-green-600">{impactData.totalFarmers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Chefs</span>
              <span className="font-semibold text-blue-600">{impactData.totalChefs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingredients Sourced</span>
              <span className="font-semibold">{impactData.totalIngredients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Farmer Income</span>
              <span className="font-semibold text-[#1a5f3f]">
                {impactData.totalFarmers > 0
                  ? formatUSD(Math.round(impactData.totalFarmerIncome / impactData.totalFarmers))
                  : '$0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Message */}
      <div className="bg-gradient-to-r from-[#1a5f3f] to-[#154a32] rounded-lg shadow-lg p-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Our Regenerative Impact</h2>
          <div className="h-1 w-24 bg-[#FFBC00] mb-4"></div>
          <p className="text-green-100 leading-relaxed mb-4">
            Through Island Harvest Hub, we're building a regenerative food system that supports local farmers,
            creates meaningful income opportunities, and brings communities together around faith-anchored meals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-3xl font-bold text-[#FFBC00] mb-1">{formatUSD(impactData.totalFarmerIncome)}</div>
              <div className="text-sm text-green-100">Paid to Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FFBC00] mb-1">{impactData.communityMealsFunded.toLocaleString()}</div>
              <div className="text-sm text-green-100">Community Meals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FFBC00] mb-1">{impactData.avgRegenerativeScore}%</div>
              <div className="text-sm text-green-100">Regenerative Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scripture */}
      <div className="text-center text-gray-500 text-sm italic">
        <p>"The earth is the Lord's, and everything in it, the world, and all who live in it."</p>
        <p className="mt-2 font-semibold">— Psalm 24:1</p>
      </div>
    </div>
  )
}
