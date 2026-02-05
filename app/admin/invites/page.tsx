import { getInvites } from '@/lib/invites'
import InviteForm from './InviteForm'
import InviteTable from './InviteTable'

export const dynamic = 'force-dynamic'

/**
 * Phase 2B-UI — Admin Invite Interface
 * ADMIN / STAFF only (protected by /admin/* layout + checkAdminAccess).
 * Invite partners, see Pending / Accepted / Expired, Resend, Revoke.
 */
export default async function AdminInvitesPage() {
  const invites = await getInvites()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold">Partner Invites</h1>
            <p className="text-green-100 text-sm mt-1">
              Invite partners into the Bornfidis ecosystem. No public access.
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Invite Partner</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter email and send. Role is PARTNER for now.
            </p>
            <InviteForm />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invites</h2>
            <InviteTable invites={invites} />
          </div>
        </div>
      </main>
    </div>
  )
}
