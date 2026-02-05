// ============================================
// BORNFIDIS FARMER MANAGEMENT SERVICE
// ============================================
// Expects Supabase table: farmers (with farmer_status, crops_available, etc.)

import { supabaseAdmin } from '@/lib/supabase'

// ============================================
// Types
// ============================================

export interface RegisterFarmerData {
  name: string
  phone: string
  whatsapp?: string | null
  location?: string | null
  parish?: string | null
  farmName?: string | null
  crops?: string[] | null
  farmSize?: number | null
  preferredDay?: string | null
  weeklyVolume?: number | null
  notes?: string | null
}

export interface GetFarmersFilters {
  status?: string
  parish?: string
  crop?: string
}

// ============================================
// 1. REGISTER NEW FARMER
// ============================================
export async function registerFarmer(farmerData: RegisterFarmerData) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .insert({
        name: farmerData.name,
        phone: farmerData.phone,
        whatsapp_number: farmerData.whatsapp ?? farmerData.phone,
        location: farmerData.location ?? null,
        parish: farmerData.parish ?? 'Portland',
        farm_name: farmerData.farmName ?? null,
        crops_available: farmerData.crops ?? [],
        farm_size_acres: farmerData.farmSize ?? null,
        preferred_collection_day: farmerData.preferredDay ?? 'Wednesday',
        typical_weekly_volume_lbs: farmerData.weeklyVolume ?? null,
        farmer_status: 'inquiry',
        onboarding_completed: true,
        source: 'whatsapp',
        notes: farmerData.notes ?? null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error:
            'This phone number is already registered. Please contact us at 876-448-8446.',
        }
      }
      throw error
    }

    console.log('✅ Farmer registered:', data.id)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Error registering farmer:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 2. GET FARMER BY PHONE
// ============================================
export async function getFarmerByPhone(phone: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Error fetching farmer:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 3. UPDATE FARMER STATUS
// ============================================
export async function updateFarmerStatus(
  farmerId: string,
  status: string,
  notes: string | null = null
) {
  try {
    const updateData: Record<string, unknown> = {
      farmer_status: status,
      updated_at: new Date().toISOString(),
    }
    if (notes != null) {
      updateData.notes = notes
    }

    const { error } = await supabaseAdmin
      .from('farmers')
      .update(updateData)
      .eq('id', farmerId)

    if (error) throw error

    console.log(`✅ Farmer status updated to: ${status}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error updating farmer status:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 4. GET ALL FARMERS (with filters)
// ============================================
export async function getFarmers(filters: GetFarmersFilters = {}) {
  try {
    let query = supabaseAdmin.from('farmers').select('*')

    if (filters.status) {
      query = query.eq('farmer_status', filters.status)
    }
    if (filters.parish) {
      query = query.eq('parish', filters.parish)
    }
    if (filters.crop) {
      query = query.contains('crops_available', [filters.crop])
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data ?? [] }
  } catch (error: any) {
    console.error('❌ Error fetching farmers:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 5. GET ACTIVE FARMERS FOR COLLECTION
// ============================================
export async function getActiveFarmersForDay(day: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('farmer_status', 'active')
      .eq('preferred_collection_day', day)
      .order('location')

    if (error) throw error

    return { success: true, data: data ?? [] }
  } catch (error: any) {
    console.error('❌ Error fetching active farmers:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 6. RECORD QUALITY RATING
// ============================================
export async function updateFarmerRating(
  farmerId: string,
  qualityRating: number,
  reliabilityRating: number,
  notes?: string | null
) {
  try {
    const { error } = await supabaseAdmin
      .from('farmers')
      .update({
        quality_rating: qualityRating,
        reliability_rating: reliabilityRating,
        notes: notes ?? null,
        last_delivery_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', farmerId)

    if (error) throw error

    console.log('✅ Farmer ratings updated')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Error updating farmer ratings:', error)
    return { success: false, error: error.message }
  }
}
