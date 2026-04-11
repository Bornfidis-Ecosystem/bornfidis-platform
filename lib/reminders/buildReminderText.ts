export type ReminderType = 'deposit' | 'prep' | 'final_balance' | 'testimonial'

function formatReminderDate(eventDate: Date | string) {
  const date = new Date(eventDate)
  if (Number.isNaN(date.getTime())) return 'your event date'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export function buildReminderText({
  type,
  name,
  eventDate,
}: {
  type: ReminderType
  name: string
  eventDate: Date | string
}) {
  const date = formatReminderDate(eventDate)

  const base: Record<ReminderType, string> = {
    deposit: `Hi ${name},\n\nJust checking in regarding your upcoming Bornfidis experience on ${date}.\n\nTo secure your booking, your deposit is still pending. Let me know if you need the payment link again.\n\nLooking forward to serving you.`,
    prep: `Hi ${name},\n\nWe're preparing for your Bornfidis experience on ${date}.\n\nKindly confirm your final guest count, timing, and any dietary notes so we can ensure everything is perfect.\n\nThank you.`,
    final_balance: `Hi ${name},\n\nA quick reminder that the remaining balance for your booking on ${date} is still due.\n\nPlease let me know once completed or if you need any assistance.\n\nThank you.`,
    testimonial: `Hi ${name},\n\nThank you again for choosing Bornfidis. It was truly a pleasure serving you.\n\nIf you enjoyed the experience, we would greatly appreciate a short review or testimonial.\n\nBlessings and gratitude.`,
  }

  return {
    whatsapp: base[type],
    email: `Subject: Bornfidis Follow-Up\n\n${base[type]}`,
  }
}

