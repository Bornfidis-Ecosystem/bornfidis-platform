/**
 * Phase 2AA — Chef Leaderboard
 * Score: Rating 40%, On-time 25%, Prep 20%, Jobs completed 15%.
 * Only chefs with ≥5 jobs in the window appear. Results cached in LeaderboardSnapshot.
 */

import { db } from '@/lib/db'

const WEIGHTS = {
  rating: 0.4,
  onTime: 0.25,
  prep: 0.2,
  jobs: 0.15,
} as const

const DEFAULT_WINDOW_DAYS = 90
const MIN_JOBS = 5
const JOBS_CAP_FOR_PCT = 30 // 30+ jobs = 100% for jobs component

function getScheduledAt(eventDate: Date, eventTime: string | null): Date {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  if (eventTime?.trim()) {
    const parts = eventTime.trim().split(':').map(Number)
    const h = parts[0] ?? 0
    const m = parts[1] ?? 0
    d.setHours(h, m, 0, 0)
  }
  return d
}

export type LeaderboardRow = {
  chefId: string
  name: string | null
  rank: number
  score: number
  ratingPct: number
  onTimePct: number
  prepPct: number
  jobsPct: number
  jobsCompleted: number
  excluded?: boolean
}

/** Public display: rank, name, badges, star rating, "Top Performer" for top 3; no raw percentages. */
export type PublicLeaderboardEntry = {
  rank: number
  chefId: string
  name: string | null
  badgeNames: string[]
  starRating: number // 1–5 display
  topPerformer: boolean // top 3
}

/** Compute metrics for one chef over a date range (completed jobs only). */
async function getChefMetricsInWindow(
  chefId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{
  jobsCompleted: number
  onTimePct: number
  prepPct: number
  avgRating: number
}> {
  const assignments = await db.chefAssignment.findMany({
    where: {
      chefId,
      status: 'COMPLETED',
      booking: {
        eventDate: { gte: periodStart, lte: periodEnd },
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          eventDate: true,
          eventTime: true,
          jobCompletedAt: true,
        },
      },
    },
  })

  const jobsCompleted = assignments.length
  if (jobsCompleted === 0) {
    return { jobsCompleted: 0, onTimePct: 0, prepPct: 0, avgRating: 0 }
  }

  let onTimeCount = 0
  let onTimeDenom = 0
  for (const a of assignments) {
    const at = a.booking.jobCompletedAt
    if (!at) continue
    onTimeDenom++
    const scheduled = getScheduledAt(a.booking.eventDate, a.booking.eventTime)
    if (new Date(at) <= scheduled) onTimeCount++
  }
  const onTimePct = onTimeDenom === 0 ? 0 : (onTimeCount / onTimeDenom) * 100

  const template = await db.prepChecklistTemplate.findFirst({
    where: {},
    orderBy: { createdAt: 'asc' },
  })
  const requiredIndices =
    template?.items && Array.isArray(template.items)
      ? (template.items as { required?: boolean }[])
          .map((item, i) => (item.required ? i : -1))
          .filter((i) => i >= 0)
      : []

  let prepCompleteCount = 0
  let prepDenom = 0
  for (const a of assignments) {
    const checklist = await db.chefPrepChecklist.findUnique({
      where: { bookingId: a.bookingId },
      include: { template: true },
    })
    if (!checklist) continue
    prepDenom++
    const completedMap = (checklist.completed as Record<string, boolean>) ?? {}
    const templateForChecklist = checklist.template ?? template
    const required =
      templateForChecklist?.items && Array.isArray(templateForChecklist.items)
        ? (templateForChecklist.items as { required?: boolean }[])
            .map((item, i) => (item.required ? i : -1))
            .filter((i) => i >= 0)
        : requiredIndices
    const allRequiredChecked =
      required.length === 0 ||
      required.every((i) => completedMap[String(i)] === true)
    if (allRequiredChecked) prepCompleteCount++
  }
  const prepPct = prepDenom === 0 ? 0 : (prepCompleteCount / prepDenom) * 100

  // Rating: from reviews for this chef; only for bookings in window (completed)
  const bookingIds = assignments.map((a) => a.bookingId)
  const reviews = await db.review.findMany({
    where: { chefId, bookingId: { in: bookingIds }, hidden: false },
    select: { rating: true },
  })
  const avgRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return { jobsCompleted, onTimePct, prepPct, avgRating }
}

