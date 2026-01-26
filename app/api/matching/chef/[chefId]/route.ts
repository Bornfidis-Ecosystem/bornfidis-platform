import { NextRequest, NextResponse } from 'next/server'
import { matchChefWithFarmers } from '@/lib/matching'
import { checkAdminAccess } from '@/lib/requireAdmin'
import { getAuthenticatedChef } from '@/lib/chef-auth'

/**
 * GET /api/matching/chef/{chefId}
 * Get farmer matches for a chef's needs
 * 
 * Authentication:
 * - Admin can access any chef's matches
 * - Chefs can only access their own matches
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { chefId: string } }
) {
  try {
    const chefId = params.chefId

    if (!chefId) {
      return NextResponse.json(
        { success: false, error: 'Chef ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const adminCheck = await checkAdminAccess()
    const isAdmin = adminCheck.isAdmin

    // If not admin, check if chef is accessing their own data
    if (!isAdmin) {
      const authenticatedChef = await getAuthenticatedChef()
      if (!authenticatedChef || authenticatedChef.chefId !== chefId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. You can only access your own matches.' },
          { status: 403 }
        )
      }
    }

    // Get matches
    const matches = await matchChefWithFarmers(chefId)

    return NextResponse.json({
      success: true,
      chefId,
      matches,
      summary: {
        totalNeeds: matches.length,
        totalMatches: matches.reduce((sum, m) => sum + m.matches.length, 0),
        needsWithMatches: matches.filter((m) => m.matches.length > 0).length,
        needsWithoutMatches: matches.filter((m) => m.matches.length === 0).length,
      },
    })
  } catch (error: any) {
    console.error('Error matching chef with farmers:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get matches' },
      { status: 500 }
    )
  }
}
