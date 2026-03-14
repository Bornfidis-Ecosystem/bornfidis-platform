import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0)
}

/**
 * GET /api/admin/divisions
 * Zone 2: Sportswear, Academy, Provisions, ProJu metrics.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const now = new Date()
  const startOfThisWeek = startOfWeek(now)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    // Sportswear: orders this week, revenue this week, top product by units
    const [sportswearOrdersThisWeek, sportswearLinesThisWeek] = await Promise.all([
      db.sportswearOrder.findMany({
        where: {
          AND: [{ createdAt: { gte: startOfThisWeek } }, { paidAt: { not: null } }],
        },
        select: { id: true, totalCents: true, lines: { select: { productId: true, quantity: true } } },
      }),
      db.sportswearOrderLine.findMany({
        where: {
          order: {
            AND: [{ createdAt: { gte: startOfThisWeek } }, { paidAt: { not: null } }],
          },
        },
        include: { product: { select: { name: true } } },
      }),
    ])
    const revenueThisWeekCents = sportswearOrdersThisWeek.reduce((s, o) => s + o.totalCents, 0)
    const productCounts: Record<string, { name: string; qty: number }> = {}
    sportswearLinesThisWeek.forEach((l) => {
      const name = l.product?.name ?? 'Unknown'
      if (!productCounts[l.productId]) productCounts[l.productId] = { name, qty: 0 }
      productCounts[l.productId].qty += l.quantity
    })
    const topEntry = Object.entries(productCounts).sort((a, b) => b[1].qty - a[1].qty)[0]
    const sportswear = {
      ordersThisWeek: sportswearOrdersThisWeek.length,
      revenueThisWeekCents,
      topProduct: topEntry ? topEntry[1].name : null,
    }

    // Academy: total students (enrollments), enrollments this month, courses live
    const [totalEnrollments, enrollmentsThisMonth, coursesLive] = await Promise.all([
      db.academyEnrollment.count(),
      db.academyEnrollment.count({
        where: { enrolledAt: { gte: startOfThisMonth } },
      }),
      db.academyProduct.count({ where: { active: true } }),
    ])
    const academy = {
      totalStudents: totalEnrollments,
      enrollmentsThisMonth,
      coursesLive,
    }

    // Provisions: active bookings, pending leads, next event date
    const [activeBookings, pendingLeads, nextEvent] = await Promise.all([
      db.bookingInquiry.count({
        where: {
          status: { notIn: ['cancelled', 'completed', 'Cancelled', 'Completed'] },
        },
      }),
      db.bookingInquiry.count({
        where: {
          status: { in: ['New', 'Quote Sent', 'Follow Up', 'quote_sent', 'follow_up'] },
        },
      }),
      db.bookingInquiry.findFirst({
        where: {
          eventDate: { gte: now },
          status: { notIn: ['cancelled', 'completed', 'Cancelled', 'Completed'] },
        },
        orderBy: { eventDate: 'asc' },
        select: { eventDate: true },
      }),
    ])
    const provisions = {
      activeBookings,
      pendingLeads,
      nextEventDate: nextEvent?.eventDate
        ? nextEvent.eventDate.toISOString().slice(0, 10)
        : null,
    }

    // ProJu: farmers total, listings live, recent applications (farmers created in last 30 days)
    const [farmersTotal, listingsLive, recentApplications] = await Promise.all([
      db.farmer.count(),
      db.farmListing.count({ where: { status: 'active' } }),
      db.farmer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ])
    const proju = {
      farmersTotal,
      listingsLive,
      recentApplications,
    }

    return NextResponse.json({
      sportswear,
      academy,
      provisions,
      proju,
    })
  } catch (err) {
    console.error('[admin/divisions]', err)
    return NextResponse.json(
      { error: 'Failed to load division metrics' },
      { status: 500 }
    )
  }
}
