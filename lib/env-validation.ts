/**
 * Phase 5B: Environment variable validation
 * Validates required env vars for Stripe Connect
 */

export function validateStripeConnectEnv(): {
  valid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []

  // Required for Stripe Connect
  if (!process.env.STRIPE_SECRET_KEY) {
    missing.push('STRIPE_SECRET_KEY')
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    missing.push('NEXT_PUBLIC_SITE_URL')
  }

  // Optional but recommended
  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY (optional - for sending onboarding emails)')
  }

  // Note: STRIPE_CONNECT_CLIENT_ID is not needed for Express accounts
  // It's only needed for OAuth flow, which we're not using

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate env vars and log warnings
 * Call this at startup or in API routes
 */
export function checkStripeConnectConfig(): void {
  const validation = validateStripeConnectEnv()

  if (!validation.valid) {
    console.error('❌ Missing required environment variables:')
    validation.missing.forEach((varName) => {
      console.error(`   - ${varName}`)
    })
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:')
    validation.warnings.forEach((varName) => {
      console.warn(`   - ${varName}`)
    })
  }
}
