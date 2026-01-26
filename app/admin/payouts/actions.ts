'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { canViewAdmin } from '@/lib/authz'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { PayoutStatus } from '@prisma/client'

/**
 * Phase 4.5: Payout Management Actions
 * Admin-only access for managing farmer payouts
 */

interface PayoutWithRelations {
  id: string
  bookingId: string
  farmerId: string
  description: string
  amount: number
  status: PayoutStatus
  approvedAt: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  booking: {
    id: string
    name: string
    eventDate: string
  }
  farmer: {
    id: string
    name: string
    phone: string
  }
}

/**
 * Get all payouts with filters
 */
export async function getAllPayouts(filters?: {
  farmerId?: string
  status?: PayoutStatus
  bookingId?: string
}): Promise<{
  success: boolean
  payouts?: PayoutWithRelations[]
  error?: string
}> {
  await requireAuth()

  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    return { success: false, error: 'Access denied: Admin only' }
  }

  try {
    const where: any = {}

    if (filters?.farmerId) {
      where.farmerId = filters.farmerId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.bookingId) {
      where.bookingId = filters.bookingId
    }

    const payouts = await db.farmerPayout.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            name: true,
            eventDate: true,
          },
        },
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      payouts: payouts.map((payout) => ({
        id: payout.id,
        bookingId: payout.bookingId,
        farmerId: payout.farmerId,
        description: payout.description,
        amount: payout.amount,
        status: payout.status,
        approvedAt: payout.approvedAt?.toISOString() || null,
        paidAt: payout.paidAt?.toISOString() || null,
        notes: payout.notes || null,
        createdAt: payout.createdAt.toISOString(),
        booking: {
          id: payout.booking.id,
          name: payout.booking.name,
          eventDate: payout.booking.eventDate.toISOString().split('T')[0],
        },
        farmer: {
          id: payout.farmer.id,
          name: payout.farmer.name,
          phone: payout.farmer.phone,
        },
      })),
    }
  } catch (error: any) {
    console.error('Error in getAllPayouts:', error)
    return { success: false, error: error.message || 'Failed to fetch payouts' }
  }
}

/**
 * Create a new payout
 */
export async function createPayout(data: {
  bookingId: string
  farmerId: string
  description: string
  amount: number // in cents
  notes?: string
}): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  await requireAuth()

  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    return { success: false, error: 'Access denied: Admin only' }
  }

  try {
    // Verify booking exists and is BOOKED
    const booking = await db.bookingInquiry.findUnique({
      where: { id: data.bookingId },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    if (booking.status !== 'BOOKED' && booking.status !== 'booked' && booking.status !== 'Confirmed') {
      return { success: false, error: 'Payouts can only be created for BOOKED events' }
    }

    // Verify farmer exists
    const farmer = await db.farmer.findUnique({
      where: { id: data.farmerId },
    })

    if (!farmer) {
      return { success: false, error: 'Farmer not found' }
    }

    // Verify farmer is assigned to this booking
    const assignment = await db.bookingFarmer.findUnique({
      where: {
        bookingId_farmerId: {
          bookingId: data.bookingId,
          farmerId: data.farmerId,
        },
      },
    })

    if (!assignment) {
      return { success: false, error: 'Farmer must be assigned to this booking first' }
    }

    // Create payout
    const payout = await db.farmerPayout.create({
      data: {
        bookingId: data.bookingId,
        farmerId: data.farmerId,
        description: data.description,
        amount: data.amount,
        notes: data.notes || null,
        status: PayoutStatus.PENDING,
      },
    })

    return { success: true, payoutId: payout.id }
  } catch (error: any) {
    console.error('Error in createPayout:', error)
    return { success: false, error: error.message || 'Failed to create payout' }
  }
}

/**
 * Approve a payout (PENDING → APPROVED)
 */
export async function approvePayout(
  payoutId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    return { success: false, error: 'Access denied: Admin only' }
  }

  try {
    const payout = await db.farmerPayout.findUnique({
      where: { id: payoutId },
    })

    if (!payout) {
      return { success: false, error: 'Payout not found' }
    }

    if (payout.status !== PayoutStatus.PENDING) {
      return { success: false, error: 'Only PENDING payouts can be approved' }
    }

    await db.farmerPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.APPROVED,
        approvedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error in approvePayout:', error)
    return { success: false, error: error.message || 'Failed to approve payout' }
  }
}

/**
 * Mark payout as paid (APPROVED → PAID)
 */
export async function markPayoutPaid(
  payoutId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    return { success: false, error: 'Access denied: Admin only' }
  }

  try {
    const payout = await db.farmerPayout.findUnique({
      where: { id: payoutId },
    })

    if (!payout) {
      return { success: false, error: 'Payout not found' }
    }

    if (payout.status !== PayoutStatus.APPROVED) {
      return { success: false, error: 'Only APPROVED payouts can be marked as paid' }
    }

    await db.farmerPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        paidAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error in markPayoutPaid:', error)
    return { success: false, error: error.message || 'Failed to mark payout as paid' }
  }
}

/**
 * Get payouts for a specific booking
 */
export async function getBookingPayouts(
  bookingId: string
): Promise<{
  success: boolean
  payouts?: PayoutWithRelations[]
  error?: string
}> {
  await requireAuth()

  const userRole = await getCurrentUserRole()
  if (!canViewAdmin(userRole)) {
    return { success: false, error: 'Access denied: Admin only' }
  }

  try {
    const payouts = await db.farmerPayout.findMany({
      where: { bookingId },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        booking: {
          select: {
            id: true,
            name: true,
            eventDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      payouts: payouts.map((payout) => ({
        id: payout.id,
        bookingId: payout.bookingId,
        farmerId: payout.farmerId,
        description: payout.description,
        amount: payout.amount,
        status: payout.status,
        approvedAt: payout.approvedAt?.toISOString() || null,
        paidAt: payout.paidAt?.toISOString() || null,
        notes: payout.notes || null,
        createdAt: payout.createdAt.toISOString(),
        booking: {
          id: payout.booking.id,
          name: payout.booking.name,
          eventDate: payout.booking.eventDate.toISOString().split('T')[0],
        },
        farmer: {
          id: payout.farmer.id,
          name: payout.farmer.name,
          phone: payout.farmer.phone,
        },
      })),
    }
  } catch (error: any) {
    console.error('Error in getBookingPayouts:', error)
    return { success: false, error: error.message || 'Failed to fetch payouts' }
  }
}
