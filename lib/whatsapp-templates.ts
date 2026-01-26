/**
 * Phase 3: Bornfidis WhatsApp Message Templates
 * Warm, human, Jamaican-friendly, professional
 * Uses WhatsApp formatting (bold with *)
 */

/**
 * WhatsApp sent when booking is approved (BOOKED status)
 */
export function bookingApprovedWA(name: string, date: string): string {
  return `🌿 *Bornfidis Booking Confirmed*

Hi ${name},
Your booking for *${date}* is confirmed.

We'll follow up shortly with next steps.
Blessings,
*Bornfidis Provisions*`
}

/**
 * WhatsApp sent when booking is declined
 */
export function bookingDeclinedWA(name: string): string {
  return `🌿 *Bornfidis Update*

Hi ${name},
Thank you for reaching out.
We're unable to support this request at this time.

We appreciate you and hope to connect another time.
– *Bornfidis*`
}

/**
 * WhatsApp sent when admin marks a timeline milestone complete
 */
export function timelineUpdateWA(name: string, step: string): string {
  return `🌿 *Bornfidis Event Update*

Hi ${name},
"${step}" has been completed for your event.

We're moving forward with care.
– *Bornfidis*`
}

/**
 * Phase 4: WhatsApp sent to farmer when assigned to a booking
 */
export function farmerAssignmentWA(
  farmerName: string,
  role: string | null,
  eventDate: string
): string {
  const roleText = role ? `\nRole: *${role}*` : ''
  return `🌾 *Bornfidis Coordination*

Greetings ${farmerName},
You've been assigned to support an upcoming Bornfidis event.${roleText}
Event Date: *${eventDate}*

We'll follow up with quantities shortly.
Respect & thanks,
*Bornfidis*`
}
