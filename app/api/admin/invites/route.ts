export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { requireAdmin, getAdminUser } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { sendInviteEmail } from '@/lib/email'
import { UserRole } from '@prisma/client'

const INVITE_ROLES: UserRole[] = [
  UserRole.FARMER,
  UserRole.CHEF,
  UserRole.EDUCATOR,
  UserRole.PARTNER,
]
const EXPIRY_DAYS = 7

function inviteUrl(role: UserRole, token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://platform.bornfidis.com'
  return `${base.replace(/\/$/, '')}/invite?role=${encodeURIComponent(role)}&token=${encodeURIComponent(token)}`
}

/**
 * POST — Create invite (admin only). Sends email with link.
 * Body: { email: string, role: UserRole } — role must be PARTNER for now.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null
    const role = body.role as UserRole

    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      )
    }
    if (!role || !INVITE_ROLES.includes(role)) {
      return Response.json(
        { success: false, error: `Role must be one of: ${INVITE_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    const token = randomUUID()

    const existing = await db.invite.findUnique({ where: { email } })
    const adminUser = await getAdminUser()
    const invitedBy = adminUser?.email ?? 'admin'

    if (existing) {
      if (existing.accepted) {
        return Response.json(
          { success: false, error: 'An invite for this email was already accepted' },
          { status: 400 }
        )
      }
      await db.invite.update({
        where: { id: existing.id },
        data: { token, expiresAt, role, invitedBy },
      })
    } else {
      await db.invite.create({
        data: {
          email,
          role,
          token,
          invitedBy,
          expiresAt,
        },
      })
    }

    const link = inviteUrl(role, token)
    let emailSent = true
    try {
      const sendResult = await sendInviteEmail({ email, role, inviteUrl: link })
      if (!sendResult.success) {
        console.error('Invite email failed:', sendResult.error)
        emailSent = false
      }
    } catch (e) {
      console.error('Invite email failed', e)
      emailSent = false
    }
    // Invite is always saved; admin can resend later if email failed
    return Response.json({ success: true, emailSent })
  } catch (e: any) {
    console.error('POST /api/admin/invites:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to create invite' },
      { status: 500 }
    )
  }
}

/**
 * GET — List invites (admin only). Query: ?status=pending|accepted|expired
 */
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'all'
    const now = new Date()

    const invites = await db.invite.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const filtered =
      status === 'pending'
        ? invites.filter((i) => !i.accepted && i.expiresAt > now)
        : status === 'accepted'
          ? invites.filter((i) => i.accepted)
          : status === 'expired'
            ? invites.filter((i) => !i.accepted && i.expiresAt <= now)
            : invites

    return Response.json({ success: true, invites: filtered })
  } catch (e: any) {
    console.error('GET /api/admin/invites:', e)
    return Response.json(
      { success: false, error: e.message ?? 'Failed to list invites' },
      { status: 500 }
    )
  }
}
