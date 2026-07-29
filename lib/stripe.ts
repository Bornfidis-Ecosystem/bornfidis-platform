/**
 * Multi-account Stripe router — Bornfidis Provisions + Digital Studio.
 *
 * Env (preferred):
 *   STRIPE_PROVISIONS_SECRET_KEY / STRIPE_PROVISIONS_WEBHOOK_SECRET
 *   STRIPE_DIGITAL_STUDIO_SECRET_KEY / STRIPE_DIGITAL_STUDIO_WEBHOOK_SECRET
 *
 * Backward compat:
 *   STRIPE_SECRET_KEY        → Provisions secret (primary)
 *   STRIPE_WEBHOOK_SECRET    → Provisions webhook secret
 */

import Stripe from 'stripe'

export type StripeDivision = 'provisions' | 'digital-studio'

const API_VERSION = '2024-11-20.acacia' as Stripe.LatestApiVersion

const clients: Partial<Record<StripeDivision, Stripe>> = {}

function cleanEnv(value: string | undefined): string | undefined {
  const v = value?.trim().replace(/\r/g, '')
  return v || undefined
}

function resolveSecretKey(division: StripeDivision): string | undefined {
  if (division === 'provisions') {
    return (
      cleanEnv(process.env.STRIPE_PROVISIONS_SECRET_KEY) ||
      cleanEnv(process.env.STRIPE_SECRET_KEY)
    )
  }
  return cleanEnv(process.env.STRIPE_DIGITAL_STUDIO_SECRET_KEY)
}

function resolveWebhookSecret(division: StripeDivision): string | undefined {
  if (division === 'provisions') {
    return (
      cleanEnv(process.env.STRIPE_PROVISIONS_WEBHOOK_SECRET) ||
      cleanEnv(process.env.STRIPE_WEBHOOK_SECRET)
    )
  }
  return cleanEnv(process.env.STRIPE_DIGITAL_STUDIO_WEBHOOK_SECRET)
}

/**
 * Return a Stripe client for the given division.
 * Throws if the secret key is not configured.
 */
export function getStripeClient(division: StripeDivision): Stripe {
  const key = resolveSecretKey(division)
  if (!key) {
    throw new Error(
      `Stripe secret key is not configured for division "${division}". ` +
        (division === 'provisions'
          ? 'Set STRIPE_PROVISIONS_SECRET_KEY (or legacy STRIPE_SECRET_KEY).'
          : 'Set STRIPE_DIGITAL_STUDIO_SECRET_KEY.'),
    )
  }

  if (!clients[division]) {
    clients[division] = new Stripe(key, { apiVersion: API_VERSION })
  }
  return clients[division]!
}

/**
 * Return the webhook signing secret for the given division.
 * Throws if not configured.
 */
export function getWebhookSecret(division: StripeDivision): string {
  const secret = resolveWebhookSecret(division)
  if (!secret) {
    throw new Error(
      `Stripe webhook secret is not configured for division "${division}". ` +
        (division === 'provisions'
          ? 'Set STRIPE_PROVISIONS_WEBHOOK_SECRET (or legacy STRIPE_WEBHOOK_SECRET).'
          : 'Set STRIPE_DIGITAL_STUDIO_WEBHOOK_SECRET.'),
    )
  }
  return secret
}

/**
 * Soft check — does not throw.
 */
export function isStripeConfigured(division: StripeDivision = 'provisions'): boolean {
  return !!resolveSecretKey(division)
}

/**
 * @deprecated Use getStripeClient('provisions') — kept for gradual migration.
 * Returns null if Provisions Stripe is not configured.
 */
export async function getStripe(): Promise<Stripe | null> {
  try {
    return getStripeClient('provisions')
  } catch {
    return null
  }
}

/**
 * Throw when a payment route cannot determine which Stripe account to use.
 * Do not guess.
 */
export function throwAmbiguousStripeDivision(context: string): never {
  throw new Error(
    `Stripe division is ambiguous for: ${context}. ` +
      `Pass an explicit division ('provisions' | 'digital-studio') or use a route dedicated to one account.`,
  )
}
