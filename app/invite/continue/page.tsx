import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'
import { isValidInviteRole, type InviteRole } from '@/lib/invite-copy'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ROLE_TO_WELCOME_PATH: Record<InviteRole, string> = {
  FARMER: '/welcome/farmer',
  CHEF: '/welcome/chef',
  EDUCATOR: '/welcome/educator',
  PARTNER: '/welcome/partner',
}

/**
 * Phase 1 — After "Continue as [ROLE]"
 * If not logged in → redirect to login with next= this URL
 * If logged in → apply role, mark invite accepted if token present, redirect to /[role]/welcome
 */
export default async function InviteContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; token?: string }>
}) {
  const params = await searchParams
  const role = isValidInviteRole(params.role ?? null) ? (params.role as InviteRole) : null
  const token = params.token?.trim()

  if (!role) {
    redirect('/invite')
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user?.email) {
    const next = token
      ? `/invite/continue?role=${encodeURIComponent(role)}&token=${encodeURIComponent(token)}`
      : `/invite/continue?role=${encodeURIComponent(role)}`
    redirect(`/admin/login?next=${encodeURIComponent(next)}`)
  }

  const prismaRole = role as UserRole

  if (token) {
    const invite = await db.invite.findFirst({ where: { token } })
    if (invite && invite.email.toLowerCase() === user.email.toLowerCase()) {
      if (!invite.accepted && invite.expiresAt > new Date()) {
        await db.invite.update({
          where: { id: invite.id },
          data: { accepted: true },
        })
      }
    }
  }

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: user.email }, { openId: user.id }],
    },
  })

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { role: prismaRole },
    })
  } else {
    await db.user.create({
      data: {
        email: user.email,
        openId: user.id,
        role: prismaRole,
      },
    })
  }

  redirect(ROLE_TO_WELCOME_PATH[role])
}
