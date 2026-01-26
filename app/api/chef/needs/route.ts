import { NextRequest, NextResponse } from 'next/server'
import { requireChefAuth, getAuthenticatedChef } from '@/lib/chef-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

/**
 * Validation schema for chef needs
 */
const chefNeedSchema = z.object({
  crop: z.string().min(1, 'Crop name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'custom'], {
    errorMap: () => ({ message: 'Frequency must be weekly, biweekly, monthly, or custom' }),
  }),
  startDate: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }, 'Start date must be today or in the future'),
  endDate: z.string().optional(),
}).refine((data) => {
  if (!data.endDate) return true
  const endDate = new Date(data.endDate)
  const startDate = new Date(data.startDate)
  return endDate > startDate
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type ChefNeedInput = z.infer<typeof chefNeedSchema>

/**
 * POST /api/chef/needs
 * Create a new chef need
 * Restricted to authenticated chefs
 */
export async function POST(request: NextRequest) {
  try {
    // Check chef authentication
    const authError = await requireChefAuth(request)
    if (authError) return authError

    // Get authenticated chef
    const chef = await getAuthenticatedChef()
    if (!chef) {
      return NextResponse.json(
        { success: false, error: 'Chef authentication failed' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = chefNeedSchema.parse(body)

    // Create chef need
    const chefNeed = await db.chefNeed.create({
      data: {
        chefId: chef.chefId,
        crop: validated.crop,
        quantity: validated.quantity,
        frequency: validated.frequency,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
      },
    })

    return NextResponse.json({
      success: true,
      chefNeed: {
        id: chefNeed.id,
        chefId: chefNeed.chefId,
        crop: chefNeed.crop,
        quantity: chefNeed.quantity,
        frequency: chefNeed.frequency,
        startDate: chefNeed.startDate.toISOString().split('T')[0],
        endDate: chefNeed.endDate ? chefNeed.endDate.toISOString().split('T')[0] : null,
        createdAt: chefNeed.createdAt.toISOString(),
        updatedAt: chefNeed.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error creating chef need:', error)

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create chef need' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chef/needs
 * Get all needs for the authenticated chef
 * Restricted to authenticated chefs
 */
export async function GET(request: NextRequest) {
  try {
    // Check chef authentication
    const authError = await requireChefAuth(request)
    if (authError) return authError

    // Get authenticated chef
    const chef = await getAuthenticatedChef()
    if (!chef) {
      return NextResponse.json(
        { success: false, error: 'Chef authentication failed' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const crop = searchParams.get('crop')

    // Build where clause
    const where: any = {
      chefId: chef.chefId,
    }

    if (crop) {
      where.crop = { contains: crop, mode: 'insensitive' }
    }

    if (activeOnly) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.startDate = { lte: today }
      where.OR = [
        { endDate: null },
        { endDate: { gte: today } },
      ]
    }

    // Fetch chef needs
    const chefNeeds = await db.chefNeed.findMany({
      where,
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      chefNeeds: chefNeeds.map((need) => ({
        id: need.id,
        chefId: need.chefId,
        crop: need.crop,
        quantity: need.quantity,
        frequency: need.frequency,
        startDate: need.startDate.toISOString().split('T')[0],
        endDate: need.endDate ? need.endDate.toISOString().split('T')[0] : null,
        createdAt: need.createdAt.toISOString(),
        updatedAt: need.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching chef needs:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chef needs' },
      { status: 500 }
    )
  }
}
