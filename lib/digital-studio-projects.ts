'use server'

import { db } from '@/lib/db'
import { logWorkflowTransition } from '@/lib/activity-log'

export const DS_PROJECT_STATUSES = [
  'lead',
  'consultation',
  'proposal_sent',
  'awaiting_acceptance',
  'awaiting_deposit',
  'active',
  'client_review',
  'launch_ready',
  'launched',
  'support',
  'completed',
  'paused',
  'cancelled',
] as const

export type DsProjectStatus = (typeof DS_PROJECT_STATUSES)[number]

export const DS_PROJECT_PHASES = [
  'discovery',
  'proposal',
  'design',
  'build',
  'review',
  'launch',
  'support',
] as const

export type DsProjectPhase = (typeof DS_PROJECT_PHASES)[number]

const DEFAULT_MILESTONES = [
  { title: 'Consultation completed', taskType: 'consultation', order: 1 },
  { title: 'Scope approved', taskType: 'scope', order: 2 },
  { title: 'Proposal accepted', taskType: 'proposal', order: 3 },
  { title: 'Deposit received', taskType: 'deposit', order: 4 },
  { title: 'Content requested', taskType: 'content_request', order: 5 },
  { title: 'Content received', taskType: 'content_received', order: 6 },
  { title: 'Brand assets received', taskType: 'brand_assets', order: 7 },
  { title: 'Sitemap approved', taskType: 'sitemap', order: 8 },
  { title: 'Design/build started', taskType: 'build_start', order: 9 },
  { title: 'Review link sent', taskType: 'review_link', order: 10 },
  { title: 'Revision round 1', taskType: 'revision_1', order: 11 },
  { title: 'Revision round 2', taskType: 'revision_2', order: 12 },
  { title: 'Launch approved', taskType: 'launch_approved', order: 13 },
  { title: 'Domain connected', taskType: 'domain', order: 14 },
  { title: 'Analytics connected', taskType: 'analytics', order: 15 },
  { title: 'Handover completed', taskType: 'handover', order: 16 },
  { title: 'Support period started', taskType: 'support_start', order: 17 },
  { title: 'Support period completed', taskType: 'support_end', order: 18 },
]

async function generateProjectNumber(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)
  const count = await db.digitalStudioProject.count()
  const seq = String(count + 1).padStart(3, '0')
  return `DS-${year}-${seq}`
}

/**
 * Create a Digital Studio project from an accepted application.
 * Idempotent: won't create if a project already exists for this application.
 */
