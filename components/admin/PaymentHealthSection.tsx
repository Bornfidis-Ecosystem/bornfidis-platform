import Link from 'next/link'
import { formatUSD } from '@/lib/money'
import type { AdminPaymentHealth } from '@/lib/admin-payment-health'
import { CulinaryCard } from '@/components/culinary-os'

type Props = {
  data: AdminPaymentHealth | null
}

const sectionHeading =
  'mb-5 border-b border-culinary-outline pb-2 font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted'

/**
 * Founder dashboard: quick read on Provisions payment throughput vs pending work.
 */
export default function PaymentHealthSection({ data }: Props) {
  if (!data) {
    return (
      <section className="min-w-0">
        <h2 className={sectionHeading}>Payment health</h2>
        <p className="font-culinary-sans text-sm text-culinary-text-muted">Payment metrics unavailable.</p>
      </section>
    )
  }

  const weekLabel = `Rolling 7 days from ${new Date(data.weekStartIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <section className="min-w-0">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-culinary-outline pb-2">
        <h2 className="font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-text-muted">Payment health</h2>
        <p className="font-culinary-sans text-[11px] text-culinary-text-muted">{weekLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CulinaryCard className="border-t-2 border-t-culinary-navy">
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Deposits received
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">{data.depositsReceivedCount}</p>
          <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">{formatUSD(data.depositsReceivedCents)} est.</p>
        </CulinaryCard>
        <CulinaryCard className="border-t-2 border-t-amber-600/80">
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Balances received
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">{data.balancesReceivedCount}</p>
          <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">{formatUSD(data.balancesReceivedCents)} est.</p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Pending deposits
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">{data.pendingDepositsCount}</p>
          <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">Quoted, no deposit yet</p>
        </CulinaryCard>
        <CulinaryCard>
          <p className="font-culinary-sans text-[11px] font-bold uppercase tracking-[0.12em] text-culinary-text-muted">
            Pending balances
          </p>
          <p className="mt-2 font-culinary-display text-2xl font-semibold tabular-nums text-culinary-navy">{data.pendingBalancesCount}</p>
          <p className="mt-1 font-culinary-sans text-xs text-culinary-text-muted">Deposit in, balance due</p>
        </CulinaryCard>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-culinary-sans text-sm">
        <Link href="/admin/bookings" className="font-semibold text-culinary-navy underline decoration-culinary-gold-line underline-offset-2 hover:text-culinary-text-muted">
          Open bookings →
        </Link>
        <Link
          href="/admin/bookings?deposit=pending"
          className="text-culinary-text-muted hover:text-culinary-navy hover:underline"
        >
          Pending deposits
        </Link>
        <Link
          href="/admin/bookings?balance=pending"
          className="text-culinary-text-muted hover:text-culinary-navy hover:underline"
        >
          Pending balances
        </Link>
      </div>
    </section>
  )
}
