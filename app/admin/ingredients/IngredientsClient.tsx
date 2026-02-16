'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ingredient, IngredientCategory } from '@/types/ingredient'

interface IngredientsClientProps {
  ingredients: Ingredient[]
}

export default function IngredientsClient({ ingredients: initialIngredients }: IngredientsClientProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterCategory, setFilterCategory] = useState<IngredientCategory | 'all'>('all')

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as IngredientCategory,
      unit: formData.get('unit') as string,
      regenerative_score: parseInt(formData.get('regenerative_score') as string) || 50,
      seasonality: formData.get('seasonality') as string || null,
      notes: formData.get('notes') as string || null,
      is_active: true,
    }

    try {
      const response = await fetch('/api/admin/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Ingredient created successfully' })
        setShowCreateForm(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create ingredient' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsCreating(false)
    }
  }

  const filteredIngredients = filterCategory === 'all'
    ? ingredients
    : ingredients.filter(i => i.category === filterCategory)

  const getCategoryColor = (category: IngredientCategory) => {
    switch (category) {
      case 'produce': return 'bg-green-100 text-green-800'
      case 'fish': return 'bg-blue-100 text-blue-800'
      case 'meat': return 'bg-red-100 text-red-800'
      case 'dairy': return 'bg-yellow-100 text-yellow-800'
      case 'spice': return 'bg-purple-100 text-purple-800'
      case 'beverage': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a5f3f]">All Ingredients</h2>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a5f3f]"
          >
            <option value="all">All Categories</option>
            <option value="produce">Produce</option>
            <option value="fish">Fish</option>
            <option value="meat">Meat</option>
            <option value="dairy">Dairy</option>
            <option value="spice">Spice</option>
            <option value="beverage">Beverage</option>
          </select>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-1.5 bg-[#1a5f3f] text-white rounded-lg text-sm font-semibold hover:bg-[#154a32] transition"
          >
            {showCreateForm ? 'Cancel' : '+ Add Ingredient'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mx-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a5f3f] mb-4">Create New Ingredient</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                >
                  <option value="produce">Produce</option>
                  <option value="fish">Fish</option>
                  <option value="meat">Meat</option>
                  <option value="dairy">Dairy</option>
                  <option value="spice">Spice</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <input
                  type="text"
                  name="unit"
                  required
                  placeholder="lb, kg, bunch, bottle"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regenerative Score (0-100)</label>
                <input
                  type="number"
                  name="regenerative_score"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seasonality</label>
                <input
                  type="text"
                  name="seasonality"
                  placeholder="e.g., Year-round, May-September"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a5f3f] resize-y"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Ingredient'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ingredients Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-gray-600 font-semibold">Name</th>
              <th className="text-left py-3 px-6 text-gray-600 font-semibold">Category</th>
              <th className="text-left py-3 px-6 text-gray-600 font-semibold">Unit</th>
              <th className="text-right py-3 px-6 text-gray-600 font-semibold">Regenerative Score</th>
              <th className="text-left py-3 px-6 text-gray-600 font-semibold">Seasonality</th>
              <th className="text-center py-3 px-6 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIngredients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {filterCategory === 'all' ? 'No ingredients found. Create your first ingredient above.' : `No ${filterCategory} ingredients found.`}
                </td>
              </tr>
            ) : (
              filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="py-3 px-6 font-medium text-gray-900">{ingredient.name}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(ingredient.category)}`}>
                      {ingredient.category}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-600">{ingredient.unit}</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-semibold text-[#1a5f3f]">{ingredient.regenerative_score}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${ingredient.regenerative_score >= 70 ? 'bg-green-500' : ingredient.regenerative_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${ingredient.regenerative_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-gray-600 text-sm">
                    {ingredient.seasonality || '—'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {ingredient.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">Inactive</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

