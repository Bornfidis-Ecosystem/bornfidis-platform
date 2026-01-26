import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createChefStripeAccount } from '@/lib/stripe-connect'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 5B: Create Stripe Connect Express account
 * POST /api/stripe/connect/create-account
 * 
 * Creates a Stripe Express account for a chef
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'STRIPE_SECRET_KEY is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { chef_id, chef_email, chef_name } = body

    if (!chef_id || !chef_email || !chef_name) {
      return NextResponse.json(
        { success: false, error: 'chef_id, chef_email, and chef_name are required' },
        { status: 400 }
      )
    }

    // Verify chef exists
    const { data: chef, error: chefError } = await supabaseAdmin
      .from('chefs')
      .select('id, email, name, stripe_connect_account_id')
      .eq('id', chef_id)
      .single()

    if (chefError || !chef) {
      return NextResponse.json(
        { success: false, error: 'Chef not found' },
        { status: 404 }
      )
    }

    // Check if account already exists
    if (chef.stripe_connect_account_id) {
      return NextResponse.json({
        success: true,
        account_id: chef.stripe_connect_account_id,
        message: 'Stripe account already exists',
      })
    }

    // Create Stripe Express account
    const result = await createChefStripeAccount(chef.email, chef.name)

    if (!result.success || !result.accountId) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create Stripe account' },
        { status: 500 }
      )
    }

    // Update chef record
    const { error: updateError } = await supabaseAdmin
      .from('chefs')
      .update({
        stripe_connect_account_id: result.accountId,
        stripe_account_id: result.accountId, // Backward compatibility
        stripe_connect_status: 'pending',
      })
      .eq('id', chef_id)

    if (updateError) {
      console.error('Error updating chef with account ID:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to save account ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      account_id: result.accountId,
      message: 'Stripe account created successfully',
    })
  } catch (error: any) {
    console.error('Error creating Stripe account:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
