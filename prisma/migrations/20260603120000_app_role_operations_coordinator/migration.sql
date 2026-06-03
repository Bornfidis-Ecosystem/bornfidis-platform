-- Phase 1.1 — Operations Coordinator platform role (hospitality ops, no financials)

ALTER TYPE "public"."AppRole" ADD VALUE IF NOT EXISTS 'operations_coordinator';
