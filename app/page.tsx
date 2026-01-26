import { supabaseAdmin } from '@/lib/supabase'
import { formatUSD } from '@/lib/money'
import Link from 'next/link'
import HomeHero from './components/HomeHero'
import HomePillars from './components/HomePillars'
import HomePaths from './components/HomePaths'
import HomeImpact from './components/HomeImpact'
import HomeScripture from './components/HomeScripture'
import HomeTestimonies from './components/HomeTestimonies'

async function getHomeData() {
  // Get impact metrics
  const { data: metrics } = await supabaseAdmin
    .from('harvest_metrics')
    .select('food_tons, meals_served, land_regenerated_acres, farmers_supported, chefs_deployed')
    .order('period_start', { ascending: false })
    .limit(1)

  // Get featured testimonies
  const { data: testimonies } = await supabaseAdmin
    .from('living_testament')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(3)

  // Calculate totals
  const impact = {
    food_tons: metrics?.[0]?.food_tons || 0,
    meals_served: metrics?.[0]?.meals_served || 0,
    land_acres: metrics?.[0]?.land_regenerated_acres || 0,
    farmers: metrics?.[0]?.farmers_supported || 0,
    chefs: metrics?.[0]?.chefs_deployed || 0,
  }

  return {
    impact,
    testimonies: testimonies || [],
  }
}

export default async function HomePage() {
  const homeData = await getHomeData()

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HomeHero />

      {/* Pillars Section */}
      <HomePillars />

      {/* Choose Your Path */}
      <HomePaths />

      {/* Impact Counters */}
      <HomeImpact impact={homeData.impact} />

      {/* Scripture Banner */}
      <HomeScripture />

      {/* Testimony Slider */}
      <HomeTestimonies testimonies={homeData.testimonies} />
    </div>
  )
}
