/**
 * Phase 1 invite flow — single source for role-specific copy
 * Used on /invite landing and welcome pages
 */

export const INVITE_ROLES = ['FARMER', 'CHEF', 'EDUCATOR', 'PARTNER'] as const
export type InviteRole = (typeof INVITE_ROLES)[number]

export function isValidInviteRole(role: string | null): role is InviteRole {
  return role !== null && INVITE_ROLES.includes(role as InviteRole)
}

export const ROLE_LABELS: Record<InviteRole, string> = {
  FARMER: 'Farmer',
  CHEF: 'Chef',
  EDUCATOR: 'Educator',
  PARTNER: 'Partner',
}

/** One sentence: why they're invited (above the fold on /invite) */
export const WHY_INVITED: Record<InviteRole, string> = {
  FARMER:
    "You're invited because you grow food and care about quality, fairness, and reliability.",
  CHEF:
    "You're invited because you cook professionally and value consistent, locally sourced ingredients.",
  EDUCATOR:
    "You're invited because you teach, mentor, or guide others and care about sustainable food systems.",
  PARTNER:
    "You're invited because you support or collaborate with initiatives that strengthen local food and communities.",
}
