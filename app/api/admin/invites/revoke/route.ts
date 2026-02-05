export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'

/**
 * DELETE — Revoke invite (delete). Admin only. Token invalid immediately.
 * Body: { inviteId: string }
 */
export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const inviteId = typeof body.inviteId === 'string' ? body.inviteId.trim() : null

    if (!inviteId) {
      return Response.json({ error: 'inviteId required' }, { status: 400 })
    }

    await db.invite.delete({ where: { id: inviteId } })
    return Response.json({ success: true })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return Response.json({ error: 'Invite not found' }, { status: 404 })
    }
    console.error('DELETE /api/admin/invites/revoke:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to revoke' },
      { status: 500 }
    )
  }
}
