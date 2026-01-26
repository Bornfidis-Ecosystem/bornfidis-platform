'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { Chef } from '@/types/chef'

/**
 * Phase 5B: Get chef by ID
 * Used by API routes for chef operations
 */
export async function getChefById(chefId: string): Promise<{
  success: boolean
  chef?: Chef
  error?: string
}> {
  await requireAuth()

  try {
    const { data, error } = await supabaseAdmin
      .from('chefs')
      .select('*')
      .eq('id', chefId)
      .single()

    if (error) {
      console.error('Error fetching chef:', error)
      return { success: false, error: error.message || 'Chef not found' }
    }

    if (!data) {
      return { success: false, error: 'Chef not found' }
    }

    return { success: true, chef: data as Chef }
  } catch (error: any) {
    console.error('Error in getChefById:', error)
    return { success: false, error: error.message || 'Failed to fetch chef' }
  }
}

/**
 * Phase 5B: Update chef
 * Used for updating chef information
 */
export async function updateChef(
  chefId: string,
  updates: Partial<Chef>
): Promise<{
  success: boolean
  chef?: Chef
  error?: string
}> {
  await requireAuth()

  try {
    // Prepare update data (exclude id, created_at, updated_at from updates)
    const { id, created_at, updated_at, ...updateData } = updates

    // Add updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('chefs')
      .update(dataToUpdate)
      .eq('id', chefId)
      .select()
      .single()

    if (error) {
      console.error('Error updating chef:', error)
      return { success: false, error: error.message || 'Failed to update chef' }
    }

    if (!data) {
      return { success: false, error: 'Chef not found' }
    }

    return { success: true, chef: data as Chef }
  } catch (error: any) {
    console.error('Error in updateChef:', error)
    return { success: false, error: error.message || 'Failed to update chef' }
  }
}

/**
 * Phase 5B: Delete chef
 * Soft delete by setting status to 'inactive' or hard delete
 */
export async function deleteChef(
  chefId: string,
  hardDelete: boolean = false
): Promise<{
  success: boolean
  error?: string
}> {
  await requireAuth()

  try {
    if (hardDelete) {
      // Hard delete - permanently remove from database
      const { error } = await supabaseAdmin
        .from('chefs')
        .delete()
        .eq('id', chefId)

      if (error) {
        console.error('Error deleting chef:', error)
        return { success: false, error: error.message || 'Failed to delete chef' }
      }
    } else {
      // Soft delete - set status to inactive
      const { error } = await supabaseAdmin
        .from('chefs')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', chefId)

      if (error) {
        console.error('Error soft-deleting chef:', error)
        return { success: false, error: error.message || 'Failed to deactivate chef' }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteChef:', error)
    return { success: false, error: error.message || 'Failed to delete chef' }
  }
}
