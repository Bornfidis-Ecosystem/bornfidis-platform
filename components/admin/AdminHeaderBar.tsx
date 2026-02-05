import SignOutButton from './SignOutButton'

/**
 * Bornfidis Auth + Roles (Phase 1) — Visual role cue
 * Shows role badge and email in a thin bar above all admin pages
 */
export default function AdminHeaderBar({
  user,
  role,
}: {
  user: { email?: string | null }
  role: string | null
}) {
  const displayRole = role ?? 'USER'
  const roleBadgeClass =
    displayRole === 'ADMIN'
      ? 'bg-purple-600 text-white'
      : displayRole === 'STAFF' || displayRole === 'COORDINATOR'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-600 text-white'

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 rounded font-semibold ${roleBadgeClass}`}
          title="Your role"
        >
          {displayRole}
        </span>
        {user?.email && (
          <span className="text-gray-600 truncate max-w-[200px]" title={user.email}>
            {user.email}
          </span>
        )}
      </div>
      <SignOutButton />
    </div>
  )
}
