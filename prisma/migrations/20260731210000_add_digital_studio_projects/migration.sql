-- Digital Studio project delivery (Prisma models DigitalStudioProject and
-- DigitalStudioProjectTask were added to schema.prisma without a migration,
-- so the tables were never created).

CREATE TABLE IF NOT EXISTS "public"."digital_studio_projects" (
    "id" TEXT NOT NULL,
    "application_id" TEXT,
    "project_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "phase" TEXT NOT NULL DEFAULT 'discovery',
    "owner_id" TEXT,
    "start_date" DATE,
    "target_launch_date" DATE,
    "actual_launch_date" DATE,
    "total_amount_cents" INTEGER,
    "deposit_amount_cents" INTEGER,
    "balance_amount_cents" INTEGER,
    "deposit_paid_at" TIMESTAMP(3),
    "balance_paid_at" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "portal_token" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_studio_projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "digital_studio_projects_project_number_key" ON "public"."digital_studio_projects"("project_number");
CREATE UNIQUE INDEX IF NOT EXISTS "digital_studio_projects_portal_token_key" ON "public"."digital_studio_projects"("portal_token");
CREATE INDEX IF NOT EXISTS "digital_studio_projects_status_idx" ON "public"."digital_studio_projects"("status");
CREATE INDEX IF NOT EXISTS "digital_studio_projects_application_id_idx" ON "public"."digital_studio_projects"("application_id");
CREATE INDEX IF NOT EXISTS "digital_studio_projects_client_email_idx" ON "public"."digital_studio_projects"("client_email");

CREATE TABLE IF NOT EXISTS "public"."digital_studio_project_tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "task_type" TEXT,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "assigned_to" TEXT,
    "due_at" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'system',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_studio_project_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "digital_studio_project_tasks_project_id_status_idx" ON "public"."digital_studio_project_tasks"("project_id", "status");
CREATE INDEX IF NOT EXISTS "digital_studio_project_tasks_due_at_idx" ON "public"."digital_studio_project_tasks"("due_at");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'digital_studio_projects_application_id_fkey'
    ) THEN
        ALTER TABLE "public"."digital_studio_projects"
            ADD CONSTRAINT "digital_studio_projects_application_id_fkey"
            FOREIGN KEY ("application_id") REFERENCES "public"."digital_studio_applications"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'digital_studio_project_tasks_project_id_fkey'
    ) THEN
        ALTER TABLE "public"."digital_studio_project_tasks"
            ADD CONSTRAINT "digital_studio_project_tasks_project_id_fkey"
            FOREIGN KEY ("project_id") REFERENCES "public"."digital_studio_projects"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
