-- Service checklist (manual ops flags on booking_inquiries)
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "menu_confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "dietary_confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "guest_count_confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "arrival_time_confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "location_confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "ingredients_sourced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."booking_inquiries" ADD COLUMN IF NOT EXISTS "equipment_packed" BOOLEAN NOT NULL DEFAULT false;
