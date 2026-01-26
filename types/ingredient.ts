export type IngredientCategory = 'produce' | 'fish' | 'meat' | 'dairy' | 'spice' | 'beverage'
export type IngredientAvailability = 'in_stock' | 'limited' | 'out_of_season'
export type FulfillmentStatus = 'pending' | 'confirmed' | 'delivered' | 'paid'
export type IngredientPayoutStatus = 'pending' | 'on_hold' | 'paid' | 'failed'

export interface Ingredient {
  id: string
  created_at: string
  updated_at: string
  name: string
  category: IngredientCategory
  unit: string
  regenerative_score: number
  seasonality?: string
  notes?: string
  search_keywords?: string[]
  is_active: boolean
}

export interface FarmerIngredient {
  id: string
  created_at: string
  updated_at: string
  farmer_id: string
  ingredient_id: string
  price_cents: number
  availability: IngredientAvailability
  certified: boolean
  regenerative_practices?: string
  notes?: string
  // Joined data
  ingredient?: Ingredient
  farmer?: {
    id: string
    name: string
    location?: string
  }
}

export interface BookingIngredient {
  id: string
  created_at: string
  updated_at: string
  booking_id: string
  ingredient_id: string
  farmer_id: string
  quantity: number
  unit: string
  price_cents: number
  total_cents: number
  fulfillment_status: FulfillmentStatus
  confirmed_at?: string
  delivered_at?: string
  paid_at?: string
  payout_status: IngredientPayoutStatus
  transfer_id?: string
  notes?: string
  // Joined data
  ingredient?: Ingredient
  farmer?: {
    id: string
    name: string
    email?: string
  }
}

export interface IngredientMatch {
  ingredient_id: string
  ingredient_name: string
  category: IngredientCategory
  quantity: number
  unit: string
  matched_farmers: Array<{
    farmer_id: string
    farmer_name: string
    price_cents: number
    availability: IngredientAvailability
    regenerative_score: number
    certified: boolean
  }>
}
