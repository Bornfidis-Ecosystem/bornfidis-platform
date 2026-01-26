import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import IngredientsClient from './IngredientsClient'
import { Ingredient } from '@/types/ingredient'

async function getAllIngredients(): Promise<Ingredient[]> {
  await requireAuth()

  const { data: ingredients, error } = await supabaseAdmin
    .from('ingredients')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching ingredients:', error)
    return []
  }

  return (ingredients || []) as Ingredient[]
}

export default async function AdminIngredientsPage() {
  const ingredients = await getAllIngredients()

  const stats = {
    total: ingredients.length,
    byCategory: {
      produce: ingredients.filter(i => i.category === 'produce').length,
      fish: ingredients.filter(i => i.category === 'fish').length,
      meat: ingredients.filter(i => i.category === 'meat').length,
      dairy: ingredients.filter(i => i.category === 'dairy').length,
      spice: ingredients.filter(i => i.category === 'spice').length,
      beverage: ingredients.filter(i => i.category === 'beverage').length,
    },
    active: ingredients.filter(i => i.is_active).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/bookings"
                className="text-[#FFBC00] hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Bookings
              </Link>
              <h1 className="text-2xl font-bold">Ingredient Catalog</h1>
              <p className="text-[#FFBC00] text-sm mt-1">{stats.total} ingredient{stats.total !== 1 ? 's' : ''}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-[#1a5f3f]">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Produce</p>
            <p className="text-2xl font-bold text-green-700">{stats.byCategory.produce}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Fish</p>
            <p className="text-2xl font-bold text-blue-700">{stats.byCategory.fish}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Meat</p>
            <p className="text-2xl font-bold text-red-700">{stats.byCategory.meat}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Dairy</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.byCategory.dairy}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Spice</p>
            <p className="text-2xl font-bold text-purple-700">{stats.byCategory.spice}</p>
          </div>
        </div>

        <IngredientsClient ingredients={ingredients} />
      </div>
    </div>
  )
}
