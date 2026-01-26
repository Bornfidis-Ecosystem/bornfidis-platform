import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import FarmerIngredientsClient from './FarmerIngredientsClient'
import { Farmer, Ingredient, FarmerIngredient } from '@/types/ingredient'

async function getFarmerData(farmerId: string): Promise<{ farmer: Farmer | null; ingredients: Ingredient[]; farmerIngredients: FarmerIngredient[] }> {
  await requireAuth()

  // Fetch farmer
  const { data: farmer, error: farmerError } = await supabaseAdmin
    .from('farmers')
    .select('*')
    .eq('id', farmerId)
    .single()

  if (farmerError || !farmer) {
    return { farmer: null, ingredients: [], farmerIngredients: [] }
  }

  // Fetch all ingredients
  const { data: ingredients } = await supabaseAdmin
    .from('ingredients')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch farmer's ingredients
  const { data: farmerIngredients } = await supabaseAdmin
    .from('farmer_ingredients')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })

  return {
    farmer: farmer as Farmer,
    ingredients: (ingredients || []) as Ingredient[],
    farmerIngredients: (farmerIngredients || []) as FarmerIngredient[],
  }
}

export default async function FarmerIngredientsPage({ params }: { params: { id: string } }) {
  const { farmer, ingredients, farmerIngredients } = await getFarmerData(params.id)

  if (!farmer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/farmers"
                className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Farmers
              </Link>
              <h1 className="text-2xl font-bold">Farmer Ingredients</h1>
              <p className="text-[#FFBC00] text-sm mt-1">{farmer.name}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <FarmerIngredientsClient
          farmer={farmer}
          ingredients={ingredients}
          farmerIngredients={farmerIngredients}
        />
      </main>
    </div>
  )
}
