export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { sendInviteEmail } from '@/lib/email'

function inviteUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://platform.bornfidis.com'
  return `${base.replace(/\/$/, '')}/invite?token=${encodeURIComponent(token)}`
}

/**
 * POST — Resend invite email (same token). Admin only. Idempotent.
 * Body: { inviteId: string }
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const inviteId = typeof body.inviteId === 'string' ? body.inviteId.trim() : null

    if (!inviteId) {
      return Response.json({ error: 'inviteId required' }, { status: 400 })
    }

    const invite = await db.invite.findUnique({ where: { id: inviteId } })

    if (!invite || invite.accepted) {
      return Response.json({ error: 'Invalid invite' }, { status: 400 })
    }

    const inviteUrlStr = inviteUrl(invite.token)
    const sendResult = await sendInviteEmail({
      email: invite.email,
      inviteUrl: inviteUrlStr,
    })

    if (!sendResult.success) {
      return Response.json(
        { success: false, error: sendResult.error ?? 'Email failed to send' },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (e: any) {
    console.error('POST /api/admin/invites/resend:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to resend' },
      { status: 500 }
    )
  }
}
