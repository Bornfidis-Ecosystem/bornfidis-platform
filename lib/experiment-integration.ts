/**
 * Phase 2AX — Experiment integration points (stubs)
 *
 * Use getActiveExperimentConfigForEntity(category, entityId) to get variant config, then apply:
 *
 * - pricing: category 'pricing', entityId = bookingId. Config may include { multiplierOverride?, travelFeeCentsOverride? }.
 * - messaging: category 'messaging', entityId = userId or bookingId. Config may include { emailTemplateId?, smsCopyKey? }.
 * - ops: category 'ops', entityId = bookingId. Config may include { assignmentDelayMinutes?, reminderTiming? }.
 * - incentives: category 'incentives', entityId = bookingId. Config may include { bonusPctOverride?, tierMultiplierOverride? }.
 *
 * After applying a variant and observing outcome, call recordOutcome(experimentId, entityId, variant, metric, value).
 * Primary metric: conversion (e.g. 0|1 or rate), margin (%), SLA (e.g. 0|1 or %). Secondary: complaints, cancellations.
 */

import {
  getActiveExperimentConfigForEntity,
  recordOutcome,
  getVariantForEntity,
} from '@/lib/experiments'

export { getActiveExperimentConfigForEntity, recordOutcome, getVariantForEntity }
