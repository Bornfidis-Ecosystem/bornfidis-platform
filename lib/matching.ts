import { db } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

interface MatchResult {
  farmerId: string
  farmerName: string
  farmerPhone: string | null
  farmerParish: string | null
  farmerAcres: number | null
  crop: string
  matchScore: number
  scoreBreakdown: {
    cropMatch: number
    parishProximity: number
    experienceAcres: number
  }
}

interface ChefNeedWithMatches {
  needId: string
  crop: string
  quantity: number
  frequency: string
  startDate: string
  endDate: string | null
  matches: MatchResult[]
}

/**
 * Calculate crop match score (0-50 points)
 * Exact match = 50, case-insensitive partial match = 25, no match = 0
 */
function calculateCropMatchScore(chefCrop: string, farmerCrop: string): number {
  const chefCropLower = chefCrop.toLowerCase().trim()
  const farmerCropLower = farmerCrop.toLowerCase().trim()

  // Exact match (case-insensitive)
  if (chefCropLower === farmerCropLower) {
    return 50
  }

  // Partial match (one contains the other)
  if (chefCropLower.includes(farmerCropLower) || farmerCropLower.includes(chefCropLower)) {
    return 25
  }

  // No match
  return 0
}

/**
 * Calculate parish proximity score (0-30 points)
 * Same parish = 30, different parish = 0
 */
function calculateParishProximityScore(chefParish: string | null, farmerParish: string | null): number {
  if (!chefParish || !farmerParish) {
    // If either is missing, can't score proximity
    return 0
  }

  const chefParishLower = chefParish.toLowerCase().trim()
  const farmerParishLower = farmerParish.toLowerCase().trim()

  if (chefParishLower === farmerParishLower) {
    return 30
  }

  return 0
}

/**
 * Calculate experience/acres score (0-20 points)
 * Normalized based on acres: more acres = higher score
 * Max score (20) for 100+ acres, linear scale below
 */
function calculateExperienceAcresScore(acres: number | null): number {
  if (!acres || acres <= 0) {
    return 0
  }

  // Normalize: 100+ acres = 20 points, linear scale below
  const normalizedScore = Math.min(20, (acres / 100) * 20)
  return Math.round(normalizedScore * 100) / 100 // Round to 2 decimal places
}

/**
 * Match chef needs with farmers
 * Returns top 5 farmers per need based on match score
 */
export async function matchChefWithFarmers(chefId: string): Promise<ChefNeedWithMatches[]> {
  // Get chef needs
  const chefNeeds = await db.chefNeed.findMany({
    where: {
      chefId,
    },
    orderBy: {
      startDate: 'asc',
    },
  })

  if (chefNeeds.length === 0) {
    return []
  }

  // Get chef info (for parish matching)
  const { data: chef, error: chefError } = await supabaseAdmin
    .from('chefs')
    .select('id, name, email')
    .eq('id', chefId)
    .single()

  if (chefError || !chef) {
    throw new Error('Chef not found')
  }

  // Note: Chefs don't have parish in current schema, so parish proximity will be 0
  // This can be enhanced later if chef location data is added
  const chefParish: string | null = null

  // Get all farmers with their crops
  const farmers = await db.farmer.findMany({
    include: {
      crops: true,
    },
  })

  // For each chef need, find matching farmers
  const results: ChefNeedWithMatches[] = []

  for (const need of chefNeeds) {
    const matches: MatchResult[] = []

    // Find farmers who have the matching crop
    for (const farmer of farmers) {
      // Check if farmer has the crop (case-insensitive)
      const matchingCrop = farmer.crops.find((crop) => {
        const cropLower = crop.crop.toLowerCase().trim()
        const needCropLower = need.crop.toLowerCase().trim()
        return cropLower === needCropLower || cropLower.includes(needCropLower) || needCropLower.includes(cropLower)
      })

      if (!matchingCrop) {
        continue // Skip farmers without matching crop
      }

      // Calculate scores
      const cropMatchScore = calculateCropMatchScore(need.crop, matchingCrop.crop)
      const parishProximityScore = calculateParishProximityScore(chefParish, farmer.parish)
      const experienceAcresScore = calculateExperienceAcresScore(farmer.acres)

      // Total score (0-100)
      const matchScore = cropMatchScore + parishProximityScore + experienceAcresScore

      matches.push({
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        farmerParish: farmer.parish,
        farmerAcres: farmer.acres,
        crop: matchingCrop.crop,
        matchScore: Math.round(matchScore * 100) / 100, // Round to 2 decimal places
        scoreBreakdown: {
          cropMatch: cropMatchScore,
          parishProximity: parishProximityScore,
          experienceAcres: experienceAcresScore,
        },
      })
    }

    // Sort by match score (descending) and take top 5
    matches.sort((a, b) => b.matchScore - a.matchScore)
    const topMatches = matches.slice(0, 5)

    results.push({
      needId: need.id,
      crop: need.crop,
      quantity: need.quantity,
      frequency: need.frequency,
      startDate: need.startDate.toISOString().split('T')[0],
      endDate: need.endDate ? need.endDate.toISOString().split('T')[0] : null,
      matches: topMatches,
    })
  }

  return results
}
