'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { Farmer } from '@/types/farmer'

/**
 * Fetch all farmers for admin dashboard
 */
export async function getAllFarmers(): Promise<{ success: boolean; farmers?: Farmer[]; error?: string }> {
  await requireAuth()
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching farmers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, farmers: data as Farmer[] }
  } catch (error: any) {
    console.error('Error in getAllFarmers:', error)
    return { success: false, error: error.message || 'Failed to fetch farmers' }
  }
}

/**
 * Fetch a single farmer by ID
 */
export async function getFarmerById(id: string): Promise<{ success: boolean; farmer?: Farmer; error?: string }> {
  await requireAuth()
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching farmer:', error)
      return { success: false, error: error.message || 'Farmer not found' }
    }

    return { success: true, farmer: data as Farmer }
  } catch (error: any) {
    console.error('Error in getFarmerById:', error)
    return { success: false, error: error.message || 'Failed to fetch farmer' }
  }
}

/**
 * Fetch active farmers (approved status)
 */
export async function getActiveFarmers(): Promise<{ success: boolean; farmers?: Farmer[]; error?: string }> {
  await requireAuth()
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('id, name, email, status, payout_percentage')
      .eq('status', 'approved')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching active farmers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, farmers: data as Farmer[] }
  } catch (error: any) {
    console.error('Error in getActiveFarmers:', error)
    return { success: false, error: error.message || 'Failed to fetch active farmers' }
  }
}
