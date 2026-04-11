import Link from 'next/link'
import { formatUSD } from '@/lib/money'
import type { AdminPaymentHealth } from '@/lib/admin-payment-health'

type Props = {
  data: AdminPaymentHealth | null
}

/**
 * Founder dashboard: quick read on Provisions payment throughput vs pending work.
 */
export default function PaymentHealthSection({ data }: Props) {
  if (!data) {
    return (
      <section className="min-w-0">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em] mb-5 pb-2 border-b border-stone-200">
          Payment health
        </h2>
        <p className="text-sm text-stone-500">Payment metrics unavailable.</p>
      </section>
    )
  }

  const weekLabel = `Rolling 7 days from ${new Date(data.weekStartIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <section className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5 pb-2 border-b border-stone-200">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.2em]">Payment health</h2>
        <p className="text-[11px] text-stone-400">{weekLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 border-t-2 border-t-[#1A3C34]">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Deposits received</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-[#1A3C34] tabular-nums">{data.depositsReceivedCount}</p>
          <p className="mt-1 text-xs text-stone-500">{formatUSD(data.depositsReceivedCents)} est.</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 border-t-2 border-t-amber-600/80">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Balances received</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-[#1A3C34] tabular-nums">{data.balancesReceivedCount}</p>
          <p className="mt-1 text-xs text-stone-500">{formatUSD(data.balancesReceivedCents)} est.</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Pending deposits</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-navy tabular-nums">{data.pendingDepositsCount}</p>
          <p className="mt-1 text-xs text-stone-500">Quoted, no deposit yet</p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">Pending balances</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-navy tabular-nums">{data.pendingBalancesCount}</p>
          <p className="mt-1 text-xs text-stone-500">Deposit in, balance due</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/admin/bookings" className="font-semibold text-[#1A3C34] hover:underline">
          Open bookings →
        </Link>
        <Link href="/admin/bookings?deposit=pending" className="text-stone-600 hover:text-[#1A3C34] hover:underline">
          Pending deposits
        </Link>
        <Link href="/admin/bookings?balance=pending" className="text-stone-600 hover:text-[#1A3C34] hover:underline">
          Pending balances
        </Link>
      </div>
    </section>
  )
}
