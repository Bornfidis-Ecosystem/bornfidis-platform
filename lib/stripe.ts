/**
 * Phase 3A: Stripe integration utilities
 * Safe, optional - returns null if Stripe is not configured
 */

let stripeInstance: any = null

/**
 * Get Stripe instance if configured
 * Returns null if STRIPE_SECRET_KEY is not set
 */
export async function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return null
  }

  // Lazy load Stripe to avoid bundling if not needed
  if (!stripeInstance) {
    try {
      const stripeModule = await import('stripe')
      stripeInstance = new stripeModule.default(stripeSecretKey)
    } catch (error) {
      console.error('Error loading Stripe:', error)
      return null
    }
  }

  return stripeInstance
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}
