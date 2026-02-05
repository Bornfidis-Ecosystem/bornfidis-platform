import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getCurrentPrismaUser } from '@/lib/partner'
import { getCurrentUserRole } from '@/lib/get-user-role'
import { requireRole } from '@/lib/require-role'
import { CHEF_ROLES } from '@/lib/require-role'
import { getChefTaxSummaryData } from '@/lib/chef-tax-summary'
import { ChefTaxSummaryPdfDocument } from '@/components/pdf/ChefTaxSummaryPdf'

export const dynamic = 'force-dynamic'

/**
 * Phase 2AF — Chef downloads tax summary PDF for a year.
 * GET /api/chef/tax-summary/[year] — auth required, chef sees own only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const role = await getCurrentUserRole()
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  requireRole(role, CHEF_ROLES)

  const user = await getCurrentPrismaUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { year: yearParam } = await params
  const year = parseInt(yearParam, 10)
  if (!Number.isFinite(year) || year < 2020 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
  }

  const data = await getChefTaxSummaryData(user.id, year)
  if (!data) {
    return NextResponse.json(
      { error: 'No tax summary data for this year' },
      { status: 404 }
    )
  }

  const pdfBuffer = await renderToBuffer(ChefTaxSummaryPdfDocument({ data }))
  const filename = `Chef-Tax-Summary-${year}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
