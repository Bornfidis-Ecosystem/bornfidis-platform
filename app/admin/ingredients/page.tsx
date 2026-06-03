import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import IngredientsClient from './IngredientsClient'
import { Ingredient } from '@/types/ingredient'
import { CulinaryCard } from '@/components/culinary-os'

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
    <div className="min-h-screen bg-culinary-bone">
      {/* Header */}
      <header className="bg-forestDark text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/bookings"
                className="text-gold hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Bookings
              </Link>
              <h1 className="text-2xl font-bold">Ingredient Catalog</h1>
              <p className="text-gold text-sm mt-1">{stats.total} ingredient{stats.total !== 1 ? 's' : ''}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <CulinaryCard padded={false} className="p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-forestDark">{stats.total}</p>
          </CulinaryCard>
          <div className="rounded-none border border-green-200 bg-green-50 p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Produce</p>
            <p className="text-2xl font-bold text-green-700">{stats.byCategory.produce}</p>
          </div>
          <div className="rounded-none border border-blue-200 bg-blue-50 p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Fish</p>
            <p className="text-2xl font-bold text-blue-700">{stats.byCategory.fish}</p>
          </div>
          <div className="rounded-none border border-red-200 bg-red-50 p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Meat</p>
            <p className="text-2xl font-bold text-red-700">{stats.byCategory.meat}</p>
          </div>
          <div className="rounded-none border border-yellow-200 bg-yellow-50 p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Dairy</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.byCategory.dairy}</p>
          </div>
          <div className="rounded-none border border-purple-200 bg-purple-50 p-4 shadow-none">
            <p className="text-sm text-gray-600 mb-1">Spice</p>
            <p className="text-2xl font-bold text-purple-700">{stats.byCategory.spice}</p>
          </div>
        </div>

        <IngredientsClient ingredients={ingredients} />
      </div>
    </div>
  )
}

