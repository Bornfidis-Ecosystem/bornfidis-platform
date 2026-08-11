import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { db } from '@/lib/db'
import { getStripeClient, getWebhookSecret } from '@/lib/stripe'
import { writeStripeWebhookLog } from '@/lib/stripe-webhook-log'
import { syncAdminInvoiceRecord } from '@/lib/admin-invoices'
import {
  createProjectFromApplication,
  updateProjectStatus,
} from '@/lib/digital-studio-projects'
import { logActivity, logWorkflowTransition } from '@/lib/activity-log'
import {
  getAcademyProductBySlugForCheckout,
  getAcademyProductBySlugPublic,
} from '@/lib/academy-products-public'
import { ACADEMY_UPSELL_SUGGESTION } from '@/lib/academy-products'
import { sendAcademyPurchaseConfirmationEmail } from '@/lib/email'

/**
 * Digital Studio Stripe webhook.
 * POST /api/stripe/digital-studio/webhook
 *
 * Validates against STRIPE_DIGITAL_STUDIO_WEBHOOK_SECRET.
 * Handles DS project deposit checkout when metadata.division === 'digital-studio'.
 */
export async function POST(request: NextRequest) {
  let stripe: Stripe
  let webhookSecret: string
  try {
    stripe = getStripeClient('digital-studio')
    webhookSecret = getWebhookSecret('digital-studio')
  } catch (err) {
    console.error('[digital-studio webhook]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Stripe not configured for digital-studio' },
      { status: 500 },
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Digital Studio webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type.startsWith('invoice.')) {
    const invoice = event.data.object as Stripe.Invoice
    const alreadyProcessed = await db.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    })
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const statusMap: Record<string, 'open' | 'sent' | 'paid' | 'void' | 'overdue' | 'payment_failed'> = {
      'invoice.finalized': 'open',
      'invoice.sent': 'sent',
      'invoice.paid': 'paid',
      'invoice.payment_succeeded': 'paid',
      'invoice.voided': 'void',
      'invoice.marked_uncollectible': 'void',
      'invoice.overdue': 'overdue',
      'invoice.payment_failed': 'payment_failed',
    }
    const nextStatus = statusMap[event.type]
    if (nextStatus) {
      await syncAdminInvoiceRecord({
        stripeInvoiceId: invoice.id,
        division: 'digital-studio',
        actorName: 'Stripe webhook',
        status: nextStatus,
        sentAt: event.type === 'invoice.sent' ? new Date() : undefined,
        paidAt:
          event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded'
            ? new Date()
            : undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoiceNumber: invoice.number,
      }).catch((error) => console.error('digital studio invoice sync failed:', error))
    }
    await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
    return NextResponse.json({ received: true })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const alreadyProcessed = await db.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    })
    if (alreadyProcessed) {
      return NextResponse.json({ received: true })
    }

    const meta = session.metadata || {}
    const division = (meta.division || '').toLowerCase()
    const paymentType = (meta.payment_type || meta.paymentType || '').toLowerCase()
    const applicationId = meta.application_id || meta.applicationId || null
    const projectId = meta.project_id || meta.projectId || null
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? null

    try {
      if (division && division !== 'digital-studio') {
        await writeStripeWebhookLog({
          eventType: event.type,
          stripeEventId: event.id,
          stripeObjectId: session.id,
          paymentIntentId,
          amountCents: session.amount_total ?? null,
          customerEmail,
          processingStatus: 'unmatched',
          errorMessage: `Event division="${division}" is not digital-studio`,
          paymentType,
        })
        await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
        return NextResponse.json({ received: true, ignored: true })
      }

      if (paymentType === 'deposit' || paymentType === 'ds_deposit') {
        if (projectId) {
          await db.digitalStudioProject.update({
            where: { id: projectId },
            data: {
              depositPaidAt: new Date(),
              status: 'active',
            },
          })
          await updateProjectStatus(projectId, 'active', 'Stripe webhook')
          await logWorkflowTransition({
            division: 'DIGITAL_STUDIO',
            entityType: 'digital_studio_project',
            entityId: projectId,
            action: 'deposit_received',
            title: 'Digital Studio deposit received',
            newValue: String(session.amount_total ?? ''),
            actorName: 'Stripe webhook',
          })
        } else if (applicationId) {
          const result = await createProjectFromApplication(applicationId, {
            depositAmountCents: session.amount_total ?? undefined,
            actorName: 'Stripe webhook',
          })
          if (result.success && result.project) {
            await db.digitalStudioProject.update({
              where: { id: result.project.id },
              data: { depositPaidAt: new Date(), status: 'active' },
            })
          }
        }

        await writeStripeWebhookLog({
          eventType: event.type,
          stripeEventId: event.id,
          stripeObjectId: session.id,
          paymentIntentId,
          amountCents: session.amount_total ?? null,
          customerEmail,
          processingStatus: 'matched',
          paymentType: paymentType || 'ds_deposit',
        })
      } else if (paymentType === 'academy') {
        // Academy product line (rides on the Digital Studio account).
        const authUserId =
          meta.auth_user_id || meta.authUserId || session.client_reference_id || null
        const productSlug = meta.product_slug || meta.productSlug || null

        // Never fulfill an unattributed purchase.
        if (!authUserId || !productSlug) {
          await writeStripeWebhookLog({
            eventType: event.type,
            stripeEventId: event.id,
            stripeObjectId: session.id,
            paymentIntentId,
            amountCents: session.amount_total ?? null,
            customerEmail,
            processingStatus: 'unmatched',
            errorMessage: `Academy session missing ${!authUserId ? 'auth_user_id' : 'product_slug'}`,
            paymentType: 'academy',
          })
          await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
          return NextResponse.json({ received: true, ignored: true })
        }

        // Only fulfill fully-paid sessions (guards async/unpaid methods).
        if (session.payment_status && session.payment_status !== 'paid') {
          await writeStripeWebhookLog({
            eventType: event.type,
            stripeEventId: event.id,
            stripeObjectId: session.id,
            paymentIntentId,
            amountCents: session.amount_total ?? null,
            customerEmail,
            processingStatus: 'unmatched',
            errorMessage: `Academy session not paid (payment_status=${session.payment_status})`,
            paymentType: 'academy',
          })
          await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
          return NextResponse.json({ received: true, pending: true })
        }

        // Verify the product server-side; do not trust metadata alone.
        // Use checkout resolver so test purchases can fulfill while the product
        // remains inactive on the public Academy grid.
        const product = await getAcademyProductBySlugForCheckout(productSlug)
        if (!product) {
          await writeStripeWebhookLog({
            eventType: event.type,
            stripeEventId: event.id,
            stripeObjectId: session.id,
            paymentIntentId,
            amountCents: session.amount_total ?? null,
            customerEmail,
            processingStatus: 'unmatched',
            errorMessage: `Academy product not found for slug="${productSlug}"`,
            paymentType: 'academy',
          })
          await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
          return NextResponse.json({ received: true, ignored: true })
        }

        const paidAmountCents = session.amount_total ?? product.priceCents
        if (
          typeof session.amount_total === 'number' &&
          session.amount_total !== product.priceCents
        ) {
          // Not a hard failure (record the amount actually paid), but worth flagging.
          console.warn(
            `[digital-studio webhook] academy amount mismatch for ${product.slug}: paid=${session.amount_total} expected=${product.priceCents}`,
          )
        }

        // Fulfillment: creating the AcademyPurchase row IS the entitlement — the
        // library and secure download route both gate on it. Unique stripeSessionId
        // makes this idempotent for redelivered / duplicate-session events.
        try {
          await db.academyPurchase.create({
            data: {
              authUserId,
              productSlug: product.slug,
              productTitle: product.title,
              productPrice: paidAmountCents,
              stripeSessionId: session.id,
              purchasedAt: new Date(),
            },
          })
        } catch (createErr) {
          const code = (createErr as { code?: string })?.code
          if (code === 'P2002') {
            // Already fulfilled for this checkout session — idempotent no-op.
            await writeStripeWebhookLog({
              eventType: event.type,
              stripeEventId: event.id,
              stripeObjectId: session.id,
              paymentIntentId,
              amountCents: session.amount_total ?? null,
              customerEmail,
              processingStatus: 'matched',
              errorMessage: 'Academy purchase already recorded for this session',
              paymentType: 'academy',
            })
            await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
            return NextResponse.json({ received: true, duplicate: true })
          }
          throw createErr
        }

        logActivity({
          type: 'ACADEMY_PURCHASE',
          title: 'Course purchased',
          description: product.title,
          division: 'ACADEMY',
          metadata: { productSlug: product.slug, stripeSessionId: session.id },
        }).catch(() => {})

        // Confirmation email — a send failure must NOT roll back paid fulfillment
        // or cause Stripe to retry (which would risk duplicate side effects).
        if (customerEmail) {
          try {
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL ||
              process.env.NEXT_PUBLIC_SITE_URL ||
              (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
            const suggestedSlug = ACADEMY_UPSELL_SUGGESTION[product.slug] ?? 'llc-starter-kit'
            const suggested = await getAcademyProductBySlugPublic(suggestedSlug)
            await sendAcademyPurchaseConfirmationEmail(customerEmail, {
              productTitle: product.title,
              amountPaidCents: paidAmountCents,
              libraryUrl: `${baseUrl}/dashboard/library`,
              suggestedProduct: suggested
                ? {
                    title: suggested.title,
                    slug: suggested.slug,
                    priceDisplay: suggested.priceDisplay,
                    academyUrl: `${baseUrl}/academy/${suggested.slug}`,
                  }
                : undefined,
            })
          } catch (emailErr) {
            console.error(
              '[digital-studio webhook] academy confirmation email failed:',
              emailErr instanceof Error ? emailErr.message : emailErr,
            )
          }
        }

        await writeStripeWebhookLog({
          eventType: event.type,
          stripeEventId: event.id,
          stripeObjectId: session.id,
          paymentIntentId,
          amountCents: session.amount_total ?? null,
          customerEmail,
          processingStatus: 'matched',
          paymentType: 'academy',
        })
      } else {
        await writeStripeWebhookLog({
          eventType: event.type,
          stripeEventId: event.id,
          stripeObjectId: session.id,
          paymentIntentId,
          amountCents: session.amount_total ?? null,
          customerEmail,
          processingStatus: 'unmatched',
          errorMessage: `Unhandled DS payment_type="${paymentType}"`,
          paymentType,
        })
      }

      await db.stripeWebhookEvent.create({ data: { id: event.id } }).catch(() => {})
    } catch (err) {
      console.error('[digital-studio webhook] processing error:', err)
      await writeStripeWebhookLog({
        eventType: event.type,
        stripeEventId: event.id,
        stripeObjectId: session.id,
        paymentIntentId,
        amountCents: session.amount_total ?? null,
        customerEmail,
        processingStatus: 'error',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        paymentType,
      }).catch(() => {})
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
