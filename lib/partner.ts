'use server'

import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'
import type { PartnerProfile, User } from '@prisma/client'

/**
 * Phase 2C — Partner profile helpers
 * Get current Prisma user (by Supabase auth) and their partner profile.
 */

/** Get Prisma User for the current auth user (by openId or email). */
export async function getCurrentPrismaUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const prismaUser = await db.user.findFirst({
      where: {
        OR: [{ openId: user.id }, ...(user.email ? [{ email: user.email }] : [])],
      },
    })
    return prismaUser
  } catch (e) {
    console.error('getCurrentPrismaUser:', e)
    return null
  }
}

/** Get partner profile for the current user (if any). Returns null on error (e.g. table not yet created). */
export async function getPartnerProfileForCurrentUser(): Promise<PartnerProfile | null> {
  try {
    const prismaUser = await getCurrentPrismaUser()
    if (!prismaUser?.id) return null

    const profile = await db.partnerProfile.findUnique({
      where: { userId: prismaUser.id },
    })
    return profile
  } catch (e) {
    console.error('getPartnerProfileForCurrentUser:', e)
    return null
  }
}
