'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Farmer, Ingredient, FarmerIngredient } from '@/types/ingredient'
import { formatUSD } from '@/lib/money'

interface FarmerIngredientsClientProps {
  farmer: Farmer
  ingredients: Ingredient[]
  farmerIngredients: FarmerIngredient[]
}

export default function FarmerIngredientsClient({ farmer, ingredients: allIngredients, farmerIngredients: initialFarmerIngredients }: FarmerIngredientsClientProps) {
  const router = useRouter()
  const [farmerIngredients, setFarmerIngredients] = useState(initialFarmerIngredients)
  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      farmer_id: farmer.id,
      ingredient_id: formData.get('ingredient_id') as string,
      price_cents: Math.round(parseFloat(formData.get('price_dollars') as string) * 100),
      availability: formData.get('availability') as string,
      certified: formData.get('certified') === 'on',
      regenerative_practices: formData.get('regenerative_practices') as string || null,
      notes: formData.get('notes') as string || null,
    }

    try {
      const response = await fetch('/api/admin/farmer-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Ingredient added to farmer' })
        setShowAddForm(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add ingredient' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async (farmerIngredientId: string) => {
    if (!confirm('Remove this ingredient from farmer?')) return

    try {
      const response = await fetch(`/api/admin/farmer-ingredients/${farmerIngredientId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Ingredient removed' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove ingredient' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
  }

  // Get ingredients not yet assigned to this farmer
  const assignedIngredientIds = new Set(farmerIngredients.map(fi => fi.ingredient_id))
  const availableIngredients = allIngredients.filter(i => !assignedIngredientIds.has(i.id))

  const filteredAvailable = filterCategory === 'all'
    ? availableIngredients
    : availableIngredients.filter(i => i.category === filterCategory)

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">In Stock</span>
      case 'limited':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Limited</span>
      case 'out_of_season':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Out of Season</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{availability}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Assigned Ingredients */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1a5f3f]">Assigned Ingredients ({farmerIngredients.length})</h2>
        </div>
        {farmerIngredients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No ingredients assigned yet. Add ingredients below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-gray-600 font-semibold">Ingredient</th>
                  <th className="text-left py-3 px-6 text-gray-600 font-semibold">Category</th>
                  <th className="text-right py-3 px-6 text-gray-600 font-semibold">Price</th>
                  <th className="text-center py-3 px-6 text-gray-600 font-semibold">Availability</th>
                  <th className="text-center py-3 px-6 text-gray-600 font-semibold">Certified</th>
                  <th className="text-right py-3 px-6 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {farmerIngredients.map((fi) => (
                  <tr key={fi.id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <div className="font-medium text-gray-900">{fi.ingredient?.name || 'Loading...'}</div>
                      <div className="text-xs text-gray-500">per {fi.ingredient?.unit || 'unit'}</div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-xs text-gray-600 capitalize">{fi.ingredient?.category}</span>
                    </td>
                    <td className="py-3 px-6 text-right font-semibold text-[#1a5f3f]">
                      {formatUSD(fi.price_cents)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {getAvailabilityBadge(fi.availability)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {fi.certified ? (
                        <span className="px-2 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded text-xs font-semibold">✓ Certified</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleRemove(fi.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Ingredient Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a5f3f]">Add Ingredient</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-1.5 bg-[#1a5f3f] text-white rounded-lg text-sm font-semibold hover:bg-[#154a32] transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Ingredient'}
          </button>
        </div>

        {showAddForm && (
          <div className="p-6">
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                >
                  <option value="all">All Categories</option>
                  <option value="produce">Produce</option>
                  <option value="fish">Fish</option>
                  <option value="meat">Meat</option>
                  <option value="dairy">Dairy</option>
                  <option value="spice">Spice</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Ingredient *</label>
                <select
                  name="ingredient_id"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                >
                  <option value="">-- Select ingredient --</option>
                  {filteredAvailable.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.category}) - {ingredient.unit}
                    </option>
                  ))}
                </select>
                {filteredAvailable.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {filterCategory === 'all' ? 'All ingredients are already assigned to this farmer.' : `No ${filterCategory} ingredients available.`}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    name="price_dollars"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                  <select
                    name="availability"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="limited">Limited</option>
                    <option value="out_of_season">Out of Season</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="certified"
                    className="w-4 h-4 text-[#1a5f3f] rounded focus:ring-[#1a5f3f]"
                  />
                  <span className="text-sm text-gray-700">Certified (Organic, Fair Trade, etc.)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regenerative Practices</label>
                <textarea
                  name="regenerative_practices"
                  rows={2}
                  placeholder="Describe regenerative practices for this ingredient..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add Ingredient'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
