import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'
import type { EventInquiry, QuoteAgentContext } from '@/lib/anthropic-quote-agent'

const DEFAULT_CHEF_DAY_RATE = 450

/**
 * Loads chefs (Prisma `User` with role CHEF) and farmers (`farmer` → `farmers` table).
 * There is no Prisma `chefs` model; assignment UIs often use Supabase `chefs` instead.
 */
export async function loadQuoteAgentContext(inquiry: EventInquiry): Promise<QuoteAgentContext> {
  const [chefUsers, farmerRows] = await Promise.all([
    db.user.findMany({
      where: {
        role: UserRole.CHEF,
        name: { not: null },
      },
      take: 80,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    db.farmer.findMany({
      take: 80,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        crops_available: true,
        location: true,
        parish: true,
      },
    }),
  ])

  const dayRate = Number(process.env.PRICING_CHEF_DAY_RATE_DEFAULT ?? DEFAULT_CHEF_DAY_RATE)

  const pricing = {
    base_per_guest_usd: Number(process.env.PRICING_BASE_PER_GUEST ?? 45),
    produce_per_guest_usd: Number(process.env.PRICING_PRODUCE_PER_GUEST ?? 18),
    equipment_flat_usd: Number(process.env.PRICING_EQUIPMENT_FLAT ?? 150),
    travel_rate_per_mile_usd: Number(process.env.PRICING_TRAVEL_PER_MILE ?? 1.2),
    tax_rate_percent: Number(process.env.PRICING_TAX_RATE ?? 0),
  }

  return {
    inquiry,
    available_chefs: chefUsers.map((c) => ({
      id: c.id,
      name: c.name?.trim() || 'Chef',
      specialties: [] as string[],
      day_rate_usd: Number.isFinite(dayRate) ? dayRate : DEFAULT_CHEF_DAY_RATE,
      available: true,
    })),
    available_farmers: farmerRows.map((f) => ({
      id: f.id,
      name: f.name,
      current_produce: f.crops_available ?? [],
      location: [f.location, f.parish].filter(Boolean).join(', ') || 'Jamaica',
    })),
    pricing,
  }
}
