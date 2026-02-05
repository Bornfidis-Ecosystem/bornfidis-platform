'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LeaderboardRow } from '@/lib/leaderboard'
import {
  recalculateLeaderboardAction,
  setLeaderboardExcludedAction,
} from './actions'

type Props = {
  rows: LeaderboardRow[]
  calculatedAt: Date | null
}

export default function LeaderboardAdminClient({ rows, calculatedAt }: Props) {
  const [recalculating, setRecalculating] = useState(false)
  const [recalcMessage, setRecalcMessage] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const ranked = rows.filter((r) => !r.excluded)
  const excluded = rows.filter((r) => r.excluded)

  async function handleRecalculate() {
    setRecalculating(true)
    setRecalcMessage(null)
    const res = await recalculateLeaderboardAction()
    setRecalculating(false)
    if (res.ok) {
      setRecalcMessage(`Updated ${res.updated ?? 0} chefs.`)
    } else {
      setRecalcMessage(res.error ?? 'Failed')
    }
  }

  async function handleExclude(chefId: string, excluded: boolean) {
    setToggling(chefId)
    await setLeaderboardExcludedAction(chefId, excluded)
    setToggling(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-medium hover:bg-[#144a30] disabled:opacity-50"
        >
          {recalculating ? 'Recalculating…' : 'Recalculate now'}
        </button>
        {recalcMessage && (
          <span className="text-sm text-gray-600">{recalcMessage}</span>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ranked chefs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rating %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">On-time %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prep %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jobs %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Jobs</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ranked.map((r) => (
                <tr key={r.chefId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{r.rank}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/chefs/${r.chefId}`}
                      className="text-[#1a5f3f] hover:underline"
                    >
                      {r.name ?? r.chefId}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{r.score.toFixed(1)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.ratingPct.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.onTimePct.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.prepPct.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.jobsPct.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.jobsCompleted}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleExclude(r.chefId, true)}
                      disabled={toggling === r.chefId}
                      className="text-amber-600 hover:underline text-sm disabled:opacity-50"
                    >
                      {toggling === r.chefId ? '…' : 'Exclude'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ranked.length === 0 && (
          <p className="px-4 py-6 text-gray-500 text-center">
            No ranked chefs. Run &quot;Recalculate now&quot; or add exclusions.
          </p>
        )}
      </div>

      {excluded.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Excluded (temporarily hidden from public)</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {excluded.map((r) => (
              <li
                key={r.chefId}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <Link
                    href={`/admin/chefs/${r.chefId}`}
                    className="text-[#1a5f3f] hover:underline font-medium"
                  >
                    {r.name ?? r.chefId}
                  </Link>
                  <span className="ml-2 text-xs text-amber-600">Excluded</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleExclude(r.chefId, false)}
                  disabled={toggling === r.chefId}
                  className="text-sm text-green-600 hover:underline disabled:opacity-50"
                >
                  {toggling === r.chefId ? '…' : 'Include again'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
