/**
 * SMS Reliability Service
 * 
 * Features:
 * - Retry logic with exponential backoff (max 3 attempts)
 * - Rate limiting (max 5 SMS per phone per hour)
 * - Failure tracking in FailedSMS table
 * - Non-blocking (never blocks form submissions)
 */

import { db } from '@/lib/db'
import { sendSMS } from '@/lib/twilio'
import { normalizePhoneNumber } from '@/lib/phone-normalize'

const MAX_ATTEMPTS = 3
const RATE_LIMIT_SMS_PER_HOUR = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface SendSMSWithRetryOptions {
  phone: string
  message: string
  submissionType?: string
}

interface SendSMSResult {
  success: boolean
  messageSid?: string
  error?: string
  retryScheduled?: boolean
}

// In-memory rate limit tracking (per phone number)
// In production, use Redis or a database table for distributed systems
const rateLimitCache = new Map<string, { count: number; resetAt: number }>()

/**
 * Check rate limit for a phone number
 * Returns true if SMS can be sent, false if rate limited
 * 
 * Uses in-memory cache for fast lookups
 * Falls back to database check if cache is stale
 */
async function checkRateLimit(phone: string): Promise<boolean> {
  try {
    const now = Date.now()
    const cached = rateLimitCache.get(phone)

    // Check in-memory cache first
    if (cached) {
      if (now < cached.resetAt) {
        // Still within the rate limit window
        if (cached.count >= RATE_LIMIT_SMS_PER_HOUR) {
          return false // Rate limited
        }
        // Increment count
        cached.count++
        return true
      } else {
        // Cache expired, reset
        rateLimitCache.delete(phone)
      }
    }

    // Cache miss or expired - check database for recent attempts
    const oneHourAgo = new Date(now - RATE_LIMIT_WINDOW_MS)
    
    // Count recent failed attempts (conservative approach)
    // In production, track successful sends in a separate table
    const recentAttempts = await db.failedSMS.count({
      where: {
        phone: phone,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })

    // If we have too many recent attempts, rate limit
    if (recentAttempts >= RATE_LIMIT_SMS_PER_HOUR) {
      return false
    }

    // Update cache
    rateLimitCache.set(phone, {
      count: recentAttempts + 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return true
  } catch (error) {
    // If rate limit check fails, allow the SMS (fail open)
    console.error('Rate limit check failed:', error)
    return true
  }
}

/**
 * Record successful SMS send for rate limiting
 * Called after a successful SMS send
 */
function recordSuccessfulSend(phone: string): void {
  const now = Date.now()
  const cached = rateLimitCache.get(phone)

  if (cached && now < cached.resetAt) {
    // Increment count in cache
    cached.count++
  } else {
    // Create new cache entry
    rateLimitCache.set(phone, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
  }
}

/**
 * Save failed SMS attempt to database
 */
async function saveFailedSMS(
  phone: string,
  message: string,
  error: string,
  attempts: number
): Promise<void> {
  try {
    // Check if there's an existing failed SMS for this phone/message
    const existing = await db.failedSMS.findFirst({
      where: {
        phone: phone,
        message: message,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existing) {
      // Update existing record
      await db.failedSMS.update({
        where: { id: existing.id },
        data: {
          attempts: attempts,
          error: error,
          lastAttemptAt: new Date(),
        },
      })
    } else {
      // Create new record
      await db.failedSMS.create({
        data: {
          phone: phone,
          message: message,
          error: error,
          attempts: attempts,
          lastAttemptAt: new Date(),
        },
      })
    }
  } catch (dbError) {
    // Log but don't throw - we don't want to block SMS sending
    console.error('Failed to save FailedSMS record:', dbError)
  }
}

/**
 * Calculate exponential backoff delay
 * Attempt 1: 1 second
 * Attempt 2: 2 seconds
 * Attempt 3: 4 seconds
 */
function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
}

/**
 * Send SMS with retry logic and rate limiting
 * This function is non-blocking and will never throw errors
 */
export async function sendSMSWithRetry(
  options: SendSMSWithRetryOptions
): Promise<SendSMSResult> {
  const { phone, message, submissionType } = options

  // Normalize phone number
  const phoneNormalized = normalizePhoneNumber(phone)
  
  if (!phoneNormalized.isValid) {
    return {
      success: false,
      error: phoneNormalized.error || 'Invalid phone number format',
    }
  }

  const normalizedPhone = phoneNormalized.normalized

  // Check rate limit (non-blocking)
  const rateLimitOk = await checkRateLimit(normalizedPhone)
  if (!rateLimitOk) {
    const errorMsg = `Rate limit exceeded: Max ${RATE_LIMIT_SMS_PER_HOUR} SMS per hour for this phone number`
    console.warn(`⚠️ Rate limited: ${normalizedPhone.substring(0, 7)}...`)
    
    // Save to FailedSMS for admin retry
    saveFailedSMS(normalizedPhone, message, errorMsg, 1).catch(() => {
      // Ignore save errors
    })

    return {
      success: false,
      error: errorMsg,
      retryScheduled: true, // Admin can retry later
    }
  }

  // Try sending with retry logic
  let lastError: string | undefined
  let attempt = 1

  while (attempt <= MAX_ATTEMPTS) {
    try {
      const result = await sendSMS({
        to: normalizedPhone,
        body: message,
      })

      if (result.success) {
        // Success! Log and return
        console.log(`✅ SMS sent to ${normalizedPhone.substring(0, 7)}... (attempt ${attempt}/${MAX_ATTEMPTS})`)
        
        // Record successful send for rate limiting
        recordSuccessfulSend(normalizedPhone)
        
        // If there was a previous failed record, we could mark it as resolved
        // For now, we'll just return success
        
        return {
          success: true,
          messageSid: result.messageSid,
        }
      } else {
        // Twilio returned an error
        lastError = result.error || 'Unknown Twilio error'
        console.warn(`⚠️ SMS attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastError}`)
      }
    } catch (error: any) {
      // Network or other error
      lastError = error.message || 'Unknown error'
      console.warn(`⚠️ SMS attempt ${attempt}/${MAX_ATTEMPTS} error: ${lastError}`)
    }

    // If not the last attempt, wait with exponential backoff
    if (attempt < MAX_ATTEMPTS) {
      const delay = getBackoffDelay(attempt)
      console.log(`⏳ Retrying SMS in ${delay}ms... (attempt ${attempt + 1}/${MAX_ATTEMPTS})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    attempt++
  }

  // All attempts failed - save to FailedSMS
  const finalError = lastError || 'All retry attempts exhausted'
  console.error(`❌ SMS failed after ${MAX_ATTEMPTS} attempts: ${finalError}`)
  
  // Save failure (non-blocking)
  saveFailedSMS(normalizedPhone, message, finalError, MAX_ATTEMPTS).catch(() => {
    // Ignore save errors
  })

  return {
    success: false,
    error: finalError,
    retryScheduled: true, // Admin can retry
  }
}

/**
 * Retry a failed SMS by ID
 * Used by admin endpoint
 */
export async function retryFailedSMS(failedSMSId: string): Promise<SendSMSResult> {
  try {
    const failedSMS = await db.failedSMS.findUnique({
      where: { id: failedSMSId },
    })

    if (!failedSMS) {
      return {
        success: false,
        error: 'Failed SMS record not found',
      }
    }

    // Check if already at max attempts
    if (failedSMS.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        error: `Already at max attempts (${MAX_ATTEMPTS}). Manual intervention required.`,
      }
    }

    // Try sending again
    const result = await sendSMSWithRetry({
      phone: failedSMS.phone,
      message: failedSMS.message,
    })

    // If successful, optionally delete the failed record
    if (result.success) {
      try {
        await db.failedSMS.delete({
          where: { id: failedSMSId },
        })
      } catch (deleteError) {
        // Log but don't fail - SMS was sent successfully
        console.warn('Failed to delete FailedSMS record after successful retry:', deleteError)
      }
    } else {
      // Update attempts count
      try {
        await db.failedSMS.update({
          where: { id: failedSMSId },
          data: {
            attempts: failedSMS.attempts + 1,
            error: result.error || failedSMS.error,
            lastAttemptAt: new Date(),
          },
        })
      } catch (updateError) {
        console.error('Failed to update FailedSMS record:', updateError)
      }
    }

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to retry SMS',
    }
  }
}
