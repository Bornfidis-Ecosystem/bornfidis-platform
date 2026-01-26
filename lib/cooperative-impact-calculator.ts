/**
 * Phase 7A: Cooperative Impact Score Calculator
 * Calculates impact scores for cooperative members based on their contributions
 */

import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 7A: Calculate impact score for a cooperative member
 * 
 * Impact score is calculated based on:
 * - Farmer contributions (ingredients sourced, regenerative practices)
 * - Chef contributions (meals served, events completed)
 * - Training completion
 * - Community engagement
 * 
 * Score range: 0-1000
 */
export async function calculateMemberImpactScore(memberId: string): Promise<{
  success: boolean
  impact_score?: number
  breakdown?: Record<string, number>
  error?: string
}> {
  try {
    // Fetch member
    const { data: member, error: memberError } = await supabaseAdmin
      .from('cooperative_members')
      .select('id, role, farmer_id, chef_id, status')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return { success: false, error: 'Member not found' }
    }

    if (member.status !== 'active') {
      return { success: true, impact_score: 0, breakdown: {} }
    }

    const breakdown: Record<string, number> = {}
    let totalScore = 0

    // 1. Farmer Contributions (if farmer role or linked to farmer)
    if (member.role === 'farmer' || member.farmer_id) {
      const farmerId = member.farmer_id || memberId

      // Ingredients sourced (10 points per ingredient)
      const { data: ingredientOrders } = await supabaseAdmin
        .from('booking_ingredients')
        .select('id')
        .eq('farmer_id', farmerId)
        .eq('payout_status', 'paid')

      const ingredientScore = (ingredientOrders?.length || 0) * 10
      breakdown.ingredients_sourced = ingredientScore
      totalScore += ingredientScore

      // Farmer role assignments (20 points per assignment)
      const { data: farmerAssignments } = await supabaseAdmin
        .from('booking_farmers')
        .select('id')
        .eq('farmer_id', farmerId)
        .eq('payout_status', 'paid')

      const assignmentScore = (farmerAssignments?.length || 0) * 20
      breakdown.farmer_assignments = assignmentScore
      totalScore += assignmentScore

      // Regenerative practices bonus (based on certifications)
      const { data: farmer } = await supabaseAdmin
        .from('farmers')
        .select('certifications, regenerative_practices')
        .eq('id', farmerId)
        .single()

      if (farmer) {
        const certCount = (farmer.certifications as string[])?.length || 0
        const regenerativeBonus = certCount * 15
        breakdown.regenerative_practices = regenerativeBonus
        totalScore += regenerativeBonus
      }
    }

    // 2. Chef Contributions (if chef role or linked to chef)
    if (member.role === 'chef' || member.chef_id) {
      const chefId = member.chef_id || memberId

      // Completed bookings (30 points per booking)
      const { data: chefBookings } = await supabaseAdmin
        .from('booking_chefs')
        .select('id, booking:booking_inquiries(guests)')
        .eq('chef_id', chefId)
        .eq('payout_status', 'paid')

      const bookingScore = (chefBookings?.length || 0) * 30
      breakdown.chef_bookings = bookingScore
      totalScore += bookingScore

      // Meals served bonus (1 point per 10 meals)
      const totalMeals = chefBookings?.reduce((sum, cb) => {
        const guests = (cb.booking as any)?.guests || 0
        return sum + guests
      }, 0) || 0

      const mealsScore = Math.floor(totalMeals / 10)
      breakdown.meals_served = mealsScore
      totalScore += mealsScore
    }

    // 3. Training Completion (5 points per training)
    const { data: completedTrainings } = await supabaseAdmin
      .from('cooperative_member_training')
      .select('id')
      .eq('member_id', memberId)
      .not('completed_at', 'is', null)

    const trainingScore = (completedTrainings?.length || 0) * 5
    breakdown.training_completion = trainingScore
    totalScore += trainingScore

    // 4. Community Engagement (based on impact events)
    const { data: impactEvents } = await supabaseAdmin
      .from('impact_events')
      .select('id, value')
      .or(`reference_id.eq.${memberId},reference_id.eq.${member.farmer_id || ''},reference_id.eq.${member.chef_id || ''}`)
      .not('reference_id', 'is', null)

    const communityScore = Math.min((impactEvents?.length || 0) * 2, 100) // Cap at 100
    breakdown.community_engagement = communityScore
    totalScore += communityScore

    // 5. Role-specific bonuses
    if (member.role === 'educator') {
      // Educators get base score for training contributions
      breakdown.educator_base = 50
      totalScore += 50
    }

    if (member.role === 'builder') {
      // Builders get base score for infrastructure contributions
      breakdown.builder_base = 50
      totalScore += 50
    }

    if (member.role === 'partner') {
      // Partners get base score for strategic support
      breakdown.partner_base = 50
      totalScore += 50
    }

    // Cap at 1000
    const finalScore = Math.min(totalScore, 1000)

    return {
      success: true,
      impact_score: finalScore,
      breakdown,
    }
  } catch (error: any) {
    console.error('Error calculating impact score:', error)
    return {
      success: false,
      error: error.message || 'Failed to calculate impact score',
    }
  }
}

/**
 * Phase 7A: Calculate impact scores for all active members
 */
export async function calculateAllMemberImpactScores(): Promise<{
  success: boolean
  members_updated: number
  errors: string[]
}> {
  try {
    const { data: activeMembers, error } = await supabaseAdmin
      .from('cooperative_members')
      .select('id')
      .eq('status', 'active')

    if (error || !activeMembers) {
      return { success: false, members_updated: 0, errors: [error?.message || 'Failed to fetch members'] }
    }

    const errors: string[] = []
    let updated = 0

    for (const member of activeMembers) {
      const result = await calculateMemberImpactScore(member.id)
      if (result.success && result.impact_score !== undefined) {
        const { error: updateError } = await supabaseAdmin
          .from('cooperative_members')
          .update({ impact_score: result.impact_score })
          .eq('id', member.id)

        if (updateError) {
          errors.push(`Failed to update ${member.id}: ${updateError.message}`)
        } else {
          updated++
        }
      } else {
        errors.push(`Failed to calculate for ${member.id}: ${result.error}`)
      }
    }

    return {
      success: true,
      members_updated: updated,
      errors,
    }
  } catch (error: any) {
    console.error('Error calculating all impact scores:', error)
    return {
      success: false,
      members_updated: 0,
      errors: [error.message || 'Failed to calculate impact scores'],
    }
  }
}
