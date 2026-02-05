/**
 * Phase 2O — Education Analytics (v1)
 * From existing EducationModule + EducationProgress. No new schema.
 * Admin/Staff only.
 */

import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { hasRequiredModulesComplete } from '@/lib/education'

export type ModuleRow = {
  moduleId: string
  title: string
  required: boolean
  completed: number
  outstanding: number
  completionRatePercent: number
  avgDaysToComplete: number | null
}

export type EducationAnalytics = {
  totalChefUsers: number
  overallCompletionPercent: number
  requiredCompletionPercent: number
  moduleRows: ModuleRow[]
  nonCompliantUsers: Array<{ id: string; name: string | null; email: string | null }>
}

/**
 * Phase 2O — Compute education analytics for CHEF role.
 * Denominator for rates = total CHEF users (User.role = CHEF).
 */
export async function getEducationAnalytics(): Promise<EducationAnalytics> {
  const chefUsers = await db.user.findMany({
    where: { role: UserRole.CHEF },
    select: { id: true, name: true, email: true },
  })
  const totalChefUsers = chefUsers.length

  const modules = await db.educationModule.findMany({
    where: { role: UserRole.CHEF },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, required: true, createdAt: true },
  })

  if (modules.length === 0) {
    return {
      totalChefUsers,
      overallCompletionPercent: totalChefUsers === 0 ? 100 : 0,
      requiredCompletionPercent: totalChefUsers === 0 ? 100 : 0,
      moduleRows: [],
      nonCompliantUsers: totalChefUsers > 0 ? chefUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })) : [],
    }
  }

  const totalSlots = modules.length * Math.max(totalChefUsers, 1)
  const requiredModules = modules.filter((m) => m.required)
  const requiredSlots = requiredModules.length * Math.max(totalChefUsers, 1)

  let totalCompleted = 0
  let requiredCompleted = 0
  const moduleRows: ModuleRow[] = []

  for (const mod of modules) {
    const completedProgress = await db.educationProgress.findMany({
      where: { moduleId: mod.id, completed: true },
      select: { completedAt: true },
    })
    const completed = completedProgress.length
    const outstanding = Math.max(0, totalChefUsers - completed)
    const completionRatePercent =
      totalChefUsers === 0 ? 100 : Math.round((completed / totalChefUsers) * 100)

    // Avg days to complete: completedAt - module.createdAt (proxy for "time to finish")
    let avgDaysToComplete: number | null = null
    if (completedProgress.length > 0 && mod.createdAt) {
      const modCreated = new Date(mod.createdAt).getTime()
      const days = completedProgress
        .filter((p) => p.completedAt)
        .map((p) => (new Date(p.completedAt!).getTime() - modCreated) / (1000 * 60 * 60 * 24))
      if (days.length > 0) {
        avgDaysToComplete = Math.round(
          days.reduce((a, b) => a + b, 0) / days.length
        )
      }
    }

    moduleRows.push({
      moduleId: mod.id,
      title: mod.title,
      required: mod.required,
      completed,
      outstanding,
      completionRatePercent,
      avgDaysToComplete,
    })

    totalCompleted += completed
    if (mod.required) requiredCompleted += completed
  }

  const overallCompletionPercent =
    totalSlots === 0 ? 100 : Math.round((totalCompleted / totalSlots) * 100)
  const requiredCompletionPercent =
    requiredSlots === 0 ? 100 : Math.round((requiredCompleted / requiredSlots) * 100)

  // Non-compliant: CHEF users missing any required module
  const nonCompliantUsers: Array<{ id: string; name: string | null; email: string | null }> = []
  for (const u of chefUsers) {
    const ok = await hasRequiredModulesComplete(u.id, UserRole.CHEF)
    if (!ok) nonCompliantUsers.push({ id: u.id, name: u.name, email: u.email })
  }

  return {
    totalChefUsers,
    overallCompletionPercent,
    requiredCompletionPercent,
    moduleRows,
    nonCompliantUsers,
  }
}
