import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import SignOutButton from '@/components/admin/SignOutButton'
import ImpactDashboardClient from './ImpactDashboardClient'

async function getImpactData() {
  await requireAuth()

  // Get total bookings
  const { data: bookings } = await supabaseAdmin
    .from('booking_inquiries')
    .select('id, quote_total_cents, fully_paid_at, job_completed_at')

  // Get total farmers
  const { data: farmers } = await supabaseAdmin
    .from('farmers')
    .select('id, status')

  // Get total chefs
  const { data: chefs } = await supabaseAdmin
    .from('chefs')
    .select('id, status')

  // Get booking ingredients (regenerative sourcing)
  const { data: bookingIngredients } = await supabaseAdmin
    .from('booking_ingredients')
    .select(`
      id,
      total_cents,
      fulfillment_status,
      ingredient:ingredients(regenerative_score)
    `)

  // Get farmer payouts
  const { data: farmerPayouts } = await supabaseAdmin
    .from('booking_farmers')
    .select('payout_amount_cents, payout_status, paid_at')

  // Get ingredient payouts
  const { data: ingredientPayouts } = await supabaseAdmin
    .from('booking_ingredients')
    .select('total_cents, payout_status, paid_at')

  // Calculate metrics
  const totalRevenue = bookings?.reduce((sum, b) => sum + (b.quote_total_cents || 0), 0) || 0
  const completedBookings = bookings?.filter(b => b.job_completed_at && b.fully_paid_at).length || 0
  const totalFarmers = farmers?.filter(f => f.status === 'approved').length || 0
  const totalChefs = chefs?.filter(c => c.status === 'approved' || c.status === 'active').length || 0

  // Regenerative score (average of all ingredient scores)
  const regenerativeScores = bookingIngredients
    ?.map(bi => (bi.ingredient as any)?.regenerative_score)
    .filter((score): score is number => typeof score === 'number') || []
  const avgRegenerativeScore = regenerativeScores.length > 0
    ? Math.round(regenerativeScores.reduce((sum, score) => sum + score, 0) / regenerativeScores.length)
    : 0

  // Farmer income
  const totalFarmerIncome = farmerPayouts
    ?.filter(p => p.payout_status === 'paid')
    .reduce((sum, p) => sum + (p.payout_amount_cents || 0), 0) || 0

  // Ingredient farmer income
  const totalIngredientIncome = ingredientPayouts
    ?.filter(p => p.payout_status === 'paid')
    .reduce((sum, p) => sum + (p.total_cents || 0), 0) || 0

  const totalFarmerIncomeAll = totalFarmerIncome + totalIngredientIncome

  // Community meals (estimate: 1 meal per $50)
  const communityMealsFunded = Math.floor(totalRevenue / 5000) // $50 per meal in cents

  // Phase 6C: Get impact events for charts and testimony
  const { data: impactEvents } = await supabaseAdmin
    .from('impact_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get recent snapshots for trend data
  const { data: recentSnapshots } = await supabaseAdmin
    .from('impact_snapshots')
    .select('*')
    .eq('period', 'monthly')
    .order('period_start', { ascending: false })
    .limit(12)

  // Calculate from impact events
  const totalMealsFromEvents = impactEvents
    ?.filter(e => e.metric === 'meals_served')
    .reduce((sum, e) => sum + Number(e.value), 0) || 0

  const totalFamiliesSupported = impactEvents
    ?.filter(e => e.metric === 'families_supported')
    .reduce((sum, e) => sum + Number(e.value), 0) || 0

  const totalSoilPoints = impactEvents
    ?.filter(e => e.metric === 'soil_health_points')
    .reduce((sum, e) => sum + Number(e.value), 0) || 0

  return {
    totalRevenue,
    completedBookings,
    totalFarmers,
    totalChefs,
    avgRegenerativeScore,
    totalFarmerIncome: totalFarmerIncomeAll,
    communityMealsFunded: totalMealsFromEvents || communityMealsFunded,
    totalIngredients: bookingIngredients?.length || 0,
    familiesSupported: totalFamiliesSupported,
    totalSoilPoints,
    impactEvents: impactEvents || [],
    recentSnapshots: recentSnapshots || [],
  }
}

export default async function ImpactDashboardPage() {
  const impactData = await getImpactData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Regenerative Impact Dashboard</h1>
              <p className="text-[#FFBC00] text-sm mt-1">Measuring our positive impact</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <ImpactDashboardClient impactData={impactData} />
      </main>
    </div>
  )
}
