/**
 * Phase 2AV — Margin Guardrails
 * Enforce minimum margins and bonus/tier caps at pricing preview, booking confirmation, and payout creation.
 */

import { db } from '@/lib/db'

export type MarginGuardrailConfigRow = {
  id: string
  regionCode: string | null
  minGrossMarginPct: number
  maxBonusPlusTierPct: number
  maxSurgeMultiplier: number | null
  minJobValueCents: number | null
  blockOrWarn: boolean
}

export type MarginCheckInput = {
  quoteTotalCents: number
  chefPayoutAmountCents: number
  chefPayoutBaseCents: number  // after tier
  chefPayoutBonusCents: number
  chefRateMultiplier: number | null  // for tier uplift calc
  surgeMultiplier: number | null
  jobValueCents: number  // subtotal after region (for min job value)
  regionCode: string | null
}

export type MarginCheckResult = {
  pass: boolean
  blockOrWarn: boolean  // true = block when fail, false = warn
  grossMarginPct: number
  bonusPlusTierPct: number
  message?: string
  failReasons: string[]
}

/**
 * Get guardrail config for a region. Region-specific overrides global (regionCode null).
 */
export async function getMarginGuardrailConfig(
  regionCode: string | null | undefined
): Promise<MarginGuardrailConfigRow | null> {
  const code = regionCode?.trim()?.toUpperCase() || null
  // Prefer region-specific, then global (regionCode is null)
  const regionRow = code
    ? await db.marginGuardrailConfig.findUnique({ where: { regionCode: code } })
    : null
  if (regionRow)
    return {
      id: regionRow.id,
      regionCode: regionRow.regionCode,
      minGrossMarginPct: regionRow.minGrossMarginPct,
      maxBonusPlusTierPct: regionRow.maxBonusPlusTierPct,
      maxSurgeMultiplier: regionRow.maxSurgeMultiplier,
      minJobValueCents: regionRow.minJobValueCents,
      blockOrWarn: regionRow.blockOrWarn,
    }
  const globalRow = await db.marginGuardrailConfig.findUnique({
    where: { regionCode: null },
  })
  if (!globalRow) return null
  return {
    id: globalRow.id,
    regionCode: globalRow.regionCode,
    minGrossMarginPct: globalRow.minGrossMarginPct,
    maxBonusPlusTierPct: globalRow.maxBonusPlusTierPct,
    maxSurgeMultiplier: globalRow.maxSurgeMultiplier,
    minJobValueCents: globalRow.minJobValueCents,
    blockOrWarn: globalRow.blockOrWarn,
  }
}

/**
 * Check margin guardrails. Order: base → region → surge → tier → bonus → check margin.
 * Returns pass/fail and fail reasons (min margin, bonus+tier cap, max surge, min job value).
 */
