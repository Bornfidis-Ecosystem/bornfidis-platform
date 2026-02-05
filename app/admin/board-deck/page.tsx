import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { getBoardDeckData } from '@/lib/board-deck'
import type { BoardDeckPeriod } from '@/lib/board-deck'
import BoardDeckClient from './BoardDeckClient'

export const dynamic = 'force-dynamic'

/** Phase 2AU — Board Deck. Admin only. */
export default async function AdminBoardDeckPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }> | { period?: string }
}) {
  const role = await getCurrentUserRole()
  const roleStr = role ? String(role).toUpperCase() : ''
  if (roleStr !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
        <p className="text-gray-600">Board deck is available to Admin only.</p>
        <Link href="/admin" className="text-[#1a5f3f] hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  const params = typeof searchParams?.then === 'function' ? await searchParams : (searchParams ?? {})
  const period: BoardDeckPeriod = params.period === 'quarter' ? 'quarter' : 'month'
  const data = await getBoardDeckData(period)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-[#1a5f3f] hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Board deck</h1>
        <p className="text-sm text-gray-600 mb-6">
          Auto-generated from live data. Select period, include sections, add narrative. Export PDF (versioned).
        </p>
        <BoardDeckClient initialData={data} />
      </div>
    </div>
  )
}
