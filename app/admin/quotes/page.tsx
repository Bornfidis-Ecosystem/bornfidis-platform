import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/requireAdmin'
import { CulinaryCard } from '@/components/culinary-os'
import { QuotesTable } from './QuotesTable'

export const metadata = { title: 'Quotes — Bornfidis Admin' }

export default async function AdminQuotesPage() {
  await requireAdminUser()

  return (
    <div className="mx-auto max-w-7xl px-gutter py-stack-md">
      <div className="mb-stack-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-culinary-display text-xl font-medium text-culinary-ink">Event quotes</h1>
          <p className="mt-0.5 font-culinary-sans text-sm text-culinary-text-muted">
            Relational quotes (
            <code className="rounded-none border border-culinary-outline bg-culinary-surface-low px-1 font-mono text-xs text-culinary-ink">
              quotes
            </code>{' '}
            +{' '}
            <code className="rounded-none border border-culinary-outline bg-culinary-surface-low px-1 font-mono text-xs text-culinary-ink">
              bookings
            </code>
            ) — send drafts after review when <span className="font-medium text-culinary-ink">QUOTE_AUTO_SEND=false</span>.
          </p>
        </div>
        <Link
          href="/admin/quotes/builder"
          className="inline-flex shrink-0 items-center justify-center rounded-none border border-culinary-outline bg-culinary-bone px-4 py-2 font-culinary-sans text-sm font-medium text-culinary-navy transition-colors duration-refined ease-refined hover:border-culinary-gold-line hover:bg-culinary-surface-low"
        >
          Manual quote builder
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <QuotesTable />
      </Suspense>
    </div>
  )
}

function TableSkeleton() {
  return (
    <CulinaryCard padded={false} className="overflow-hidden">
      <div className="h-12 border-b border-culinary-outline bg-culinary-surface-low" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex h-16 items-center gap-4 border-b border-culinary-outline px-gutter">
          <div className="h-3 w-32 animate-pulse rounded-none bg-culinary-surface-high" />
          <div className="h-3 w-48 max-w-[40%] animate-pulse rounded-none bg-culinary-surface-high" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded-none bg-culinary-surface-high" />
        </div>
      ))}
    </CulinaryCard>
  )
}
