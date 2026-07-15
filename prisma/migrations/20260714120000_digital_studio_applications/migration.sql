-- Phase 3 — Digital Studio applications CRM
CREATE TABLE IF NOT EXISTS "public"."digital_studio_applications" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "business_type_other" TEXT,
    "biggest_gap" TEXT NOT NULL,
    "website_status" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'digital-studio-apply',
    "assigned_to" TEXT,
    "last_contacted_at" TIMESTAMP(3),
    "next_action_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "digital_studio_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "digital_studio_applications_status_idx" ON "public"."digital_studio_applications"("status");
CREATE INDEX IF NOT EXISTS "digital_studio_applications_created_at_idx" ON "public"."digital_studio_applications"("created_at");
CREATE INDEX IF NOT EXISTS "digital_studio_applications_contact_email_idx" ON "public"."digital_studio_applications"("contact_email");
