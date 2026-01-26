/**
 * Phase 11G.2A: Parsing Contract (Single Source of Truth)
 * 
 * This keeps AI helpful but never dangerous.
 * All parsing functions must return this exact shape.
 */

export type ParsedFarmerIntake = {
  name?: string
  phone?: string
  parish?: string
  crops?: string[]
  quantity?: string
  frequency?: 'weekly' | 'biweekly' | 'monthly'
}
