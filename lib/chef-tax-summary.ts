/**
 * Phase 2AF — Chef annual tax summary (prior calendar year).
 * Read-only aggregation from ChefAssignment + BookingInquiry (PAID payouts). No new schema.
 */

import { db } from '@/lib/db'

export type TaxSummaryPayoutRow = {
  date: string
  amountCents: number
  serviceName: string
}

export type ChefTaxSummaryData = {
  chefId: string
  chefName: string
  chefEmail: string
  year: number
  totalGrossCents: number
  jobCount: number
  totalBonusCents: number
  payoutDates: string[]
  rows: TaxSummaryPayoutRow[]
}

/**
 * Get tax summary data for one chef for a calendar year (PAID payouts only).
 */
export async function getChefTaxSummaryData(
  chefId: string,
  year: number
): Promise<ChefTaxSummaryData | null> {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)

  const chef = await db.user.findUnique({
    where: { id: chefId },
    select: { name: true, email: true },
  })
  if (!chef?.email) return null

  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: 'COMPLETED',
      booking: {
        chefPayoutStatus: 'paid',
        chefPayoutPaidAt: { gte: start, lte: end },
        chefPayoutAmountCents: { not: null },
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          name: true,
          chefPayoutAmountCents: true,
          chefPayoutBonusCents: true,
          chefPayoutPaidAt: true,
        },
      },
    },
    orderBy: { booking: { chefPayoutPaidAt: 'asc' } },
  })

  if (assignments.length === 0) return null

  let totalGrossCents = 0
  let totalBonusCents = 0
  const payoutDates: string[] = []
  const rows: TaxSummaryPayoutRow[] = []

  for (const a of assignments) {
    const b = a.booking
    const amountCents = b.chefPayoutAmountCents ?? 0
    const bonusCents = b.chefPayoutBonusCents ?? 0
    const paidAt = b.chefPayoutPaidAt!
    const dateStr = paidAt.toISOString().split('T')[0]

    totalGrossCents += amountCents
    totalBonusCents += bonusCents
    payoutDates.push(dateStr)
    rows.push({
      date: dateStr,
      amountCents,
      serviceName: b.name,
    })
  }

  return {
    chefId,
    chefName: chef.name ?? 'Chef',
    chefEmail: chef.email,
    year,
    totalGrossCents,
    jobCount: assignments.length,
    totalBonusCents,
    payoutDates: [...new Set(payoutDates)].sort(),
    rows,
  }
}

/**
 * List chef IDs that have at least one PAID payout in the given calendar year.
 */
export async function getChefIdsWithPaidJobsInYear(year: number): Promise<string[]> {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)

  const assignments = await db.chefAssignment.findMany({
    where: {
      status: 'COMPLETED',
      booking: {
        chefPayoutStatus: 'paid',
        chefPayoutPaidAt: { gte: start, lte: end },
      },
    },
    select: { chefId: true },
    distinct: ['chefId'],
  })

  return assignments.map((a) => a.chefId)
}
