import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSettingsSchema = z.object({
  storeConversionRate: z.number().min(0).optional(),
  cashReserve: z.number().min(0).optional(),
})

/**
 * PUT /api/admin/settings
 * Update admin_settings (conversion rate, cash reserve).
 */
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    if (parsed.data.storeConversionRate !== undefined) {
      await db.adminSetting.upsert({
        where: { key: 'store_conversion_rate' },
        create: { key: 'store_conversion_rate', value: String(parsed.data.storeConversionRate) },
        update: { value: String(parsed.data.storeConversionRate) },
      })
    }
    if (parsed.data.cashReserve !== undefined) {
      await db.adminSetting.upsert({
        where: { key: 'cash_reserve' },
        create: { key: 'cash_reserve', value: String(parsed.data.cashReserve) },
        update: { value: String(parsed.data.cashReserve) },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/settings] PUT', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
