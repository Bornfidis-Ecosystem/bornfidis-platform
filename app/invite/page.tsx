import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

/**
 * Phase 2B — Accept invite (server)
 * GET /invite?token=XYZ
 * Validates token, applies role to User (create or update), marks invite accepted, redirects to login.
 */
export default async function InvitePage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid invite</h1>
          <p className="text-gray-600">No token provided. Use the link from your invite email.</p>
          <a href="/admin/login" className="mt-4 inline-block text-green-700 font-medium hover:underline">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  const invite = await db.invite.findFirst({
    where: { token: token.trim() },
  })

  if (!invite || invite.accepted || invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invite invalid or expired</h1>
          <p className="text-gray-600">
            This link has already been used or has expired. Ask your admin for a new invite.
          </p>
          <a href="/admin/login" className="mt-4 inline-block text-green-700 font-medium hover:underline">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  const existingUser = await db.user.findFirst({
    where: { email: invite.email },
  })

  if (existingUser) {
    await db.user.update({
      where: { id: existingUser.id },
      data: { role: invite.role },
    })
  } else {
    await db.user.create({
      data: {
        email: invite.email,
        role: invite.role,
      },
    })
  }

  await db.invite.update({
    where: { id: invite.id },
    data: { accepted: true },
  })

  redirect('/admin/login')
}
