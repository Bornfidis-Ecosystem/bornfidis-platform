'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { Chef, ChefStatus } from '@/types/chef'

/**
 * Phase 5A: Get all chefs
 */
export async function getAllChefs(): Promise<{
    success: boolean
    chefs?: Chef[]
    error?: string
}> {
    await requireAuth()

    try {
        const { data, error } = await supabaseAdmin
            .from('chefs')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching chefs:', error)
            return { success: false, error: error.message || 'Failed to fetch chefs' }
        }

        return { success: true, chefs: data as Chef[] }
    } catch (error: any) {
        console.error('Error in getAllChefs:', error)
        return { success: false, error: error.message || 'Failed to fetch chefs' }
    }
}

/**
 * Phase 5A: Get chef by ID
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

        return { success: true, chef: data as Chef }
    } catch (error: any) {
        console.error('Error in getChefById:', error)
        return { success: false, error: error.message || 'Failed to fetch chef' }
    }
}

/**
 * Phase 5A: Get active chefs (for assignment dropdown)
 */
export async function getActiveChefs(): Promise<{
    success: boolean
    chefs?: Chef[]
    error?: string
}> {
    await requireAuth()

    try {
        const { data, error } = await supabaseAdmin
            .from('chefs')
            .select('id, name, email, status, payout_percentage')
            .in('status', ['active', 'approved']) // Include approved chefs who can be assigned
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching active chefs:', error)
            return { success: false, error: error.message || 'Failed to fetch chefs' }
        }

        return { success: true, chefs: data as Chef[] }
    } catch (error: any) {
        console.error('Error in getActiveChefs:', error)
        return { success: false, error: error.message || 'Failed to fetch chefs' }
    }
}
