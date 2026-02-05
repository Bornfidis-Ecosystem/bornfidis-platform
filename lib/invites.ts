import { db } from '@/lib/db'

/**
 * Phase 2B-UI — Single source for invite queries
 * Admin/Staff only (enforced by layout + API).
 */
export async function getInvites() {
  return db.invite.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
