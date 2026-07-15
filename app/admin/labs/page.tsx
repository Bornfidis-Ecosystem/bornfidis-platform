import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CulinaryCard, CulinaryPageHeader } from '@/components/culinary-os'
import { checkAdminAccess } from '@/lib/requireAdmin'
import { getLabNavForPlatformUser } from '@/lib/filter-nav'
import { isAdminLabsEnabled } from '@/lib/nav-config'
import { ADMIN_AREA_ROLES, hasRole } from '@/lib/require-role'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * Phase 4 — Experimental admin modules hub (gated by ENABLE_ADMIN_LABS).
 */
export default async function AdminLabsPage() {
  if (!isAdminLabsEnabled()) {
    redirect('/admin')
  }

  const result = await checkAdminAccess()
  if (!result.user || !result.isAdmin) {
    redirect('/admin/login')
  }

  const prismaRole =
    result.role && hasRole(result.role, ADMIN_AREA_ROLES)
      ? result.role
      : result.isAdmin
        ? UserRole.ADMIN
        : result.role

  const items = getLabNavForPlatformUser(prismaRole, result.platformRole)

  return (
    <div className="space-y-8">
      <CulinaryPageHeader
        title="Labs"
        description="Experimental and unfinished modules. Not part of daily Culinary OS operations. Enable with ENABLE_ADMIN_LABS=true."
      />

      {items.length === 0 ? (
        <CulinaryCard>
          <p className="font-culinary-sans text-sm text-culinary-text-muted">
            No lab modules available for your role.
          </p>
        </CulinaryCard>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <CulinaryCard
                as={Link}
                href={item.href}
                className="block transition hover:border-culinary-gold-line hover:bg-culinary-surface-low"
              >
                <span className="font-culinary-sans text-label-caps uppercase tracking-[0.1em] text-culinary-navy">
                  {item.label}
                </span>
                <p className="mt-2 font-culinary-sans text-xs text-culinary-text-muted">{item.href}</p>
              </CulinaryCard>
            </li>
          ))}
        </ul>
      )}

      <p className="font-culinary-sans text-xs text-culinary-text-muted">
        <Link href="/admin" className="underline hover:text-culinary-ink">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  )
}
