'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import {
  createProjectFromApplication,
  updateProjectStatus,
  updateProjectPhase,
  completeProjectTask,
  type DsProjectStatus,
  type DsProjectPhase,
} from '@/lib/digital-studio-projects'
import { logWorkflowTransition } from '@/lib/activity-log'

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  try {
    const app = await db.digitalStudioApplication.findUnique({
      where: { id: applicationId },
      select: { status: true, businessName: true },
    })
    if (!app) return { success: false, error: 'Application not found' }

    await db.digitalStudioApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        lastContactedAt: new Date(),
      },
    })

    await logWorkflowTransition({
      division: 'DIGITAL_STUDIO',
      entityType: 'digital_studio_application',
      entityId: applicationId,
      action: 'status_changed',
      title: `Application ${app.businessName} → ${newStatus}`,
      previousValue: app.status,
      newValue: newStatus,
      actorName: 'Admin',
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function convertToProject(
  applicationId: string,
  data: {
    totalAmountCents?: number
    depositAmountCents?: number
    targetLaunchDate?: string
  },
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  await requireAuth()
  const result = await createProjectFromApplication(applicationId, {
    totalAmountCents: data.totalAmountCents,
    depositAmountCents: data.depositAmountCents,
    targetLaunchDate: data.targetLaunchDate ? new Date(data.targetLaunchDate) : undefined,
    actorName: 'Admin',
  })
  if (!result.success) return { success: false, error: result.error }
  return { success: true, projectId: result.project?.id }
}

export async function changeProjectStatus(
  projectId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  return updateProjectStatus(projectId, status as DsProjectStatus, 'Admin')
}

export async function changeProjectPhase(
  projectId: string,
  phase: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  return updateProjectPhase(projectId, phase as DsProjectPhase, 'Admin')
}

export async function toggleProjectTask(
  taskId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()
  return completeProjectTask(taskId, 'Admin')
}
