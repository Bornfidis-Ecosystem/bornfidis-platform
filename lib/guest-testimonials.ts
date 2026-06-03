/** Verified guest quotes — shared by homepage and book marketing. */

export type GuestTestimonial = {
  quote: string
  name: string
  detail: string
  initials: string
  imageAlt: string
}

export const GUEST_TESTIMONIAL_BEX: GuestTestimonial = {
  quote:
    'We just had the maple jerk chicken — perfect spice, perfect sweetness, so so so good. Craig said it was perfect, like super good! No changes from our end — sell it! (Save some for us this summer.)',
  name: 'Bex & Craig',
  detail: 'Private Tasting · Blue Duck Deli',
  initials: 'BC',
  imageAlt: 'Plated Bornfidis courses — refined presentation',
}

export const GUEST_TESTIMONIAL_FEVY: GuestTestimonial = {
  quote:
    'We asked for Italian with a twist. What we got was a four-day culinary journey that our guests are still talking about.',
  name: 'Fevy & Rian',
  detail: 'Wedding Celebration, Maine',
  initials: 'FR',
  imageAlt: 'Table atmosphere — private dining experience',
}

/** Featured on homepage — Bex first, Fevy second. */
export const FEATURED_GUEST_TESTIMONIALS: readonly GuestTestimonial[] = [
  GUEST_TESTIMONIAL_BEX,
  GUEST_TESTIMONIAL_FEVY,
]