export async function createProjectFromApplication(
  applicationId: string,
  options: {
    totalAmountCents?: number
    depositAmountCents?: number
    ownerId?: string
    targetLaunchDate?: Date
    actorName?: string
  } = {},
): Promise<{ success: boolean; project?: { id: string; projectNumber: string }; error?: string }> {
  try {
    const existing = await db.digitalStudioProject.findFirst({
      where: { applicationId },
      select: { id: true, projectNumber: true },
    })
    if (existing) {
      return { success: true, project: existing }
    }

    const application = await db.digitalStudioApplication.findUnique({
      where: { id: applicationId },
    })
    if (!application) {
      return { success: false, error: 'Application not found' }
    }

    const projectNumber = await generateProjectNumber()
    const balanceCents =
      options.totalAmountCents && options.depositAmountCents
        ? options.totalAmountCents - options.depositAmountCents
        : null

    const project = await db.digitalStudioProject.create({
      data: {
        applicationId,
        projectNumber,
        name: `${application.businessName} — Website`,
        clientName: application.contactName,
        clientEmail: application.contactEmail,
        status: 'active',
        phase: 'discovery',
        ownerId: options.ownerId,
        targetLaunchDate: options.targetLaunchDate,
        totalAmountCents: options.totalAmountCents,
        depositAmountCents: options.depositAmountCents,
        balanceAmountCents: balanceCents,
        portalToken: crypto.randomUUID(),
      },
    })

    await createDefaultProjectTasks(project.id)

    await db.digitalStudioApplication.update({
      where: { id: applicationId },
      data: { status: 'in_progress' },
    })

    await logWorkflowTransition({
      division: 'DIGITAL_STUDIO',
      entityType: 'digital_studio_project',
      entityId: project.id,
      action: 'project_created',
      title: `Project created: ${projectNumber}`,
      description: `From application ${applicationId} — ${application.businessName}`,
      actorName: options.actorName || 'System',
      newValue: 'active',
    })

    return { success: true, project: { id: project.id, projectNumber } }
  } catch (err) {
    console.error('[ds-projects] createProjectFromApplication error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Idempotently create default milestone tasks for a project.
 */
export async function createDefaultProjectTasks(projectId: string): Promise<void> {
  const existing = await db.digitalStudioProjectTask.count({ where: { projectId } })
  if (existing > 0) return

  await db.digitalStudioProjectTask.createMany({
    data: DEFAULT_MILESTONES.map((m) => ({
      projectId,
      title: m.title,
      taskType: m.taskType,
      order: m.order,
      status: 'pending',
      priority: 'normal',
      source: 'system',
    })),
  })
}

/**
 * Update project status with audit logging.
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: DsProjectStatus,
  actorName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const project = await db.digitalStudioProject.findUnique({
      where: { id: projectId },
      select: { status: true, projectNumber: true },
    })
    if (!project) return { success: false, error: 'Project not found' }

    await db.digitalStudioProject.update({
      where: { id: projectId },
      data: { status: newStatus },
    })

    await logWorkflowTransition({
      division: 'DIGITAL_STUDIO',
      entityType: 'digital_studio_project',
      entityId: projectId,
      action: 'status_changed',
      title: `Project ${project.projectNumber} status → ${newStatus}`,
      previousValue: project.status,
      newValue: newStatus,
      actorName,
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Update project phase with audit logging.
 */
export async function updateProjectPhase(
  projectId: string,
  newPhase: DsProjectPhase,
  actorName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const project = await db.digitalStudioProject.findUnique({
      where: { id: projectId },
      select: { phase: true, projectNumber: true },
    })
    if (!project) return { success: false, error: 'Project not found' }

    await db.digitalStudioProject.update({
      where: { id: projectId },
      data: { phase: newPhase },
    })

    await logWorkflowTransition({
      division: 'DIGITAL_STUDIO',
      entityType: 'digital_studio_project',
      entityId: projectId,
      action: 'phase_changed',
      title: `Project ${project.projectNumber} phase → ${newPhase}`,
      previousValue: project.phase,
      newValue: newPhase,
      actorName,
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Complete a project task with audit logging.
 */
export async function completeProjectTask(
  taskId: string,
  actorName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const task = await db.digitalStudioProjectTask.findUnique({
      where: { id: taskId },
      select: { title: true, status: true, projectId: true },
    })
    if (!task) return { success: false, error: 'Task not found' }
    if (task.status === 'completed') return { success: true }

    await db.digitalStudioProjectTask.update({
      where: { id: taskId },
      data: { status: 'completed', completed: true, completedAt: new Date() },
    })

    await logWorkflowTransition({
      division: 'DIGITAL_STUDIO',
      entityType: 'digital_studio_project_task',
      entityId: taskId,
      action: 'task_completed',
      title: `Task completed: ${task.title}`,
      previousValue: task.status,
      newValue: 'completed',
      actorName,
      metadata: { projectId: task.projectId },
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Get project task completion stats.
 */
export async function getProjectTaskStats(projectId: string): Promise<{
  total: number
  completed: number
  pending: number
  blocked: number
  percentComplete: number
}> {
  const tasks = await db.digitalStudioProjectTask.findMany({
    where: { projectId },
    select: { status: true },
  })
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const blocked = tasks.filter((t) => t.status === 'blocked').length
  const pending = total - completed - blocked
  return {
    total,
    completed,
    pending,
    blocked,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
