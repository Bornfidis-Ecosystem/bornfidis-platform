/**
 * Seed Academy products (idempotent upsert by slug).
 * Run: npx tsx scripts/seed-academy-products.ts
 * Requires: DIRECT_URL or DATABASE_URL in .env
 *
 * Populates the 4 flagship products so the public Academy page has live DB products.
 * Set Stripe Price IDs in Admin → Academy products after running, or via env.
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!directUrl) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL')
}

const prisma = new PrismaClient({
  datasources: { db: { url: directUrl } },
})

const ACADEMY_PRODUCTS = [
  {
    slug: 'caribbean-culinary-foundations',
    title: 'Caribbean Culinary Foundations',
    description:
      'Comprehensive manual covering menu design, kitchen operations, cost management, and business scaling for Caribbean and Jamaican chefs. Includes: menu engineering (cost + creativity + culture), kitchen efficiency systems, staff management templates, catering business model, farm-to-table sourcing guide, and ready-to-use templates. Digital PDF. Lifetime access.',
    type: 'DOWNLOAD',
    priceCents: 7900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_CARIBBEAN_CULINARY ?? null,
    active: true,
    featured: true,
  },
  {
    slug: 'regenerative-enterprise-foundations',
    title: 'Regenerative Enterprise Foundations',
    description:
      '60-page discipline manual providing systems, frameworks, and rhythms to transform chaotic hustle into sustainable enterprise. Includes: Pricing With Dignity framework (Cost + Margin + Buffer), 4-layer revenue structure, weekly operating rhythm (Monday/Wednesday/Friday checkpoints), parish authority model, reputation covenant, 90-Day Builder Covenant, and 7 ready-to-use templates. Digital PDF. Lifetime access.',
    type: 'DOWNLOAD',
    priceCents: 3900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_ENTERPRISE ?? null,
    active: true,
    featured: true,
  },
  {
    slug: 'regenerative-farmer-blueprint',
    title: 'Regenerative Farmer Blueprint',
    description:
      '60-page discipline manual covering soil regeneration, crop planning, market access, and financial sustainability. Includes: soil health assessment framework, crop rotation planner (12-month calendar), regenerative certification roadmap, pricing calculator (cost + margin + dignity), market access strategy, and 10 ready-to-use templates for farm operations. Digital PDF. Lifetime access.',
    type: 'DOWNLOAD',
    priceCents: 4900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_REGENERATIVE_FARMER ?? null,
    active: true,
    featured: false,
  },
  {
    slug: 'vermont-contractor-foundations',
    title: 'Vermont Contractor Foundations',
    description:
      '60-page discipline manual providing systems, frameworks, and rhythms for sustainable contracting business. Includes: project estimation framework (materials + labor + buffer), weekly operating rhythm (Monday/Wednesday/Friday checkpoints), client communication templates, seasonal planning guide, reputation covenant, and 8 ready-to-use templates for contracts, invoices, and project management. Digital PDF. Lifetime access.',
    type: 'DOWNLOAD',
    priceCents: 4900,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ACADEMY_VERMONT_CONTRACTOR ?? null,
    active: true,
    featured: false,
  },
] as const

async function main() {
  console.log('🌱 Seeding Academy products (upsert by slug)...\n')

  for (const p of ACADEMY_PRODUCTS) {
    const created = await prisma.academyProduct.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        type: p.type,
        priceCents: p.priceCents,
        stripePriceId: p.stripePriceId ?? undefined,
        active: p.active,
        featured: p.featured,
      },
      update: {
        title: p.title,
        description: p.description,
        type: p.type,
        priceCents: p.priceCents,
        stripePriceId: p.stripePriceId ?? undefined,
        active: p.active,
        featured: p.featured,
      },
    })
    console.log(`  ${created.id ? '✓' : '○'} ${p.slug} — ${p.title} ($${(p.priceCents / 100).toFixed(0)})`)
  }

  console.log('\n✅ Academy products seed complete.')
  console.log('   Set Stripe Price IDs in Admin → Academy products for paid checkout.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
