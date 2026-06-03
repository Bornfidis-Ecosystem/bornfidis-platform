export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { InquiryBodySchema, runAiQuoteGeneration } from '@/lib/run-ai-quote-generation'

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req)
  if (authError) return authError

  try {
    const rawBody = await req.json()
    const parsed = InquiryBodySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const out = await runAiQuoteGeneration(parsed.data)
    if (out.kind === 'email_failed') {
      return NextResponse.json(out.body, { status: out.status })
    }
    return NextResponse.json(out.body)
  } catch (err) {
    console.error('[POST /api/quote/generate]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    const missingKey = message.includes('ANTHROPIC_API_KEY')
    return NextResponse.json(
      { error: 'Quote generation failed', message },
      { status: missingKey ? 503 : 500 },
    )
  }
}
