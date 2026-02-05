'use server'

import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { requireRole } from '@/lib/require-role'
import { db } from '@/lib/db'
import { isSupportedCurrency } from '@/lib/currency'

/**
 * Phase 2AI: Chef sets preferred payout currency (USD, JMD, EUR, GBP).
 * Admin can override per chef; non-USD can be disabled by env.
 */
export async function setPreferredPayoutCurrency(
  currency: string
): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const code = currency.toUpperCase()
  if (!isSupportedCurrency(code)) return { success: false, error: 'Unsupported currency' }

  const allowNonUsd = process.env.NON_USD_PAYOUTS_ENABLED === 'true'
  if (code !== 'USD' && !allowNonUsd) {
    return { success: false, error: 'Non-USD payouts are not enabled. Contact admin.' }
  }

  await db.chefProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, preferredPayoutCurrency: code },
    update: { preferredPayoutCurrency: code },
  })
  return { success: true }
}

/**
 * Phase 2AM: Chef opt-out of SMS fallback for critical alerts. Honored instantly.
 */
export async function setSmsFallbackEnabled(enabled: boolean): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  await db.user.update({
    where: { id: user.id },
    data: { smsEnabled: enabled },
  })
  return { success: true }
}