/** Rating 1–5 → 0–100. */
function ratingToPct(avgRating: number): number {
  if (avgRating <= 0) return 0
  return Math.min(100, ((avgRating - 1) / 4) * 100)
}

/** Jobs component: cap at JOBS_CAP_FOR_PCT. */
function jobsToPct(jobsCompleted: number): number {
  return Math.min(100, (jobsCompleted / JOBS_CAP_FOR_PCT) * 100)
}

/** Get chef IDs excluded from leaderboard. */
async function getExcludedChefIds(): Promise<Set<string>> {
  const rows = await db.chefLeaderboardExclusion.findMany({
    where: { excluded: true },
    select: { chefId: true },
  })
  return new Set(rows.map((r) => r.chefId))
}

/**
 * Recalculate leaderboard and persist to LeaderboardSnapshot.
 * Excluded chefs are omitted. Only chefs with ≥ MIN_JOBS in window are included.
 */
export async function recalculateLeaderboard(options?: {
  windowDays?: number
}): Promise<{ updated: number }> {
  const windowDays = options?.windowDays ?? DEFAULT_WINDOW_DAYS
  const periodEnd = new Date()
  const periodStart = new Date(periodEnd)
  periodStart.setDate(periodStart.getDate() - windowDays)

  const excluded = await getExcludedChefIds()

  const chefIds = await db.chefAssignment
    .findMany({
      where: {
        status: 'COMPLETED',
        booking: {
          eventDate: { gte: periodStart, lte: periodEnd },
        },
      },
      select: { chefId: true },
      distinct: ['chefId'],
    })
    .then((rows) => rows.map((r) => r.chefId))

  const scores: Array<{
    chefId: string
    score: number
    ratingPct: number
    onTimePct: number
    prepPct: number
    jobsPct: number
    jobsCompleted: number
  }> = []

  for (const chefId of chefIds) {
    if (excluded.has(chefId)) continue
    const m = await getChefMetricsInWindow(chefId, periodStart, periodEnd)
    if (m.jobsCompleted < MIN_JOBS) continue

    const ratingPct = ratingToPct(m.avgRating)
    const onTimePct = m.onTimePct
    const prepPct = m.prepPct
    const jobsPct = jobsToPct(m.jobsCompleted)

    const score =
      WEIGHTS.rating * ratingPct +
      WEIGHTS.onTime * onTimePct +
      WEIGHTS.prep * prepPct +
      WEIGHTS.jobs * jobsPct

    scores.push({
      chefId,
      score,
      ratingPct,
      onTimePct,
      prepPct,
      jobsPct,
      jobsCompleted: m.jobsCompleted,
    })
  }

  scores.sort((a, b) => b.score - a.score)

  const calculatedAt = new Date()
  await db.leaderboardSnapshot.deleteMany({})
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]
    await db.leaderboardSnapshot.create({
      data: {
        chefId: s.chefId,
        rank: i + 1,
        score: Math.round(s.score * 100) / 100,
        ratingPct: Math.round(s.ratingPct * 100) / 100,
        onTimePct: Math.round(s.onTimePct * 100) / 100,
        prepPct: Math.round(s.prepPct * 100) / 100,
        jobsPct: Math.round(s.jobsPct * 100) / 100,
        jobsCompleted: s.jobsCompleted,
        periodStart,
        periodEnd,
        calculatedAt,
      },
    })
  }

  return { updated: scores.length }
}

/**
 * Public leaderboard: top N only, no raw percentages. Uses cached snapshot.
 */
