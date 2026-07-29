-- Local admin invoice ledger for Stripe-created invoices
CREATE TABLE IF NOT EXISTS "public"."admin_invoices" (
    "id" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" TEXT,
    "client_id" TEXT,
    "booking_id" TEXT,
    "project_id" TEXT,
    "stripe_account_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "stripe_invoice_id" TEXT NOT NULL,
    "invoice_number" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "subtotal_cents" INTEGER NOT NULL,
    "deposit_applied_cents" INTEGER NOT NULL DEFAULT 0,
    "amount_due_cents" INTEGER NOT NULL,
    "due_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "hosted_invoice_url" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "admin_invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_invoices_stripe_invoice_id_key" ON "public"."admin_invoices"("stripe_invoice_id");
CREATE INDEX IF NOT EXISTS "admin_invoices_booking_id_idx" ON "public"."admin_invoices"("booking_id");
CREATE INDEX IF NOT EXISTS "admin_invoices_project_id_idx" ON "public"."admin_invoices"("project_id");
CREATE INDEX IF NOT EXISTS "admin_invoices_source_type_source_id_idx" ON "public"."admin_invoices"("source_type", "source_id");
CREATE INDEX IF NOT EXISTS "admin_invoices_status_idx" ON "public"."admin_invoices"("status");
CREATE INDEX IF NOT EXISTS "admin_invoices_created_at_idx" ON "public"."admin_invoices"("created_at");
