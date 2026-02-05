-- Phase 2AJ — SLA Alerts & Escalations (store status on Booking)
-- Run after Prisma migrate or apply manually if using Supabase SQL.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_inquiries') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_status') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_status TEXT DEFAULT 'on_track';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_breaches') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_breaches JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_alerted_at') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_alerted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_escalated_at') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_escalated_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_acknowledged_at') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_acknowledged_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_inquiries' AND column_name = 'sla_acknowledged_by') THEN
      ALTER TABLE public.booking_inquiries ADD COLUMN sla_acknowledged_by TEXT;
    END IF;
  END IF;
END $$;
