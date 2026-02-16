import Link from 'next/link'
import { db } from '@/lib/db'
import { BASE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AI — Admin FX rates view. All calculations in USD; rates for display + payout lock.
 */
export default async function AdminCurrencyPage() {
  const rates = await db.currencyRate.findMany({
    where: { fromCode: BASE_CURRENCY },
    orderBy: { toCode: 'asc' },
  })
  const byTo = Object.fromEntries(rates.map((r) => [r.toCode, { rate: r.rate, fetchedAt: r.fetchedAt }]))
  const allowNonUsd = process.env.NON_USD_PAYOUTS_ENABLED === 'true'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-forestDark hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Currency & FX rates</h1>
        <p className="text-sm text-gray-600 mb-6">
          Base currency is USD. Rates are used to lock payout conversion at payout time. Reports always reconcile to USD.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Non-USD payouts
          </h2>
          <p className="text-sm text-gray-600">
            {allowNonUsd ? (
              <span className="text-green-700">Enabled</span>
            ) : (
              <span className="text-amber-700">Disabled</span>
            )}{' '}
            (set <code className="bg-gray-100 px-1 rounded">NON_USD_PAYOUTS_ENABLED=true</code> to allow)
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide p-4 border-b border-gray-200">
            Latest rates (USD → other)
          </h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Pair</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Last updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {SUPPORTED_CURRENCIES.filter((c) => c !== BASE_CURRENCY).map((to) => {
                const row = byTo[to]
                return (
                  <tr key={to} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{BASE_CURRENCY} → {to}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {row ? row.rate.toFixed(4) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {row?.fetchedAt
                        ? new Date(row.fetchedAt).toLocaleString('en-US', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Not set'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="p-4 text-xs text-gray-500 border-t border-gray-200">
            Rates are updated daily by cron (<code>/api/cron/currency-rates</code>). Locked per payout at creation; no retroactive changes.
          </p>
        </div>
      </div>
    </div>
  )
}

