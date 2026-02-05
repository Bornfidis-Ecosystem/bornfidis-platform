'use client'

import Link from 'next/link'
import type { Invite } from '@prisma/client'

/** Serialized invite (dates as strings when passed from server to client) */
type InviteRow = Omit<Invite, 'expiresAt' | 'createdAt'> & {
  expiresAt: string | Date
  createdAt: string | Date
}

export default function InviteTable({ invites }: { invites: InviteRow[] }) {
  const onResend = async (inviteId: string) => {
    try {
      const res = await fetch('/api/admin/invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Invite resent')
        window.location.reload()
      } else {
        alert(data.error ?? 'Failed to resend')
      }
    } catch {
      alert('Failed to resend')
    }
  }

  const onRevoke = async (inviteId: string) => {
    if (!confirm('Revoke this invite?')) return
    try {
      const res = await fetch('/api/admin/invites/revoke', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      })
      const data = await res.json()
      if (data.success) window.location.reload()
      else alert(data.error ?? 'Failed to revoke')
    } catch {
      alert('Failed to revoke')
    }
  }

  return (
    <div className="space-y-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 font-semibold text-gray-700">Email</th>
            <th className="text-left py-2 font-semibold text-gray-700">Role</th>
            <th className="text-left py-2 font-semibold text-gray-700">Invited by</th>
            <th className="text-left py-2 font-semibold text-gray-700">Status</th>
            <th className="text-left py-2 font-semibold text-gray-700">Expires</th>
            <th className="text-left py-2 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No invites yet. Use the form above to invite a partner.
              </td>
            </tr>
          ) : (
            invites.map((invite) => {
              const expiresAt = new Date(invite.expiresAt)
              const expired = expiresAt < new Date()
              const status = invite.accepted
                ? 'Accepted'
                : expired
                  ? 'Expired'
                  : 'Pending'

              return (
                <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">{invite.email}</td>
                  <td className="py-3">{invite.role}</td>
                  <td className="py-3 text-gray-600">{invite.invitedBy}</td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        status === 'Accepted'
                          ? 'bg-green-100 text-green-700'
                          : status === 'Expired'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">
                    {expiresAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3">
                    <div className="space-x-2">
                      {!invite.accepted && !expired && (
                        <button
                          type="button"
                          onClick={() => onResend(invite.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Resend
                        </button>
                      )}
                      {!invite.accepted && (
                        <button
                          type="button"
                          onClick={() => onRevoke(invite.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      <p className="text-sm text-gray-500">
        <Link href="/admin" className="text-navy hover:underline">
          ← Back to Admin
        </Link>
      </p>
    </div>
  )
}
