import { getInvites } from '@/lib/invites'
import InviteForm from './InviteForm'
import InviteTable from './InviteTable'
import { CulinaryCard } from '@/components/culinary-os'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

/**
 * Phase 2B-UI — Admin Invite Interface
 * ADMIN / STAFF only (protected by /admin/* layout + checkAdminAccess).
 * Invite partners, see Pending / Accepted / Expired, Resend, Revoke.
 */
export default async function AdminInvitesPage() {
  let invites: Awaited<ReturnType<typeof getInvites>> = []
  try {
    invites = await getInvites()
  } catch (e) {
    console.error('AdminInvitesPage getInvites:', e)
    // Still render the page so the route resolves; show error in table area
  }

  return (
    <div className="min-h-screen bg-culinary-bone">
      <header className="bg-forestDark text-white">
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
        <CulinaryCard className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Invite</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter email, choose role, and send. They get a link that explains why they’re invited.
            </p>
            <InviteForm />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invites</h2>
            <InviteTable invites={invites} />
          </div>
        </CulinaryCard>
      </main>
    </div>
  )
}
