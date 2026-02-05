import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ChefTaxSummaryPdfDocument } from '@/components/pdf/ChefTaxSummaryPdf'
import { getChefIdsWithPaidJobsInYear, getChefTaxSummaryData } from '@/lib/chef-tax-summary'
import { sendChefTaxSummaryEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Phase 2AF: Annual chef tax summaries cron.
 * Run Jan 15 (e.g. 0 4 15 1 *) for prior calendar year.
 * Vercel Cron: set CRON_SECRET in env.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const priorYear = now.getFullYear() - 1

  const chefIds = await getChefIdsWithPaidJobsInYear(priorYear)
  const results: { chefId: string; sent: boolean; error?: string }[] = []

  for (const chefId of chefIds) {
    try {
      const data = await getChefTaxSummaryData(chefId, priorYear)
      if (!data) {
        results.push({ chefId, sent: false, error: 'No summary data' })
        continue
      }

      const pdfBuffer = await renderToBuffer(ChefTaxSummaryPdfDocument({ data }))
      const filename = `Chef-Tax-Summary-${priorYear}.pdf`

      const sent = await sendChefTaxSummaryEmail({
        to: data.chefEmail,
        chefName: data.chefName,
        year: priorYear,
        pdfBuffer: Buffer.from(pdfBuffer),
        filename,
      })

      if (sent.success) {
        results.push({ chefId, sent: true })
      } else {
        results.push({ chefId, sent: false, error: sent.error })
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      results.push({ chefId, sent: false, error: message })
    }
  }

  return NextResponse.json({
    ok: true,
    year: priorYear,
    chefsProcessed: chefIds.length,
    results,
  })
}
