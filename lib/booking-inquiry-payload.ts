import { z } from 'zod'
import { mergeBookingNotesFields } from '@/lib/validation'

const futureEventDate = z.string().refine(
  (date) => {
    const selected = new Date(date)
    if (Number.isNaN(selected.getTime())) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selected >= today
  },
  { message: 'Event date must be today or in the future' }
)

/**
 * Public + admin booking form payload (new private-dining fields + legacy `bookingSchema` names).
 */
export const bookingInquiryPayloadSchema = z
  .object({
    fullName: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number is required'),
    eventDate: futureEventDate,
    eventTime: z.string().optional(),
    location: z.string().min(3, 'Location is required'),
    guestCount: z.coerce.number().int().optional(),
    guests: z.coerce.number().int().optional(),
    occasion: z.string().optional(),
    budgetTier: z.string().optional(),
    budgetRange: z.string().optional(),
    diningStyle: z.string().optional(),
    experienceType: z.string().optional(),
    menuPreference: z.string().optional(),
    allergies: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    kitchenNotes: z.string().optional(),
    message: z.string().optional(),
    notes: z.string().optional(),
    upsellInterests: z.array(z.string()).max(32).optional(),
    website_url: z.string().max(0, 'Spam detected').optional(),
  })
  .superRefine((val, ctx) => {
    const displayName = (val.fullName ?? val.name ?? '').trim()
    if (displayName.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Name must be at least 2 characters' })
    }
    const g = val.guestCount ?? val.guests
    if (g == null || g < 1) {
      ctx.addIssue({ code: 'custom', path: ['guestCount'], message: 'Guest count is required' })
    }
    if (g != null && g > 500) {
      ctx.addIssue({ code: 'custom', path: ['guestCount'], message: 'Guest count is too high' })
    }
  })
  .transform((val) => {
    const guests = val.guestCount ?? val.guests!
    return {
      name: (val.fullName ?? val.name ?? '').trim(),
      email: val.email || null,
      phone: val.phone,
      eventDate: val.eventDate,
      eventTime: val.eventTime ?? null,
      location: val.location,
      guests,
      eventType: val.occasion || val.experienceType || null,
      budgetRange: val.budgetTier || val.budgetRange || null,
      diningStyle: val.diningStyle || null,
      dietaryRestrictions: val.allergies || val.dietaryRestrictions || null,
      upsellInterests: val.upsellInterests ?? [],
      mergedNotes: mergePrivateDiningNotes({
        notes: val.notes,
        kitchenNotes: val.kitchenNotes,
        message: val.message,
        experienceType: val.experienceType,
        menuPreference: val.menuPreference,
        occasion: val.occasion,
      }),
    }
  })

export type NormalizedBookingInquiryPayload = z.infer<typeof bookingInquiryPayloadSchema>

function mergePrivateDiningNotes(data: {
  notes?: string | null
  kitchenNotes?: string | null
  message?: string | null
  experienceType?: string | null
  menuPreference?: string | null
  occasion?: string | null
}): string | null {
  const base = mergeBookingNotesFields({
    notes: data.notes,
    experienceType: (data.occasion || data.experienceType || '').trim() || null,
    menuPreference: data.menuPreference,
  })
  const parts: string[] = []
  if (data.kitchenNotes?.trim()) {
    parts.push(`Kitchen / service notes: ${data.kitchenNotes.trim()}`)
  }
  if (data.message?.trim()) {
    parts.push(`Message: ${data.message.trim()}`)
  }
  const extra = parts.length ? parts.join('\n\n') : null
  if (base && extra) return `${base}\n\n${extra}`
  return base || extra
}
