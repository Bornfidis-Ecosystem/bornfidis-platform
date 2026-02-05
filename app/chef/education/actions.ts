'use server'

import { db } from '@/lib/db'
import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { checkAndAwardBadges } from '@/lib/badges'

/**
 * Phase 2M — Mark education module complete for current user.
 * Access: CHEF, ADMIN, STAFF. Creates or updates EducationProgress.
 */
export async function markModuleComplete(
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  const role = await getCurrentUserRole()
  if (!role) return { success: false, error: 'Unauthorized' }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) return { success: false, error: 'Unauthorized' }

  const module = await db.educationModule.findUnique({
    where: { id: moduleId },
  })
  if (!module) return { success: false, error: 'Module not found' }

  await db.educationProgress.upsert({
    where: {
      userId_moduleId: { userId: user.id, moduleId },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: user.id,
      moduleId,
      completed: true,
      completedAt: new Date(),
    },
  })

  // Phase 2P: Check badge criteria (e.g. Certified Chef, Food Safety Ready)
  await checkAndAwardBadges(user.id).catch(() => {})

  return { success: true }
}
