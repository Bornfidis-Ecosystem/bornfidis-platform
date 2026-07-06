/**
 * /partners — Work with Bornfidis (investors, operators, B2B consulting).
 */
import { PHASE1_CTA } from '@/lib/phase1-marketing'

export const PARTNERS_HERO = {
  eyebrow: 'Work with Bornfidis',
  title: 'We build flavor systems and signature dining experiences.',
  body:
    'Bornfidis partners with hospitality operators, brands, and investors to design memorable guest experiences — from menu architecture to operator playbooks rooted in thirteen years of luxury-ship training.',
  cta: PHASE1_CTA.contactBornfidis,
  contactPresetHref: '/contact?service=partners',
} as const

export const PARTNERS_OFFERS = [
  {
    title: 'Experience Design',
    description:
      'Signature dining concepts, guest journey mapping, and SOP systems that turn one table into a repeatable brand moment.',
  },
  {
    title: 'Flavor & Menu Consulting',
    description:
      'Caribbean-Vermont flavor architecture, pantry product development, and menu engineering for operators who want distinction without gimmicks.',
  },
  {
    title: 'Operator Partnership',
    description:
      'Training, staffing models, and quality systems for teams building premium hospitality — including partner-led markets like Jamaica.',
  },
] as const
