'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookingInquiry } from '@/types/booking'
import { Ingredient, BookingIngredient, IngredientMatch } from '@/types/ingredient'
import { formatUSD } from '@/lib/money'

interface IngredientSourcingSectionProps {
  bookingId: string
  booking: BookingInquiry
}

export default function IngredientSourcingSection({ bookingId, booking }: IngredientSourcingSectionProps) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [bookingIngredients, setBookingIngredients] = useState<BookingIngredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<Array<{ ingredient_id: string; quantity: number; unit: string }>>([])
  const [matches, setMatches] = useState<IngredientMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Fetch all ingredients
    fetch('/api/admin/ingredients')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ingredients) {
          setIngredients(data.ingredients)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    // Fetch booking ingredients
    fetch(`/api/admin/bookings/${bookingId}/ingredients`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.booking_ingredients) {
          setBookingIngredients(data.booking_ingredients)
        }
      })
      .catch(() => {})
  }, [bookingId])

  const handleAutoMatch = async () => {
    if (selectedIngredients.length === 0) {
      setMessage({ type: 'error', text: 'Please add ingredients first' })
      return
    }

    setIsMatching(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/ingredients/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
        }),
      })

      const data = await response.json()

      if (data.success && data.matches) {
        setMatches(data.matches)
        setMessage({ type: 'success', text: `Found matches for ${data.matches.length} ingredient(s)` })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to find matches' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while matching' })
    } finally {
      setIsMatching(false)
    }
  }

  const handleGenerateOrders = async () => {
    if (matches.length === 0) {
      setMessage({ type: 'error', text: 'No matches to generate orders from' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/ingredients/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: matches,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Generated ${data.orders_created} purchase order(s)` })
        setSelectedIngredients([])
        setMatches([])
        router.refresh()
        // Reload booking ingredients
        fetch(`/api/admin/bookings/${bookingId}/ingredients`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.booking_ingredients) {
              setBookingIngredients(data.booking_ingredients)
            }
          })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate orders' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const addIngredient = () => {
    setSelectedIngredients([...selectedIngredients, { ingredient_id: '', quantity: 1, unit: 'lb' }])
  }

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...selectedIngredients]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedIngredients(updated)
  }

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Paid</span>
      case 'delivered':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Delivered</span>
      case 'confirmed':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Confirmed</span>
      case 'pending':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">Pending</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{status}</span>
    }
  }

  const totalIngredientCost = bookingIngredients.reduce((sum, bi) => sum + bi.total_cents, 0)

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading ingredients...</div>
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-semibold text-[#1a5f3f] mb-2">Ingredient Sourcing</h4>

      {/* Messages */}
      {message && (
        <div
          className={`p-3 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Booking Ingredients Summary */}
      {bookingIngredients.length > 0 && (
        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Current Orders:</span>
            <span className="text-sm font-bold text-[#1a5f3f]">{formatUSD(totalIngredientCost)}</span>
          </div>
          <div className="text-xs text-gray-500">
            {bookingIngredients.length} ingredient order{bookingIngredients.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Add Ingredients Form */}
      <div className="bg-white rounded p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-gray-700">Add Ingredients</h5>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-[#1a5f3f] text-white text-xs font-semibold rounded hover:bg-[#154a32] transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Ingredients'}
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-3">
            {selectedIngredients.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Ingredient</label>
                  <select
                    value={item.ingredient_id}
                    onChange={(e) => updateIngredient(index, 'ingredient_id', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#1a5f3f]"
                  >
                    <option value="">-- Select --</option>
                    {ingredients.filter(i => i.is_active).map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.category}) - {ing.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#1a5f3f]"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-xs text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#1a5f3f]"
                  />
                </div>
                <button
                  onClick={() => removeIngredient(index)}
                  className="px-2 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300 transition"
            >
              + Add Another Ingredient
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleAutoMatch}
                disabled={isMatching || selectedIngredients.length === 0 || selectedIngredients.some(i => !i.ingredient_id)}
                className="flex-1 px-4 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMatching ? 'Matching...' : 'Auto-Match Farmers'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Matches Display */}
      {matches.length > 0 && (
        <div className="bg-white rounded p-3 border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Matched Farmers</h5>
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <div className="font-medium text-sm text-gray-900 mb-2">
                  {match.ingredient_name} - {match.quantity} {match.unit}
                </div>
                {match.matched_farmers.length > 0 ? (
                  <div className="space-y-2">
                    {match.matched_farmers.map((farmer, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-xs text-gray-900">{farmer.farmer_name}</div>
                          <div className="text-xs text-gray-600">
                            {formatUSD(farmer.price_cents)} per {match.unit} • 
                            {farmer.certified && <span className="text-[#FFBC00] ml-1">✓ Certified</span>}
                            {farmer.availability !== 'in_stock' && (
                              <span className="text-yellow-600 ml-1">({farmer.availability})</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Score: {farmer.regenerative_score}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-yellow-600">No farmers found for this ingredient</div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleGenerateOrders}
            disabled={isSaving || matches.length === 0}
            className="w-full mt-3 px-4 py-2 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Generating...' : 'Generate Purchase Orders'}
          </button>
        </div>
      )}

      {/* Booking Ingredients List */}
      {bookingIngredients.length > 0 && (
        <div className="bg-white rounded p-3 border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Purchase Orders</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Ingredient</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Farmer</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-semibold">Qty</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-semibold">Price</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-semibold">Total</th>
                  <th className="text-center py-2 px-3 text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookingIngredients.map((bi) => (
                  <tr key={bi.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900">{bi.ingredient?.name || 'Loading...'}</div>
                      <div className="text-xs text-gray-500">{bi.ingredient?.category}</div>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{bi.farmer?.name || 'Loading...'}</td>
                    <td className="py-2 px-3 text-right text-gray-700">
                      {bi.quantity} {bi.unit}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-700">{formatUSD(bi.price_cents)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-[#1a5f3f]">{formatUSD(bi.total_cents)}</td>
                    <td className="py-2 px-3 text-center">{getFulfillmentBadge(bi.fulfillment_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
