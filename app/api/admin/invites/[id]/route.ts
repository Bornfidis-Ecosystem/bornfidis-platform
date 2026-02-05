export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { sendInviteEmail } from '@/lib/email'

function inviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.bornfidis.com'
  return `${base.replace(/\/$/, '')}/invite?token=${encodeURIComponent(token)}`
}

/**
 * DELETE — Revoke invite (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  try {
    await db.invite.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return Response.json({ success: false, error: 'Invite not found' }, { status: 404 })
    }
    console.error('DELETE /api/admin/invites/[id]:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to revoke invite' },
      { status: 500 }
    )
  }
}
