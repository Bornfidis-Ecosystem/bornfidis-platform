import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/requireAdmin'
import { QuotesTable } from './QuotesTable'

export const metadata = { title: 'Quotes — Bornfidis Admin' }

export default async function AdminQuotesPage() {
  await requireAdminUser()

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Event quotes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Relational quotes (<code className="rounded bg-gray-100 px-1 text-xs">quotes</code> +{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">bookings</code>) — send drafts after review when{' '}
            <span className="font-medium">QUOTE_AUTO_SEND=false</span>.
          </p>
        </div>
        <Link
          href="/admin/quotes/builder"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
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
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="h-12 border-b border-gray-100 bg-gray-50" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex h-16 items-center gap-4 border-b border-gray-50 px-4">
          <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
