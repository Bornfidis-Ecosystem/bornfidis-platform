import { db } from '@/lib/db'
import { logWorkflowTransition } from '@/lib/activity-log'

/**
 * Phase 8 — BookingPrepItem is the source of truth for prep completion.
 * Dashboard queries derive state from these rows, not inline booleans.
 */

export const PREP_TASK_STATUSES = [
  'pending',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
] as const

export type PrepTaskStatus = (typeof PREP_TASK_STATUSES)[number]

export const PREP_TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const

const DEFAULT_PREP_ITEMS = [
  { title: 'Menu approved', taskType: 'menu_approval', order: 1, priority: 'high' },
  { title: 'Guest count confirmed', taskType: 'guest_count', order: 2, priority: 'high' },
  { title: 'Location confirmed', taskType: 'location', order: 3, priority: 'high' },
  { title: 'Dietary and allergies confirmed', taskType: 'dietary', order: 4, priority: 'high' },
  { title: 'Arrival time confirmed', taskType: 'arrival_time', order: 5, priority: 'normal' },
  { title: 'Service time confirmed', taskType: 'service_time', order: 6, priority: 'normal' },
  { title: 'Equipment and rentals', taskType: 'equipment', order: 7, priority: 'normal' },
  { title: 'Ingredient sourcing and purchasing', taskType: 'ingredients', order: 8, priority: 'high' },
  { title: 'Prep schedule', taskType: 'prep_schedule', order: 9, priority: 'normal' },
  { title: 'Staffing confirmed', taskType: 'staffing', order: 10, priority: 'normal' },
  { title: 'Balance payment reminder', taskType: 'balance_reminder', order: 11, priority: 'normal' },
  { title: 'Final client confirmation', taskType: 'final_confirmation', order: 12, priority: 'high' },
  { title: 'Post-event follow-up', taskType: 'post_event', order: 13, priority: 'low' },
]

/**
 * Idempotently create default prep tasks for a confirmed booking.
 * Returns the number of tasks created (0 if already existed).
 */
export async function createDefaultPrepTasks(
  bookingId: string,
  options: { eventDate?: Date; actorName?: string } = {},
): Promise<number> {
  const existing = await db.bookingPrepItem.count({ where: { bookingId } })
  if (existing > 0) return 0

  const dueAt = options.eventDate
    ? new Date(options.eventDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    : undefined

  await db.bookingPrepItem.createMany({
    data: DEFAULT_PREP_ITEMS.map((item) => ({
      bookingId,
      title: item.title,
      taskType: item.taskType,
      order: item.order,
      priority: item.priority,
      status: 'pending',
      source: 'system',
      dueAt: item.priority === 'high' ? dueAt : undefined,
    })),
  })

  await logWorkflowTransition({
    division: 'PROVISIONS',
    entityType: 'booking',
    entityId: bookingId,
    action: 'prep_tasks_created',
    title: `${DEFAULT_PREP_ITEMS.length} prep tasks created`,
    actorName: options.actorName || 'System',
    newValue: `${DEFAULT_PREP_ITEMS.length} tasks`,
  })

  return DEFAULT_PREP_ITEMS.length
}

/**
 * Update a prep task status with audit logging.
 */
export async function updatePrepTaskStatus(
  taskId: string,
  newStatus: PrepTaskStatus,
  actorName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const task = await db.bookingPrepItem.findUnique({
      where: { id: taskId },
      select: { title: true, status: true, bookingId: true },
    })
    if (!task) return { success: false, error: 'Task not found' }
    if (task.status === newStatus) return { success: true }

    const isCompleting = newStatus === 'completed'

    await db.bookingPrepItem.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completed: isCompleting,
        completedAt: isCompleting ? new Date() : null,
      },
    })

    await logWorkflowTransition({
      division: 'PROVISIONS',
      entityType: 'booking_prep_item',
      entityId: taskId,
      action: 'prep_task_status_changed',
      title: `Prep task: ${task.title} → ${newStatus}`,
      previousValue: task.status,
      newValue: newStatus,
      actorName,
      metadata: { bookingId: task.bookingId },
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Get prep completion stats for a booking (source of truth).
 */
export async function getBookingPrepStats(bookingId: string): Promise<{
  total: number
  completed: number
  pending: number
  inProgress: number
  blocked: number
  overdue: number
  percentComplete: number
}> {
  const now = new Date()
  const tasks = await db.bookingPrepItem.findMany({
    where: { bookingId },
    select: { status: true, dueAt: true, completed: true },
  })
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const blocked = tasks.filter((t) => t.status === 'blocked').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const overdue = tasks.filter(
    (t) => t.dueAt && t.dueAt < now && t.status !== 'completed' && t.status !== 'cancelled',
  ).length
  return {
    total,
    completed,
    pending,
    inProgress,
    blocked,
    overdue,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

/**
 * Dashboard query: get bookings with overdue or incomplete prep tasks.
 * Replaces the old boolean-gate query in admin-prep-attention.ts.
 */
export async function getPrepAttentionFromTasks(): Promise<{
  id: string
  name: string
  status: string
  eventDate: Date
  total: number
  completed: number
  overdue: number
  percentComplete: number
}[]> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const windowEnd = new Date(todayStart)
  windowEnd.setDate(windowEnd.getDate() + 7)

  const bookings = await db.bookingInquiry.findMany({
    where: {
      eventDate: { gte: todayStart, lte: windowEnd },
      NOT: {
        OR: [
          { status: { equals: 'cancelled', mode: 'insensitive' } },
          { status: { equals: 'declined', mode: 'insensitive' } },
          { status: { equals: 'closed', mode: 'insensitive' } },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      eventDate: true,
      prepItems: {
        select: { status: true, dueAt: true, completed: true },
      },
    },
    orderBy: [{ eventDate: 'asc' }],
  })

  return bookings
    .filter((b) => b.prepItems.length > 0)
    .map((b) => {
      const total = b.prepItems.length
      const completed = b.prepItems.filter((t) => t.status === 'completed').length
      const overdue = b.prepItems.filter(
        (t) => t.dueAt && t.dueAt < now && t.status !== 'completed' && t.status !== 'cancelled',
      ).length
      return {
        id: b.id,
        name: b.name,
        status: b.status,
        eventDate: b.eventDate,
        total,
        completed,
        overdue,
        percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    })
    .filter((b) => b.completed < b.total)
}