export async function checkMargin(input: MarginCheckInput): Promise<MarginCheckResult> {
  const failReasons: string[] = []
  const {
    quoteTotalCents,
    chefPayoutAmountCents,
    chefPayoutBaseCents,
    chefPayoutBonusCents,
    chefRateMultiplier,
    surgeMultiplier,
    jobValueCents,
    regionCode,
  } = input

  const config = await getMarginGuardrailConfig(regionCode)
  if (!config) {
    return {
      pass: true,
      blockOrWarn: true,
      grossMarginPct: quoteTotalCents > 0 ? ((quoteTotalCents - chefPayoutAmountCents) / quoteTotalCents) * 100 : 0,
      bonusPlusTierPct: quoteTotalCents > 0 ? 0 : 0,
      failReasons: [],
    }
  }

  // Gross margin: (revenue - chef cost) / revenue
  const grossMarginPct =
    quoteTotalCents > 0
      ? ((quoteTotalCents - chefPayoutAmountCents) / quoteTotalCents) * 100
      : 0
  if (grossMarginPct < config.minGrossMarginPct)
    failReasons.push(
      `Gross margin ${grossMarginPct.toFixed(1)}% is below minimum ${config.minGrossMarginPct}%`
    )

  // Bonus + tier uplift as % of quote
  const multiplier = chefRateMultiplier ?? 1
  const baseBeforeTier =
    multiplier > 0 ? Math.round(chefPayoutBaseCents / multiplier) : chefPayoutBaseCents
  const tierUpliftCents = chefPayoutBaseCents - baseBeforeTier
  const bonusPlusTierCents = tierUpliftCents + chefPayoutBonusCents
  const bonusPlusTierPct =
    quoteTotalCents > 0 ? (bonusPlusTierCents / quoteTotalCents) * 100 : 0
  if (bonusPlusTierPct > config.maxBonusPlusTierPct)
    failReasons.push(
      `Bonus + tier uplift ${bonusPlusTierPct.toFixed(1)}% exceeds max ${config.maxBonusPlusTierPct}%`
    )

  // Max surge cap (per region)
  if (
    config.maxSurgeMultiplier != null &&
    surgeMultiplier != null &&
    surgeMultiplier > config.maxSurgeMultiplier
  )
    failReasons.push(
      `Surge multiplier ${surgeMultiplier} exceeds region cap ${config.maxSurgeMultiplier}`
    )

  // Min job value (per region)
  if (
    config.minJobValueCents != null &&
    jobValueCents < config.minJobValueCents
  )
    failReasons.push(
      `Job value ${jobValueCents}¢ is below minimum ${config.minJobValueCents}¢`
    )

  const pass = failReasons.length === 0
  return {
    pass,
    blockOrWarn: config.blockOrWarn,
    grossMarginPct,
    bonusPlusTierPct,
    message:
      failReasons.length > 0 ? failReasons.join('; ') : undefined,
    failReasons,
  }
}

/**
 * Log an admin override (block overridden or warn overridden).
 */
export async function logMarginOverride(
  bookingId: string,
  userId: string,
  action: string,
  reason?: string | null
): Promise<void> {
  await db.marginOverrideLog.create({
    data: {
      bookingId,
      userId,
      action,
      reason: reason ?? null,
    },
  })
}

/**
 * List all guardrail configs (global + per region) for admin.
 */
export async function listMarginGuardrailConfigs(): Promise<MarginGuardrailConfigRow[]> {
  const rows = await db.marginGuardrailConfig.findMany({
    orderBy: [{ regionCode: 'asc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    regionCode: r.regionCode,
    minGrossMarginPct: r.minGrossMarginPct,
    maxBonusPlusTierPct: r.maxBonusPlusTierPct,
    maxSurgeMultiplier: r.maxSurgeMultiplier,
    minJobValueCents: r.minJobValueCents,
    blockOrWarn: r.blockOrWarn,
  }))
}

/**
 * Create or update a guardrail config. Use regionCode null for global.
 */
export async function upsertMarginGuardrailConfig(data: {
  id?: string
  regionCode: string | null
  minGrossMarginPct: number
  maxBonusPlusTierPct: number
  maxSurgeMultiplier?: number | null
  minJobValueCents?: number | null
  blockOrWarn: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      regionCode: data.regionCode?.trim()?.toUpperCase() ?? null,
      minGrossMarginPct: data.minGrossMarginPct,
      maxBonusPlusTierPct: data.maxBonusPlusTierPct,
      maxSurgeMultiplier: data.maxSurgeMultiplier ?? null,
      minJobValueCents: data.minJobValueCents ?? null,
      blockOrWarn: data.blockOrWarn,
    }
    if (data.id) {
      await db.marginGuardrailConfig.update({
        where: { id: data.id },
        data: payload,
      })
    } else {
      await db.marginGuardrailConfig.create({ data: payload })
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to save' }
  }
}

export type MarginOverrideLogRow = {
  id: string
  bookingId: string
  userId: string
  userName: string | null
  action: string
  reason: string | null
  createdAt: Date
}

/**
 * List recent margin overrides for audit (admin).
 */
export async function listMarginOverrideLogs(limit = 50): Promise<MarginOverrideLogRow[]> {
  const rows = await db.marginOverrideLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })
  return rows.map((r) => ({
    id: r.id,
    bookingId: r.bookingId,
    userId: r.userId,
    userName: r.user.name ?? null,
    action: r.action,
    reason: r.reason,
    createdAt: r.createdAt,
  }))
}
