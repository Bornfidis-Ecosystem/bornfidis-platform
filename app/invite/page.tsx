import Link from 'next/link'
import { db } from '@/lib/db'
import {
  isValidInviteRole,
  ROLE_LABELS,
  WHY_INVITED,
  type InviteRole,
} from '@/lib/invite-copy'

export const dynamic = 'force-dynamic'

const SUBHEADING =
  'Building fair, local food systems through trust, quality, and community.'
const WHAT_HAPPENS_NEXT =
  "This is an early-stage platform. We're starting small and growing carefully. You'll be guided step by step."
const SECONDARY_LINE =
  'No paperwork. No obligation. Just explore and decide if this feels right.'
const FOOTER =
  "Questions? You'll be able to reach the Bornfidis team after you continue."

/**
 * Phase 1 — Invite landing page
 * /invite?role=FARMER|CHEF|EDUCATOR|PARTNER (& optional token=)
 * One screen: title, subheading, role line, CTA. No forms, no payments.
 */
export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; token?: string }>
}) {
  const params = await searchParams
  const rawRole = (params.role ?? '').toUpperCase()
  let role: InviteRole = isValidInviteRole(rawRole || null)
    ? (rawRole as InviteRole)
    : 'PARTNER'
  const token = params.token?.trim()

  // Old links: /invite?token=XYZ — resolve role from invite
  if (token && role === 'PARTNER' && !params.role) {
    const invite = await db.invite.findFirst({
      where: { token },
    })
    if (invite && !invite.accepted && invite.expiresAt > new Date()) {
      if (isValidInviteRole(invite.role)) role = invite.role as InviteRole
    }
  }

  const continueUrl = token
    ? `/invite/continue?role=${encodeURIComponent(role)}&token=${encodeURIComponent(token)}`
    : `/invite/continue?role=${encodeURIComponent(role)}`
  const label = ROLE_LABELS[role]
  const whyLine = WHY_INVITED[role]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          You&apos;re Invited to Bornfidis
        </h1>
        <p className="text-gray-600">{SUBHEADING}</p>
        <p className="text-gray-800 font-medium">{whyLine}</p>
        <p className="text-sm text-gray-500">{WHAT_HAPPENS_NEXT}</p>
        <div className="pt-2">
          <Link
            href={continueUrl}
            className="inline-block w-full sm:w-auto rounded-lg bg-[#14532d] px-6 py-3 text-white font-semibold hover:bg-[#0f3d22] transition"
          >
            Continue as a {label}
          </Link>
        </div>
        <p className="text-sm text-gray-500">{SECONDARY_LINE}</p>
        <p className="text-xs text-gray-400 pt-4">{FOOTER}</p>
      </div>
    </div>
  )
}

