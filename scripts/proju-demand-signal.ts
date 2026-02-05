/**
 * Phase 2M: ProJu Marketplace Demand Signal
 * 
 * Read-only demand report from booking_ingredients showing:
 * - Ingredient name
 * - Total quantity requested
 * - Number of bookings
 * - Last requested date (last 60 days)
 * 
 * Usage: npx tsx scripts/proju-demand-signal.ts
 * 
 * No schema changes. No automation. No risk.
 */

import { db } from '../lib/db'
import { Prisma } from '@prisma/client'

async function run() {
  console.log('\n🌱 ProJu Demand Signal — Last 60 Days\n')

  const results = await db.$queryRaw<
    {
      ingredient: string
      total_quantity: number
      booking_count: number
      last_requested_at: Date
    }[]
  >(Prisma.sql`
    SELECT
      i.name AS ingredient,
      SUM(bi.quantity) AS total_quantity,
      COUNT(DISTINCT bi.booking_id) AS booking_count,
      MAX(bi.created_at) AS last_requested_at
    FROM booking_ingredients bi
    JOIN ingredients i ON bi.ingredient_id = i.id
    JOIN booking_inquiries b ON bi.booking_id = b.id
    WHERE b.created_at >= NOW() - INTERVAL '60 days'
    GROUP BY i.name
    ORDER BY total_quantity DESC;
  `)

  if (!results.length) {
    console.log('⚠️  No ingredient demand found in the last 60 days.\n')
    return
  }

  results.forEach((row, index) => {
    console.log(
      `${index + 1}. ${row.ingredient}
   • Total Qty: ${row.total_quantity}
   • Bookings: ${row.booking_count}
   • Last Requested: ${row.last_requested_at.toISOString().split('T')[0]}
`
    )
  })

  console.log('✅ End of ProJu demand report\n')
}

run()
  .catch((err) => {
    console.error('❌ Error running ProJu demand signal:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
