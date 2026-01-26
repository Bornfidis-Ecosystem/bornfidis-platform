/**
 * Phase 7A: Cooperative Payout Engine
 * Distributes cooperative profits to members based on impact scores and payout shares
 */

import { supabaseAdmin } from '@/lib/supabase'
import { createChefPayout, getAccountStatus } from './stripe-connect'

/**
 * Phase 7A: Calculate payout shares for all members
 * 
 * Payout share is calculated as:
 * share = (member.impact_score / total_impact_score) * 100
 * 
 * Then normalized so total shares = 100%
 */
export async function calculatePayoutShares(): Promise<{
  success: boolean
  shares_calculated: number
  total_impact_score: number
  error?: string
}> {
  try {
    const { data: activeMembers, error } = await supabaseAdmin
      .from('cooperative_members')
      .select('id, impact_score')
      .eq('status', 'active')

    if (error || !activeMembers) {
      return { success: false, shares_calculated: 0, total_impact_score: 0, error: error?.message }
    }

    const totalImpactScore = activeMembers.reduce((sum, m) => sum + (m.impact_score || 0), 0)

    if (totalImpactScore === 0) {
      // If no impact scores, distribute equally
      const equalShare = 100 / activeMembers.length
      for (const member of activeMembers) {
        await supabaseAdmin
          .from('cooperative_members')
          .update({ payout_share_percent: equalShare })
          .eq('id', member.id)
      }
      return {
        success: true,
        shares_calculated: activeMembers.length,
        total_impact_score: 0,
      }
    }

    // Calculate shares based on impact scores
    let totalShares = 0
    for (const member of activeMembers) {
      const share = (member.impact_score / totalImpactScore) * 100
      totalShares += share

      await supabaseAdmin
        .from('cooperative_members')
        .update({ payout_share_percent: share })
        .eq('id', member.id)
    }

    // Normalize if needed (should be ~100%, but handle rounding)
    if (Math.abs(totalShares - 100) > 0.01) {
      const normalizationFactor = 100 / totalShares
      for (const member of activeMembers) {
        const { data: current } = await supabaseAdmin
          .from('cooperative_members')
          .select('payout_share_percent')
          .eq('id', member.id)
          .single()

        if (current) {
          await supabaseAdmin
            .from('cooperative_members')
            .update({ payout_share_percent: (current.payout_share_percent || 0) * normalizationFactor })
            .eq('id', member.id)
        }
      }
    }

    return {
      success: true,
      shares_calculated: activeMembers.length,
      total_impact_score: totalImpactScore,
    }
  } catch (error: any) {
    console.error('Error calculating payout shares:', error)
    return {
      success: false,
      shares_calculated: 0,
      total_impact_score: 0,
      error: error.message || 'Failed to calculate payout shares',
    }
  }
}

/**
 * Phase 7A: Distribute cooperative payouts for a period
 * 
 * Creates payout records and processes Stripe transfers
 */
export async function distributeCooperativePayouts(
  period: string,
  periodType: 'monthly' | 'quarterly' | 'annual',
  totalProfitCents: number
): Promise<{
  success: boolean
  payouts_created: number
  payouts_paid: number
  errors: string[]
}> {
  try {
    // First, ensure payout shares are up to date
    await calculatePayoutShares()

    // Fetch active members with payout shares
    const { data: members, error: membersError } = await supabaseAdmin
      .from('cooperative_members')
      .select('id, name, email, payout_share_percent, impact_score, farmer_id, chef_id')
      .eq('status', 'active')
      .gt('payout_share_percent', 0)

    if (membersError || !members) {
      return {
        success: false,
        payouts_created: 0,
        payouts_paid: 0,
        errors: [membersError?.message || 'Failed to fetch members'],
      }
    }

    const errors: string[] = []
    let payoutsCreated = 0
    let payoutsPaid = 0

    for (const member of members) {
      // Calculate payout amount
      const payoutAmountCents = Math.round(totalProfitCents * (member.payout_share_percent / 100))

      if (payoutAmountCents <= 0) {
        continue // Skip zero payouts
      }

      // Check if payout already exists for this period
      const { data: existing } = await supabaseAdmin
        .from('cooperative_payouts')
        .select('id')
        .eq('member_id', member.id)
        .eq('period', period)
        .single()

      if (existing) {
        errors.push(`Payout already exists for ${member.name} (${period})`)
        continue
      }

      // Create payout record
      const { data: payout, error: createError } = await supabaseAdmin
        .from('cooperative_payouts')
        .insert({
          member_id: member.id,
          period,
          period_type: periodType,
          amount_cents: payoutAmountCents,
          impact_score: member.impact_score,
          payout_share_percent: member.payout_share_percent,
          total_cooperative_profit_cents: totalProfitCents,
          payout_status: 'pending',
        })
        .select()
        .single()

      if (createError || !payout) {
        errors.push(`Failed to create payout for ${member.name}: ${createError?.message}`)
        continue
      }

      payoutsCreated++

      // Attempt to process payment via Stripe
      // First, find Stripe account (from farmer or chef)
      let stripeAccountId: string | null = null

      if (member.farmer_id) {
        const { data: farmer } = await supabaseAdmin
          .from('farmers')
          .select('stripe_account_id, stripe_connect_status, payouts_enabled')
          .eq('id', member.farmer_id)
          .single()

        if (farmer && farmer.stripe_connect_status === 'connected' && farmer.payouts_enabled) {
          stripeAccountId = farmer.stripe_account_id || null
        }
      }

      if (!stripeAccountId && member.chef_id) {
        const { data: chef } = await supabaseAdmin
          .from('chefs')
          .select('stripe_account_id, stripe_connect_status, payouts_enabled')
          .eq('id', member.chef_id)
          .single()

        if (chef && chef.stripe_connect_status === 'connected' && chef.payouts_enabled) {
          stripeAccountId = chef.stripe_account_id || null
        }
      }

      if (stripeAccountId) {
        // Verify account status
        const accountStatus = await getAccountStatus(stripeAccountId)
        if (accountStatus.success && accountStatus.payoutsEnabled) {
          // Create Stripe transfer
          const transferResult = await createChefPayout(
            stripeAccountId,
            payoutAmountCents,
            `Cooperative payout ${period} - ${member.name}`
          )

          if (transferResult.success && transferResult.transferId) {
            // Update payout as paid
            await supabaseAdmin
              .from('cooperative_payouts')
              .update({
                payout_status: 'paid',
                paid_at: new Date().toISOString(),
                stripe_transfer_id: transferResult.transferId,
              })
              .eq('id', payout.id)

            payoutsPaid++
          } else {
            errors.push(`Failed to process Stripe transfer for ${member.name}: ${transferResult.error}`)
          }
        } else {
          errors.push(`Stripe account not ready for ${member.name}`)
        }
      } else {
        errors.push(`No Stripe account found for ${member.name}`)
      }
    }

    return {
      success: true,
      payouts_created: payoutsCreated,
      payouts_paid: payoutsPaid,
      errors,
    }
  } catch (error: any) {
    console.error('Error distributing cooperative payouts:', error)
    return {
      success: false,
      payouts_created: 0,
      payouts_paid: 0,
      errors: [error.message || 'Failed to distribute payouts'],
    }
  }
}
