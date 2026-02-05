export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ChefStatementPdfDocument } from '@/components/pdf/ChefStatementPdf'
import { getChefIdsWithPaidJobsInMonth, getStatementDataForChefMonth } from '@/lib/chef-statements'
import { sendChefMonthlyStatementEmail } from '@/lib/email'

/**
 * Phase 2T: Monthly chef statements cron.
 * Run on the 1st of each month (e.g. 0 3 1 * *) for previous calendar month.
 * Vercel Cron: set CRON_SECRET in env and protect this route.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const chefIds = await getChefIdsWithPaidJobsInMonth(prevYear, prevMonth)
  const results: { chefId: string; sent: boolean; error?: string }[] = []

  for (const chefId of chefIds) {
    try {
      const statement = await getStatementDataForChefMonth(chefId, prevYear, prevMonth)
      if (!statement) {
        results.push({ chefId, sent: false, error: 'No statement data' })
        continue
      }

      const pdfBuffer = await renderToBuffer(
        ChefStatementPdfDocument({ statement })
      )
      const filename = `Chef-Statement-${prevYear}-${String(prevMonth).padStart(2, '0')}.pdf`

      const sent = await sendChefMonthlyStatementEmail({
        to: statement.chefEmail,
        chefName: statement.chefName,
        monthLabel: statement.monthLabel,
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
    month: `${prevYear}-${String(prevMonth).padStart(2, '0')}`,
    chefsProcessed: chefIds.length,
    results,
  })
}
