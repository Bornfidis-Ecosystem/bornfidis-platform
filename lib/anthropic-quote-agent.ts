import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { GenerateQuoteBody } from '@/lib/quote-agent'
import { roundUsd } from '@/lib/quote-builder'
import type { QuoteBuilderLine } from '@/lib/quote-builder'

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key?.trim()) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey: key })
}

function defaultQuoteModel(): string {
  return process.env.ANTHROPIC_QUOTE_MODEL?.trim() || 'claude-sonnet-4-20250514'
}

// ─── Zod — validates Claude JSON output ───────────────────────────────────

export const QuoteLineItemSchema = z.object({
  description: z.string(),
  category: z.enum(['chef_service', 'produce', 'equipment', 'travel', 'other']),
  quantity: z.number().positive(),
  unit: z.string(),
  unit_price_usd: z.number().nonnegative(),
  subtotal_usd: z.number().nonnegative(),
  notes: z.string().optional(),
})

export const AgentQuoteSchema = z.object({
  service_type: z.string(),
  line_items: z.array(QuoteLineItemSchema).min(1),
  subtotal_usd: z.number().nonnegative(),
  tax_usd: z.number().nonnegative(),
  discount_usd: z.number().nonnegative(),
  total_usd: z.number().nonnegative(),
  deposit_percentage: z.number().min(0).max(100).default(50),
  deposit_amount_usd: z.number().nonnegative(),
  payment_terms: z.string(),
  notes: z.string(),
  customer_notes: z.string(),
  expires_days: z.number().min(1).max(365).default(14),
  suggested_chef_ids: z.array(z.string()).optional(),
  suggested_farmer_ids: z.array(z.string()).optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  confidence_reason: z.string().optional(),
})

export type AgentQuote = z.infer<typeof AgentQuoteSchema>
export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>

// ─── Context types (input to the agent) ───────────────────────────────────

export interface EventInquiry {
  client_name: string
  client_email: string
  /** Required when creating a new `bookings` row (maps to `customer_phone`). */
  client_phone?: string
  event_type: string
  event_date: string
  guest_count: number
  location: string
  dietary_notes?: string
  budget_indication?: string
  additional_notes?: string
}

export interface AvailableChef {
  id: string
  name: string
  specialties: string[]
  day_rate_usd: number
  available: boolean
}

export interface AvailableFarmer {
  id: string
  name: string
  current_produce: string[]
  location: string
}

export interface PricingContext {
  base_per_guest_usd: number
  produce_per_guest_usd: number
  equipment_flat_usd: number
  travel_rate_per_mile_usd: number
  tax_rate_percent: number
}

export interface QuoteAgentContext {
  inquiry: EventInquiry
  available_chefs: AvailableChef[]
  available_farmers: AvailableFarmer[]
  pricing: PricingContext
}

// ─── System prompt ─────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are the Bornfidis quote agent. Bornfidis Provisions is a farm-to-table event and chef booking platform based in Port Antonio, Jamaica. Our ethos is "Farmers First" — we connect local farmers, award-winning chefs, and clients to create memorable food experiences.

Your job is to receive an event inquiry along with available chefs, farmers, and pricing data, then produce a detailed, accurate event quote.

RULES:
- Always respond with a single raw JSON object. No markdown, no explanation, no preamble.
- The JSON must match this exact structure (all fields required unless marked optional):
  {
    "service_type": string,
    "line_items": [{ "description", "category", "quantity", "unit", "unit_price_usd", "subtotal_usd", "notes"? }],
    "subtotal_usd": number,
    "tax_usd": number,
    "discount_usd": number,
    "total_usd": number,
    "deposit_percentage": number (default 50),
    "deposit_amount_usd": number,
    "payment_terms": string,
    "notes": string (internal admin notes),
    "customer_notes": string (warm, professional message to include in client email),
    "expires_days": number (default 14),
    "suggested_chef_ids": string[] (IDs from the available chefs list),
    "suggested_farmer_ids": string[] (IDs from the available farmers list),
    "confidence": "high" | "medium" | "low",
    "confidence_reason": string (explain if medium or low)
  }

PRICING LOGIC:
- Start from the provided pricing context — do not invent rates
- Chef service = chef day_rate_usd (use the most appropriate available chef)
- Produce = produce_per_guest_usd × guest_count
- Equipment = equipment_flat_usd (include if event requires prep equipment)
- Travel = travel_rate_per_mile_usd × estimated miles if location suggests travel
- Subtotal = sum of all line items
- Tax = subtotal × (tax_rate_percent / 100)
- Discount = 0 unless budget_indication suggests a negotiation is needed
- Total = subtotal + tax - discount
- Deposit = total × (deposit_percentage / 100)

TONE FOR customer_notes:
- Warm, Caribbean-rooted, professional
- Reference the specific event type and date
- Express genuine enthusiasm for the farm-to-table experience
- Keep it to 3–4 sentences max

CONFIDENCE:
- high = all details clear, chefs and farmers available, date confirmed
- medium = some ambiguity (guest count vague, date flexible, dietary needs complex)
- low = major unknowns (no date, very large event, unusual request outside our scope)`
}

function buildUserMessage(ctx: QuoteAgentContext): string {
  return `EVENT INQUIRY:
${JSON.stringify(ctx.inquiry, null, 2)}

AVAILABLE CHEFS:
${JSON.stringify(ctx.available_chefs, null, 2)}

AVAILABLE FARMERS:
${JSON.stringify(ctx.available_farmers, null, 2)}

PRICING CONTEXT:
${JSON.stringify(ctx.pricing, null, 2)}

Generate the quote JSON now.`
}

/** Calls Claude and returns a validated {@link AgentQuote}. */
export async function generateAgentQuote(ctx: QuoteAgentContext): Promise<AgentQuote> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: defaultQuoteModel(),
    max_tokens: 2048,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserMessage(ctx),
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }

  const raw = textBlock.text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Claude returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  const result = AgentQuoteSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Quote schema validation failed: ${JSON.stringify(result.error.flatten())}`)
  }

  return result.data
}

/** @deprecated Prefer the explicit name `generateAgentQuote`. */
export const generateQuote = generateAgentQuote

/**
 * Maps an {@link AgentQuote} into {@link GenerateQuoteBody} for `persistQuoteForBooking`.
 * Line totals are derived from each item's `subtotal_usd` and integer `quantity` for DB consistency.
 */
export function agentQuoteToGenerateBody(
  bookingId: string,
  agent: AgentQuote,
  options: { send_email?: boolean } = {},
): GenerateQuoteBody {
  const lines: QuoteBuilderLine[] = agent.line_items.map((li) => {
    const q = Math.max(1, Math.round(li.quantity))
    const unitFromSubtotal = q > 0 ? roundUsd(li.subtotal_usd / q) : roundUsd(li.unit_price_usd)
    const name =
      li.description.length > 200 ? `${li.description.slice(0, 197)}...` : li.description
    return {
      item_type: li.category,
      item_name: name,
      description: li.notes ?? null,
      quantity: q,
      unit_price_usd: roundUsd(li.unit_price_usd || unitFromSubtotal),
      category: li.category,
    }
  })

  return {
    booking_id: bookingId,
    service_type: agent.service_type,
    lines,
    tax_usd: agent.tax_usd,
    discount_usd: agent.discount_usd,
    deposit_percentage: agent.deposit_percentage,
    notes: agent.notes,
    customer_notes: agent.customer_notes,
    payment_terms: agent.payment_terms,
    expires_days: agent.expires_days,
    send_email: options.send_email ?? false,
  }
}
