/**
 * Trust & authority content — verified hospitality record + approved guest feedback.
 */
import { FEATURED_GUEST_TESTIMONIALS, type GuestTestimonial } from '@/lib/guest-testimonials'

export type CredibilityStat = {
  value: string
  valueSuffix?: string
  label: string
  detail: string
}

export const HOSPITALITY_STATS: CredibilityStat[] = [
  {
    value: '13',
    valueSuffix: 'yrs',
    label: 'Royal Caribbean',
    detail: 'Luxury hospitality — galley through dining room, 2006–2020',
  },
  {
    value: '97',
    valueSuffix: '.80',
    label: 'Guest satisfaction',
    detail: 'Average score — Azamara luxury tier, documented appraisals',
  },
  {
    value: 'Host-led',
    label: 'Private dining experiences',
    detail: 'Delivered in your home, chalet, or retreat — serving Vermont now; Jamaica and select travel by advance request',
  },
]

export type HospitalityMilestone = {
  year: string
  title: string
  note: string
}

export const HOSPITALITY_MILESTONES: HospitalityMilestone[] = [
  {
    year: '2006',
    title: 'Culinary Trainee',
    note: 'Royal Caribbean — Fort Lauderdale. The beginning of thirteen years at sea.',
  },
  {
    year: '2011',
    title: 'Chef de Partie-1',
    note: 'Kitchen management on Freedom of the Seas — galley leadership at volume.',
  },
  {
    year: '2016',
    title: 'Waiter Lead · Lv.5',
    note: 'Highest front-of-house classification. 10-Year Service Award.',
  },
  {
    year: '2020',
    title: 'Bornfidis founded',
    note: 'Private dining & provisions — Jamaica × Vermont, one table at a time.',
  },
]

export const RC_APPRAISAL_QUOTE = {
  quote:
    'He always delivers the WOW to his guests and co-workers.',
  attribution: 'Royal Caribbean Shipboard Appraisal',
  context: 'Overall rating: Highly Effective · Guest satisfaction 97.80',
} as const

export const FOUNDER_TABLE_QUOTE = {
  quote:
    'The best private dining dish is not the one that surprises the guest. It is the one that makes them stop talking for a moment.',
  attribution: 'Brian Maylor',
  context: 'Founder & Culinary Director · Bornfidis',
} as const

export const HOSPITALITY_TESTIMONIALS: readonly GuestTestimonial[] = FEATURED_GUEST_TESTIMONIALS

export const HOSPITALITY_SHIPS = [
  'Jewel of the Seas',
  'Navigator of the Seas',
  'Freedom of the Seas',
  'Harmony of the Seas',
  'Azamara',
] as const
