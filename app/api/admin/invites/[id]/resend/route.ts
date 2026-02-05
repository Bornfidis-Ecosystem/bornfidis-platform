export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { sendInviteEmail } from '@/lib/email'

const EXPIRY_DAYS = 7

function inviteUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://platform.bornfidis.com'
  return `${base.replace(/\/$/, '')}/invite?token=${encodeURIComponent(token)}`
}

/**
 * POST — Resend invite email (new token, 7-day expiry). Admin only.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  const { id } = await params
  try {
    const invite = await db.invite.findUnique({ where: { id } })
    if (!invite) {
      return Response.json({ success: false, error: 'Invite not found' }, { status: 404 })
    }
    if (invite.accepted) {
      return Response.json(
        { success: false, error: 'Invite already accepted' },
        { status: 400 }
      )
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    await db.invite.update({
      where: { id },
      data: { token, expiresAt },
    })

    const link = inviteUrl(token)
    const sendResult = await sendInviteEmail({ email: invite.email, inviteUrl: link })
    if (!sendResult.success) {
      return Response.json(
        { success: false, error: sendResult.error ?? 'Email failed to send' },
        { status: 500 }
      )
    }
    return Response.json({ success: true })
  } catch (e: any) {
    console.error('POST /api/admin/invites/[id]/resend:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to resend invite' },
      { status: 500 }
    )
  }
}
