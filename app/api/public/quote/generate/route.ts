export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { InquiryBodySchema, runAiQuoteGeneration } from '@/lib/run-ai-quote-generation'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    if (
      rawBody &&
      typeof rawBody === 'object' &&
      'website_url' in rawBody &&
      String((rawBody as { website_url?: unknown }).website_url ?? '').length > 0
    ) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

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
    console.error('[POST /api/public/quote/generate]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    const missingKey = message.includes('ANTHROPIC_API_KEY')
    return NextResponse.json(
      { error: 'Quote generation failed', message },
      { status: missingKey ? 503 : 500 },
    )
  }
}
