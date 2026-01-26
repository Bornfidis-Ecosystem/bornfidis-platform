'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { canAssignRoles } from '@/lib/authz'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { UserRole } from '@prisma/client'

/**
 * Phase 4: Get all users (admin only)
 */
export async function getAllUsers(): Promise<{
  success: boolean
  users?: Array<{
    id: string
    name: string | null
    email: string | null
    role: UserRole | null
    createdAt: string
  }>
  error?: string
}> {
  await requireAuth()

  // Only ADMIN can view all users
  const userRole = await getCurrentUserRole()
  if (!canAssignRoles(userRole)) {
    return { success: false, error: 'Access denied: Only ADMIN can view users' }
  }

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      })),
    }
  } catch (error: any) {
    console.error('Error in getAllUsers:', error)
    return { success: false, error: error.message || 'Failed to fetch users' }
  }
}

/**
 * Phase 4: Update user role (admin only)
 * Prevents self-role changes
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  // Only ADMIN can assign roles
  const currentUserRole = await getCurrentUserRole()
  if (!canAssignRoles(currentUserRole)) {
    return { success: false, error: 'Access denied: Only ADMIN can assign roles' }
  }

  try {
    // Get current user ID to prevent self-role changes
    const { getCurrentUser } = await import('@/lib/get-user-role')
    const currentUser = await getCurrentUser()

    if (currentUser) {
      // Find user by email or openId to check if it's the current user
      const userToUpdate = await db.user.findUnique({
        where: { id: userId },
      })

      if (userToUpdate && currentUser.email && userToUpdate.email === currentUser.email) {
        return { success: false, error: 'Cannot change your own role' }
      }
    }

    // Update role
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    // TODO: Phase 4B - Sync role to Supabase Auth metadata
    // This ensures Supabase Auth and Prisma stay in sync

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateUserRole:', error)
    return { success: false, error: error.message || 'Failed to update role' }
  }
}
