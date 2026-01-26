'use server'

/**
 * Phase 4: Get User Role Helper
 * Syncs Supabase Auth roles with Prisma User table
 * Provides unified role access across the platform
 */

import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { getUserRole as getUserRoleFromAuthz } from '@/lib/authz'

interface UserWithRole {
  id: string
  email: string | null
  role: UserRole | null
}

/**
 * Get current user's role from Supabase Auth and sync with Prisma User
 * Returns role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user || !user.email) {
      return null
    }

    // First, try to get role from Supabase metadata (for backward compatibility)
    const metadataRole = getUserRoleFromAuthz(user)
    if (metadataRole) {
      // Sync to Prisma User table if exists
      await syncUserRoleToPrisma(user.id, user.email, metadataRole)
      return metadataRole
    }

    // If no metadata role, check Prisma User table
    const prismaUser = await db.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { openId: user.id },
        ],
      },
    })

    if (prismaUser?.role) {
      return prismaUser.role
    }

    // If user exists in Prisma but no role, default to FARMER
    if (prismaUser) {
      const defaultRole = UserRole.FARMER
      await db.user.update({
        where: { id: prismaUser.id },
        data: { role: defaultRole },
      })
      return defaultRole
    }

    // User not in Prisma yet - create with default role
    const defaultRole = UserRole.FARMER
    await db.user.create({
      data: {
        openId: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || null,
        role: defaultRole,
      },
    })

    return defaultRole
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Sync Supabase Auth role to Prisma User table
 */
async function syncUserRoleToPrisma(
  supabaseUserId: string,
  email: string | null,
  role: UserRole
): Promise<void> {
  try {
    // Find or create user in Prisma
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { openId: supabaseUserId },
          ...(email ? [{ email }] : []),
        ],
      },
    })

    if (existingUser) {
      // Update role if different
      if (existingUser.role !== role) {
        await db.user.update({
          where: { id: existingUser.id },
          data: { role },
        })
      }
    } else {
      // Create new user
      await db.user.create({
        data: {
          openId: supabaseUserId,
          email,
          role,
        },
      })
    }
  } catch (error) {
    console.error('Error syncing user role to Prisma:', error)
    // Don't throw - this is a sync operation, shouldn't break auth
  }
}

/**
 * Get current user with role
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const role = await getCurrentUserRole()

    return {
      id: user.id,
      email: user.email || null,
      role,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
