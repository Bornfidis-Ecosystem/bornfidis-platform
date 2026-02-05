import { NextRequest, NextResponse } from 'next/server'
import { upsertRate } from '@/lib/currency'
import { BASE_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib/currency'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Phase 2AI: Fetch FX rates daily. Store in CurrencyRate.
 * Set CRON_SECRET. Optional: EXCHANGE_RATE_API_KEY for live rates; else uses fallback defaults.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { pair: string; rate: number; source: string }[] = []

  for (const to of SUPPORTED_CURRENCIES) {
    if (to === BASE_CURRENCY) continue
    let rate: number
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (apiKey) {
      try {
        const res = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${BASE_CURRENCY}`,
          { next: { revalidate: 0 } }
        )
        const data = await res.json()
        rate = data?.conversion_rates?.[to] ?? fallbackRate(to)
      } catch {
        rate = fallbackRate(to)
      }
    } else {
      rate = fallbackRate(to)
    }
    await upsertRate(BASE_CURRENCY, to, rate)
    results.push({ pair: `${BASE_CURRENCY}-${to}`, rate, source: apiKey ? 'api' : 'fallback' })
  }

  return NextResponse.json({ ok: true, results })
}

function fallbackRate(to: string): number {
  const fallbacks: Record<string, number> = {
    JMD: 155,
    EUR: 0.92,
    GBP: 0.79,
  }
  return fallbacks[to] ?? 1
}
