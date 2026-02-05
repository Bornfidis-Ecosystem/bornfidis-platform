/**
 * Phase 2M: ProJu Marketplace Demand Signal CSV Export
 * 
 * Export last 60 days of ingredient demand to CSV file for:
 * - Sharing with PAPG farmers
 * - Review in Excel / Google Sheets
 * - Manual crop planning & outreach
 * 
 * Usage: npx tsx scripts/proju-demand-export.ts
 * 
 * No UI. No Prisma schema changes. Read-only.
 */

import { db } from '../lib/db'
import { Prisma } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { isCropReadyForPAPG } from '../lib/proju-crop-status'

async function run() {
  console.log('\n🌱 Exporting ProJu Demand Signal (Last 60 Days)...\n')

  const results = await db.$queryRaw<
    {
      ingredient: string
      parish: string | null
      total_quantity: number
      booking_count: number
      last_requested_at: Date
    }[]
  >(Prisma.sql`
    SELECT
      i.name AS ingredient,
      COALESCE(b.parish, f.parish, 'Unknown') AS parish,
      SUM(bi.quantity) AS total_quantity,
      COUNT(DISTINCT bi.booking_id) AS booking_count,
      MAX(bi.created_at) AS last_requested_at
    FROM booking_ingredients bi
    JOIN ingredients i ON bi.ingredient_id = i.id
    JOIN booking_inquiries b ON bi.booking_id = b.id
    LEFT JOIN farmers f ON bi.farmer_id = f.id
    WHERE b.created_at >= NOW() - INTERVAL '60 days'
    GROUP BY i.name, parish
    ORDER BY total_quantity DESC;
  `)

  if (!results.length) {
    console.log('⚠️  No ingredient demand found.')
    return
  }

  // Aggregate by ingredient (across all parishes) for priority calculation
  const ingredientMap = new Map<
    string,
    {
      ingredient: string
      parishes: Map<string, number> // parish -> quantity
      total_quantity: number
      booking_count: number
      last_requested_at: Date
    }
  >()

  results.forEach((r) => {
    const parish = r.parish || 'Unknown'
    if (!ingredientMap.has(r.ingredient)) {
      ingredientMap.set(r.ingredient, {
        ingredient: r.ingredient,
        parishes: new Map(),
        total_quantity: 0,
        booking_count: 0,
        last_requested_at: r.last_requested_at,
      })
    }
    const entry = ingredientMap.get(r.ingredient)!
    entry.total_quantity += r.total_quantity
    entry.booking_count += r.booking_count
    entry.parishes.set(parish, (entry.parishes.get(parish) || 0) + r.total_quantity)
    // Keep most recent date
    if (r.last_requested_at > entry.last_requested_at) {
      entry.last_requested_at = r.last_requested_at
    }
  })

  // Convert to array and calculate priority score
  const aggregatedResults = Array.from(ingredientMap.values()).map((entry) => {
    // Find primary parish (highest quantity)
    let primaryParish = 'Unknown'
    let maxQuantity = 0
    entry.parishes.forEach((qty, parish) => {
      if (qty > maxQuantity) {
        maxQuantity = qty
        primaryParish = parish
      }
    })

    return {
      ingredient: entry.ingredient,
      parish: primaryParish,
      total_quantity: entry.total_quantity,
      booking_count: entry.booking_count,
      last_requested_at: entry.last_requested_at,
    }
  })

  // Filter by crop status - only validated or limited crops may proceed to PAPG
  const readyCrops = aggregatedResults.filter((crop) =>
    isCropReadyForPAPG(crop.ingredient)
  )

  // Calculate priority crops with weighted score (only from ready crops)
  const priorityCrops = readyCrops
    .sort((a, b) => {
      // Weighted score: quantity + bookings + recency bonus
      const score = (r: typeof a) => {
        const recencyBonus =
          Date.now() - new Date(r.last_requested_at).getTime() < 14 * 86400000
            ? 10
            : 0
        return r.total_quantity * 2 + r.booking_count * 5 + recencyBonus
      }
      return score(b) - score(a)
    })
    .slice(0, 5)

  const csvHeader =
    'Ingredient,Parish,Total Quantity,Bookings,Last Requested\n'

  const csvRows = results.map(
    (r) =>
      `"${r.ingredient}","${r.parish || 'Unknown'}",${r.total_quantity},${r.booking_count},${r.last_requested_at
        .toISOString()
        .split('T')[0]}`
  )

  const csvContent = csvHeader + csvRows.join('\n')

  const outputDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filePath = path.join(
    outputDir,
    `proju-demand-${new Date().toISOString().split('T')[0]}.csv`
  )

  fs.writeFileSync(filePath, csvContent, 'utf8')

  console.log(`✅ Export complete`)
  console.log(`📄 File saved to: ${filePath}\n`)
  console.log(`📊 Exported ${results.length} ingredient-parish combinations\n`)

  // Export priority crops CSV
  const priorityPath = path.join(
    outputDir,
    'proju-priority-crops.csv'
  )

  const priorityHeader =
    'Rank,Ingredient,Primary Parish,Total Quantity,Bookings,Last Requested\n'

  const priorityRows = priorityCrops.map(
    (r, i) =>
      `${i + 1},"${r.ingredient}","${r.parish}",${r.total_quantity},${r.booking_count},${r.last_requested_at
        .toISOString()
        .split('T')[0]}`
  )

  fs.writeFileSync(
    priorityPath,
    priorityHeader + priorityRows.join('\n'),
    'utf8'
  )

  console.log(`✅ Priority crops export complete`)
  console.log(`📄 File saved to: ${priorityPath}\n`)
  
  if (priorityCrops.length === 0) {
    console.log(`⚠️  No priority crops found (only validated/limited crops are included)`)
    console.log(`   Total ready crops: ${readyCrops.length}`)
    console.log(`   Total ingredients: ${aggregatedResults.length}\n`)
  } else {
    console.log(`🌱 Top 5 Priority Crops (validated/limited only):`)
    priorityCrops.forEach((crop, i) => {
      console.log(
        `   ${i + 1}. ${crop.ingredient} (${crop.parish}) - ${crop.total_quantity} units, ${crop.booking_count} bookings`
      )
    })
    console.log()
  }
}

run()
  .catch((err) => {
    console.error('❌ Export failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
