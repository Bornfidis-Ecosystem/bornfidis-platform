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
            Relational quotes queue (
            <code className="rounded-none border border-culinary-outline bg-culinary-surface-low px-1 font-mono text-xs text-culinary-ink">
              quotes
            </code>
            ). Live deposit path is{' '}
            <Link href="/admin/bookings" className="underline decoration-culinary-gold-line underline-offset-2">
              Bookings → Quote &amp; Payment
            </Link>
            . Manual preview builder is Labs-only.
          </p>
        </div>
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
