/**
 * Phase 2.5: Bornfidis SMS Message Templates
 * Short, respectful, human messages for key booking moments
 */

/**
 * SMS sent when booking is approved (BOOKED status)
 */
export function bookingApprovedSMS(name: string, date: string): string {
  return `Hi ${name}, your Bornfidis booking for ${date} is confirmed 🌿
We'll follow up shortly with next steps.
– Bornfidis`
}

/**
 * SMS sent when booking is declined
 */
export function bookingDeclinedSMS(name: string): string {
  return `Hi ${name}, thank you for reaching out to Bornfidis.
We're unable to support this request at this time, but we appreciate your interest.
– Bornfidis`
}

/**
 * SMS sent when admin marks a timeline milestone complete (optional)
 */
export function timelineStepCompletedSMS(name: string, step: string): string {
  return `Hi ${name}, update from Bornfidis 🌱
"${step}" has been completed for your upcoming event.
– Bornfidis`
}
