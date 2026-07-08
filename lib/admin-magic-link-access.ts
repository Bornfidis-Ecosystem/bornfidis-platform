import { isAllowedAdminEmail } from '@/lib/auth'
import { resolveAdminPlatformRoleForEmail } from '@/lib/admin-rbac'

/** Whether this email may receive an admin magic link (env allowlist or active platform role row). */
export async function canReceiveAdminMagicLink(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  if (isAllowedAdminEmail(normalized)) return true
  try {
    const role = await resolveAdminPlatformRoleForEmail(normalized, null)
    return role !== null
  } catch (err) {
    console.error('[auth] canReceiveAdminMagicLink DB check failed:', err)
    return false
  }
}
