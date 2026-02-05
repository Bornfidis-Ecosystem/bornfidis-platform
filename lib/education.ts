import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

/**
 * Phase 2M — Check if user has completed all required education modules for a role.
 * Used for optional payout gate: required CHEF modules must be complete before payouts.
 */
export async function hasRequiredModulesComplete(
  userId: string,
  role: UserRole
): Promise<boolean> {
  const required = await db.educationModule.findMany({
    where: { role, required: true },
    select: { id: true },
  })
  if (required.length === 0) return true

  const completed = await db.educationProgress.findMany({
    where: {
      userId,
      moduleId: { in: required.map((r) => r.id) },
      completed: true,
    },
    select: { moduleId: true },
  })
  const completedSet = new Set(completed.map((c) => c.moduleId))
  return required.every((r) => completedSet.has(r.id))
}
