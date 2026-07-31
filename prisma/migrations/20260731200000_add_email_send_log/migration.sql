-- Email send audit log (Prisma model EmailSendLog already in schema; table was never migrated)
CREATE TABLE IF NOT EXISTS "public"."email_send_log" (
    "id" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'provisions',
    "template_type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "booking_id" TEXT,
    "project_id" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error_message" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "actor_name" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_send_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_send_log_booking_id_idx" ON "public"."email_send_log"("booking_id");
CREATE INDEX IF NOT EXISTS "email_send_log_project_id_idx" ON "public"."email_send_log"("project_id");
CREATE INDEX IF NOT EXISTS "email_send_log_status_idx" ON "public"."email_send_log"("status");
CREATE INDEX IF NOT EXISTS "email_send_log_template_type_idx" ON "public"."email_send_log"("template_type");
CREATE INDEX IF NOT EXISTS "email_send_log_sent_at_idx" ON "public"."email_send_log"("sent_at");
