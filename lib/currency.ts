/**
 * Phase 2AI — Multi-currency support.
 * Base currency: USD. All calculations in USD; convert only for display + payout display.
 * Lock exchange rate at payout creation; never recalc.
 */

import { db } from '@/lib/db'

export const BASE_CURRENCY = 'USD'
export const SUPPORTED_CURRENCIES = ['USD', 'JMD', 'EUR', 'GBP'] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(code as SupportedCurrency)
}

/**
 * Get latest rate from base (USD) to target currency. Returns 1 for USD.
 */
export async function getLatestRate(
  fromCode: string,
  toCode: string
): Promise<number | null> {
  if (fromCode === toCode) return 1
  const row = await db.currencyRate.findUnique({
    where: {
      fromCode_toCode: { fromCode, toCode },
    },
  })
  return row?.rate ?? null
}

/**
 * Get all latest rates from USD. Returns map toCode -> rate (USD->JMD etc). USD not included (1).
 */
export async function getLatestRatesFromUsd(): Promise<Record<string, number>> {
  const rows = await db.currencyRate.findMany({
    where: { fromCode: BASE_CURRENCY },
    orderBy: { fetchedAt: 'desc' },
  })
  const byTo: Record<string, number> = {}
  for (const r of rows) {
    if (!byTo[r.toCode]) byTo[r.toCode] = r.rate
  }
  return byTo
}

/**
 * Upsert a rate (from, to, rate). Used by cron.
 */
export async function upsertRate(
  fromCode: string,
  toCode: string,
  rate: number
): Promise<void> {
  await db.currencyRate.upsert({
    where: { fromCode_toCode: { fromCode, toCode } },
    create: { fromCode, toCode, rate },
    update: { rate, fetchedAt: new Date() },
  })
}

/**
 * Convert base (USD) cents to display amount in target currency using locked rate.
 * If no rate (e.g. USD), returns usdCents/100 as dollars.
 */
export function convertUsdCentsToDisplay(
  usdCents: number,
  targetCurrency: string,
  lockedRate: number | null
): { amount: number; currency: string; rate: number | null } {
  if (targetCurrency === BASE_CURRENCY || lockedRate == null) {
    return { amount: usdCents / 100, currency: BASE_CURRENCY, rate: null }
  }
  const usdAmount = usdCents / 100
  const converted = Math.round(usdAmount * lockedRate * 100) / 100
  return { amount: converted, currency: targetCurrency, rate: lockedRate }
}

/**
 * Format amount for display with currency code.
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const code = currencyCode.toUpperCase()
  if (code === 'USD') return `$${amount.toFixed(2)}`
  if (code === 'EUR') return `€${amount.toFixed(2)}`
  if (code === 'GBP') return `£${amount.toFixed(2)}`
  return `${code} ${amount.toFixed(2)}`
}

/**
 * Get chef's effective payout currency (preferred or admin override). Respects global disable.
 */
export async function getChefPayoutCurrency(chefId: string): Promise<string> {
  const allowNonUsd = process.env.NON_USD_PAYOUTS_ENABLED === 'true'
  const profile = await db.chefProfile.findUnique({
    where: { userId: chefId },
    select: { payoutCurrencyOverride: true, preferredPayoutCurrency: true },
  })
  const override = profile?.payoutCurrencyOverride
  const preferred = profile?.preferredPayoutCurrency ?? BASE_CURRENCY
  const effective = override ?? preferred
  if (!allowNonUsd && effective !== BASE_CURRENCY) return BASE_CURRENCY
  return isSupportedCurrency(effective) ? effective : BASE_CURRENCY
}

/**
 * Lock FX rate for a booking's chef payout. Call when payout is created/paid.
 * Writes chefPayoutCurrency and chefPayoutFxRate to BookingInquiry (Prisma).
 */
export async function lockPayoutFxForBooking(
  bookingId: string,
  chefId: string,
  usdCents: number
): Promise<{ currency: string; rate: number } | null> {
  const currency = await getChefPayoutCurrency(chefId)
  if (currency === BASE_CURRENCY) {
    await db.bookingInquiry.update({
      where: { id: bookingId },
      data: { chefPayoutCurrency: BASE_CURRENCY, chefPayoutFxRate: 1 },
    })
    return { currency: BASE_CURRENCY, rate: 1 }
  }
  const rate = await getLatestRate(BASE_CURRENCY, currency)
  if (rate == null) {
    await db.bookingInquiry.update({
      where: { id: bookingId },
      data: { chefPayoutCurrency: BASE_CURRENCY, chefPayoutFxRate: 1 },
    })
    return { currency: BASE_CURRENCY, rate: 1 }
  }
  await db.bookingInquiry.update({
    where: { id: bookingId },
    data: { chefPayoutCurrency: currency, chefPayoutFxRate: rate },
  })
  return { currency, rate }
}
