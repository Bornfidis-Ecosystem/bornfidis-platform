import { formatCurrency } from '@/lib/formatCurrency'
import {
  MENU_TEMPLATES,
  MenuTemplateId,
  PackageType,
  ServiceStyle,
  SERVICE_STYLES,
} from './menuTemplates'
import { dollarsToCents } from '@/lib/money'

export interface QuoteFormState {
  clientName: string
  eventType: string
  eventDate: string // YYYY-MM-DD
  location: string
  guestCount: number

  packageType: PackageType
  serviceStyle: ServiceStyle
  menuTemplate: MenuTemplateId
  customNotes: string

  basePrice: number
  travelFee: number
  staffingFee: number
  addOns: string
  depositPercent: number
}

export interface AddOnLine {
  label: string
  price: number
}

export interface QuotePreview {
  clientName: string
  eventType: string
  eventDate: string
  location: string
  guestCount: number
  packageType: PackageType
  serviceStyle: ServiceStyle
  customNotes: string

  menuTemplateName: string
  menuItems: string[]

  pricing: {
    basePrice: number
    travelFee: number
    staffingFee: number
    addOnsTotal: number
    totalEstimate: number
    depositPercent: number
    depositAmount: number
    addOnLines: AddOnLine[]
  }

  whatsappText: string
  emailText: string
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatUSD(dollars: number) {
  const cents = dollarsToCents(dollars)
  return formatCurrency(cents)
}

export function parseAddOns(input: string): AddOnLine[] {
  // Expected formats (1 per line):
  // - "Extra Course - 120"
  // - "Extra Course: 120"
  // - "Extra Course | 120"
  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const parsed: AddOnLine[] = []

  for (const line of lines) {
    const match = line.match(/^(.*?)(?:\||:|-)\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*$/)

    if (match) {
      const label = match[1].trim()
      const price = parseFloat(match[2])
      if (label && isFiniteNumber(price)) {
        parsed.push({ label, price })
        continue
      }
    }

    // If we can't parse a price, keep a label with $0 so it still appears in the quote.
    parsed.push({ label: line, price: 0 })
  }

  return parsed
}

export function validateQuoteForm(form: QuoteFormState): string[] {
  const errors: string[] = []

  if (!form.clientName.trim()) errors.push('clientName is required')
  if (!form.eventType.trim()) errors.push('eventType is required')
  if (!form.eventDate.trim()) errors.push('eventDate is required')
  if (!form.location.trim()) errors.push('location is required')
  if (!Number.isInteger(form.guestCount) || form.guestCount <= 0) errors.push('guestCount must be a positive integer')

  if (!MENU_TEMPLATES.some((t) => t.id === form.menuTemplate)) errors.push('menuTemplate is invalid')
  if (!SERVICE_STYLES.includes(form.serviceStyle)) errors.push('serviceStyle is invalid')
  if (!['Intimate Dinner', 'Gathering Experience', 'Retreat/Celebration'].includes(form.packageType)) {
    errors.push('packageType is invalid')
  }

  for (const [key, value] of [
    ['basePrice', form.basePrice],
    ['travelFee', form.travelFee],
    ['staffingFee', form.staffingFee],
    ['depositPercent', form.depositPercent],
  ] as const) {
    if (!isFiniteNumber(value) || value < 0) errors.push(`${key} must be 0 or greater`)
  }

  if (form.depositPercent > 100) errors.push('depositPercent must be 100 or less')

  return errors
}

function formatList(items: string[]) {
  return items.map((i) => `- ${i}`).join('\n')
}

function getMenuTemplate(templateId: MenuTemplateId) {
  return MENU_TEMPLATES.find((t) => t.id === templateId) || MENU_TEMPLATES[0]
}

export function buildQuotePreview(form: QuoteFormState): QuotePreview {
  const template = getMenuTemplate(form.menuTemplate)
  const addOnLines = parseAddOns(form.addOns)
  const addOnsTotal = addOnLines.reduce((sum, l) => sum + l.price, 0)

  const basePrice = Math.max(0, form.basePrice)
  const travelFee = Math.max(0, form.travelFee)
  const staffingFee = Math.max(0, form.staffingFee)

  const totalEstimate = basePrice + travelFee + staffingFee + addOnsTotal

  const depositPercent = clampNumber(form.depositPercent, 0, 100)
  const depositAmount = (totalEstimate * depositPercent) / 100

  const pricing = {
    basePrice,
    travelFee,
    staffingFee,
    addOnsTotal,
    totalEstimate,
    depositPercent,
    depositAmount,
    addOnLines,
  }

  const addOnsText = addOnLines.length
    ? addOnLines.map((l) => `- ${l.label}: ${formatUSD(l.price)}`).join('\n')
    : '- None'

  const customNotesBlock = form.customNotes.trim().length
    ? `\nCustom notes:\n${form.customNotes.trim()}`
    : ''

  const whatsappText = [
    `Hi Brian,`,
    ``,
    `Here's the quote for ${form.clientName}.`,
    `Event: ${form.eventType}`,
    `Date: ${form.eventDate}`,
    `Location: ${form.location}`,
    `Guests: ${form.guestCount}`,
    ``,
    `Package: ${form.packageType}`,
    `Service style: ${form.serviceStyle}`,
    ``,
    `Menu template: ${template.name}`,
    ...template.menuItems.map((i) => `• ${i}`),
    customNotesBlock ? customNotesBlock : '',
    ``,
    `Pricing (USD):`,
    `Base: ${formatUSD(basePrice)}`,
    `Travel fee: ${formatUSD(travelFee)}`,
    `Staffing: ${formatUSD(staffingFee)}`,
    `Add-ons:`,
    addOnsText,
    ``,
    `Total estimate: ${formatUSD(totalEstimate)}`,
    `Deposit (${depositPercent}%): ${formatUSD(depositAmount)}`,
    ``,
    `Next step: Reply "CONFIRM" to secure your date.`,
  ]
    .filter(Boolean)
    .join('\n')

  const emailText = [
    `Subject: Bornfidis Provisions — Quote for ${form.clientName}`,
    ``,
    `Hello ${form.clientName},`,
    ``,
    `Thank you for reaching out to Bornfidis. Below is your client-ready quote and menu summary.`,
    ``,
    `Event: ${form.eventType}`,
    `Date: ${form.eventDate}`,
    `Location: ${form.location}`,
    `Guests: ${form.guestCount}`,
    ``,
    `Package: ${form.packageType}`,
    `Service style: ${form.serviceStyle}`,
    `Menu template: ${template.name}`,
    ``,
    `Menu:`,
    formatList(template.menuItems),
    ``,
    form.customNotes.trim() ? `Custom notes:\n${form.customNotes.trim()}\n` : '',
    `Pricing (USD):`,
    `- Base: ${formatUSD(basePrice)}`,
    `- Travel fee: ${formatUSD(travelFee)}`,
    `- Staffing: ${formatUSD(staffingFee)}`,
    `- Add-ons: ${addOnsTotal > 0 ? formatUSD(addOnsTotal) : formatUSD(0)}`,
    addOnLines.length
      ? addOnLines.map((l) => `  • ${l.label}: ${formatUSD(l.price)}`).join('\n')
      : '',
    ``,
    `Total estimate: ${formatUSD(totalEstimate)}`,
    `Deposit (${depositPercent}%): ${formatUSD(depositAmount)}`,
    ``,
    `To reserve your date, please confirm and arrange the deposit.`,
    `If you have any dietary needs or adjustments, reply with your preferences and we'll refine the final menu.`,
    ``,
    `Warmly,`,
    `Brian Maylor`,
    `Bornfidis Provisions`,
  ]
    .filter((p) => p !== undefined)
    .join('\n')

  return {
    clientName: form.clientName,
    eventType: form.eventType,
    eventDate: form.eventDate,
    location: form.location,
    guestCount: form.guestCount,
    packageType: form.packageType,
    serviceStyle: form.serviceStyle,
    customNotes: form.customNotes,
    menuTemplateName: template.name,
    menuItems: template.menuItems,
    pricing,
    whatsappText,
    emailText,
  }
}

export const DEFAULT_QUOTE_FORM_STATE: QuoteFormState = {
  clientName: '',
  eventType: '',
  eventDate: '',
  location: '',
  guestCount: 8,

  packageType: 'Intimate Dinner',
  serviceStyle: 'Plated',
  menuTemplate: 'intimate_caribbean',
  customNotes: '',

  basePrice: 0,
  travelFee: 0,
  staffingFee: 0,
  addOns: '',
  depositPercent: 40,
}

