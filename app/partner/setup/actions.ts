'use server'

import { db } from '@/lib/db'
import { getCurrentPrismaUser } from '@/lib/partner'
import { PartnerType, UserRole } from '@prisma/client'

export type PartnerProfileInput = {
  displayName: string
  partnerType: 'FARMER' | 'CHEF' | 'COOPERATIVE' | 'OTHER'
  phone?: string
  parish?: string
  bio?: string
}

/**
 * Phase 2C — Save partner profile (PARTNER only). Sets completed = true.
 */
export async function savePartnerProfile(data: PartnerProfileInput) {
  const user = await getCurrentPrismaUser()
  if (!user) throw new Error('Unauthorized')

  const role = user.role?.toUpperCase?.()
  if (role !== 'PARTNER') throw new Error('Unauthorized')

  const payload = {
    displayName: data.displayName.trim(),
    partnerType: data.partnerType as PartnerType,
    phone: data.phone?.trim() || null,
    parish: data.parish?.trim() || null,
    bio: data.bio?.trim() || null,
    completed: true,
  }

  await db.partnerProfile.upsert({
    where: { userId: user.id },
    update: payload,
    create: {
      userId: user.id,
      ...payload,
    },
  })

  // Phase 2F: Set user role from partner type (FARMER / CHEF / PARTNER)
  const newRole =
    data.partnerType === 'FARMER' ? UserRole.FARMER : data.partnerType === 'CHEF' ? UserRole.CHEF : UserRole.PARTNER
  await db.user.update({
    where: { id: user.id },
    data: { role: newRole },
  })
}