export async function getPublicLeaderboard(
  limit: number = 10
): Promise<PublicLeaderboardEntry[]> {
  const snapshots = await db.leaderboardSnapshot.findMany({
    orderBy: { rank: 'asc' },
    take: limit,
    include: {
      chef: {
        select: {
          id: true,
          name: true,
          userBadges: {
            include: { badge: { select: { name: true } } },
          },
        },
      },
    },
  })

  const entries: PublicLeaderboardEntry[] = []
  for (const s of snapshots) {
    const badgeNames = s.chef.userBadges.map((ub) => ub.badge.name)
    const ratingPct = s.ratingPct
    const starRating = Math.round(1 + (ratingPct / 100) * 4)
    const clampedStar = Math.max(1, Math.min(5, starRating))
    entries.push({
      rank: s.rank,
      chefId: s.chef.id,
      name: s.chef.name,
      badgeNames,
      starRating: clampedStar,
      topPerformer: s.rank <= 3,
    })
  }
  return entries
}

/**
 * Admin leaderboard: full list with raw data; excluded chefs shown with flag.
 */
export async function getAdminLeaderboard(): Promise<LeaderboardRow[]> {
  const snapshots = await db.leaderboardSnapshot.findMany({
    orderBy: { rank: 'asc' },
    include: {
      chef: {
        select: { id: true, name: true },
      },
    },
  })

  const excluded = await getExcludedChefIds()
  const excludedChefs = await db.user.findMany({
    where: {
      id: { in: Array.from(excluded) },
      leaderboardExclusion: { excluded: true },
    },
    select: { id: true, name: true },
  })

  const rows: LeaderboardRow[] = snapshots.map((s) => ({
    chefId: s.chef.id,
    name: s.chef.name,
    rank: s.rank,
    score: s.score,
    ratingPct: s.ratingPct,
    onTimePct: s.onTimePct,
    prepPct: s.prepPct,
    jobsPct: s.jobsPct,
    jobsCompleted: s.jobsCompleted,
    excluded: false,
  }))

  for (const u of excludedChefs) {
    rows.push({
      chefId: u.id,
      name: u.name,
      rank: -1,
      score: 0,
      ratingPct: 0,
      onTimePct: 0,
      prepPct: 0,
      jobsPct: 0,
      jobsCompleted: 0,
      excluded: true,
    })
  }

  return rows
}

/**
 * Chef's own rank from cache. Returns null if not on leaderboard or excluded.
 */
export async function getChefRank(chefId: string): Promise<{
  rank: number
  totalOnBoard: number
  topPerformer: boolean
} | null> {
  const exclusion = await db.chefLeaderboardExclusion.findUnique({
    where: { chefId },
    select: { excluded: true },
  })
  if (exclusion?.excluded) return null

  const snapshot = await db.leaderboardSnapshot.findUnique({
    where: { chefId },
    select: { rank: true },
  })
  if (!snapshot) return null

  const totalOnBoard = await db.leaderboardSnapshot.count()
  return {
    rank: snapshot.rank,
    totalOnBoard,
    topPerformer: snapshot.rank <= 3,
  }
}

/**
 * Admin: set chef excluded from leaderboard (temporarily). Next recalc omits them.
 */
export async function setLeaderboardExcluded(
  chefId: string,
  excluded: boolean,
  excludedBy: string | null
): Promise<void> {
  await db.chefLeaderboardExclusion.upsert({
    where: { chefId },
    create: {
      chefId,
      excluded,
      excludedAt: excluded ? new Date() : null,
      excludedBy: excluded ? excludedBy : null,
    },
    update: {
      excluded,
      excludedAt: excluded ? new Date() : null,
      excludedBy: excluded ? excludedBy : null,
    },
  })
  if (excluded) {
    await db.leaderboardSnapshot.deleteMany({ where: { chefId } })
  }
}

/**
 * Get cached snapshot timestamp (for "last updated" display).
 */
export async function getLeaderboardCalculatedAt(): Promise<Date | null> {
  const s = await db.leaderboardSnapshot.findFirst({
    orderBy: { calculatedAt: 'desc' },
    select: { calculatedAt: true },
  })
  return s?.calculatedAt ?? null
}
