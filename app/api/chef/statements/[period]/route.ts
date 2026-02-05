export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth'
import { db } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import { ChefStatementPdfDocument } from '@/components/pdf/ChefStatementPdf'
import { getStatementDataForChefMonth } from '@/lib/chef-statements'
import { CHEF_ROLES } from '@/lib/require-role'

/**
 * Phase 2T: Chef downloads their monthly statement PDF (read-only).
 * GET /api/chef/statements/[period] — period = YYYY-MM
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { period: string } }
) {
  try {
    const period = params.period
    const match = /^(\d{4})-(\d{2})$/.exec(period)
    if (!match) {
      return NextResponse.json({ error: 'Invalid period (use YYYY-MM)' }, { status: 400 })
    }
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10)
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prismaUser = await db.user.findFirst({
      where: { OR: [{ openId: user.id }, { email: user.email }] },
      select: { id: true, role: true },
    })
    if (!prismaUser || !CHEF_ROLES.includes(prismaUser.role as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const statement = await getStatementDataForChefMonth(prismaUser.id, year, month)
    if (!statement) {
      return NextResponse.json({ error: 'No statement for this period' }, { status: 404 })
    }

    const pdfBuffer = await renderToBuffer(ChefStatementPdfDocument({ statement }))
    const filename = `Chef-Statement-${year}-${String(month).padStart(2, '0')}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: unknown) {
    console.error('Chef statement download error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate statement' },
      { status: 500 }
    )
  }
}
