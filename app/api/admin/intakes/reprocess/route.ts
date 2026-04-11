export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseFarmerMessage, type ParsedFarmerMessage } from '@/lib/intakeParser'
import { logActivity } from '@/lib/activity-log'

/**
 * Phase 11G.2: Reprocess Farmer Intake
 * POST /api/admin/intakes/reprocess
 * 
 * Re-runs parsing and farmer linking on an existing intake
 * 
 * Body:
 * - intakeId: string (required)
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - intake: updated intake data
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAuth()

    const body = await request.json()
    const { intakeId } = body

    if (!intakeId || typeof intakeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'intakeId is required' },
        { status: 400 }
      )
    }

    // Fetch the intake
    const intake = await db.farmerIntake.findUnique({
      where: { id: intakeId },
    })

    if (!intake) {
      return NextResponse.json(
        { success: false, error: 'Intake not found' },
        { status: 404 }
      )
    }

    const phone = intake.fromPhone
    const messageText = intake.messageText || intake.transcript || ''

    console.log(`🔄 Reprocessing intake ${intakeId} for phone ${phone}`)

    // Step 1: Parse the message
    console.log('🔍 Parsing message...')
    const parsed: ParsedFarmerMessage = parseFarmerMessage(messageText)
    
    console.log('📊 Parsed result:', {
      name: parsed.name,
      parish: parsed.parish,
      acres: parsed.acres,
      cropsCount: parsed.crops.length,
      confidence: parsed.confidence,
    })

    // Step 2: Upsert Farmer by phone number
    console.log('👤 Upserting Farmer by phone...')
    
    let farmer = await db.farmer.findUnique({
      where: { phone },
    })

    if (farmer) {
      // Update existing farmer if parser provides missing values
      const updateData: {
        name?: string
        parish?: string | null
        acres?: number | null
      } = {}

      // Update name if it's "Unknown Farmer" and parser found a name
      if ((farmer.name === 'Unknown Farmer' || !farmer.name) && parsed.name) {
        updateData.name = parsed.name
      }
      // Update parish if missing and parser found one
      if (!farmer.parish && parsed.parish) {
        updateData.parish = parsed.parish
      }
      // Update acres if missing and parser found one
      if (farmer.acres === null && parsed.acres !== null) {
        updateData.acres = parsed.acres
      }

      if (Object.keys(updateData).length > 0) {
        farmer = await db.farmer.update({
          where: { id: farmer.id },
          data: updateData,
        })
        console.log('✅ Updated existing Farmer:', farmer.id, updateData)
      } else {
        console.log('ℹ️ Farmer exists, no updates needed:', farmer.id)
      }
    } else {
      // Create new farmer
      farmer = await db.farmer.create({
        data: {
          phone,
          name: parsed.name || 'Unknown Farmer',
          parish: parsed.parish || null,
          farm_size_acres: parsed.acres != null ? parsed.acres : null,
          crops_available: [],
          tags: [],
        },
      })
      console.log('✅ Created new Farmer:', farmer.id, { name: farmer.name })
      logActivity({
        type: 'FARMER_SIGNUP',
        title: 'Farmer joined',
        description: `${farmer.name}${farmer.parish ? ` from ${farmer.parish}` : ''}`,
        division: 'PROJU',
        metadata: { farmerId: farmer.id },
      }).catch(() => {})
    }

    const farmerId = farmer.id

    // Step 3: Create FarmerCrop records for each parsed crop
    if (parsed.crops.length > 0) {
      console.log('🌾 Creating FarmerCrop records...', parsed.crops)
      
      for (const crop of parsed.crops) {
        try {
          await db.farmerCrop.create({
            data: {
              farmerId: farmer.id,
              crop: crop,
            },
          })
          console.log('✅ Created FarmerCrop:', crop)
        } catch (cropError: any) {
          // Skip duplicates (unique constraint violation)
          if (cropError.code === 'P2002') {
            console.log('ℹ️ Crop already exists, skipping:', crop)
          } else {
            console.error('❌ Error creating FarmerCrop:', crop, cropError.message)
          }
        }
      }
    } else {
      console.log('ℹ️ No crops to create')
    }

    // Step 4: Determine status based on farmer linking and data quality
    let status: 'parsed' | 'profile_created' | 'needs_review' = 'parsed'
    
    // If farmer was successfully linked, mark as profile_created
    if (farmerId) {
      // Check if we need review due to low confidence and missing data
      const hasLowQualityData = parsed.confidence === 'low' && 
                                 parsed.crops.length === 0 && 
                                 !parsed.parish && 
                                 !parsed.acres &&
                                 !parsed.name
      
      if (hasLowQualityData) {
        status = 'needs_review'
        console.log('⚠️ Low quality data detected, marking for review')
      } else {
        status = 'profile_created'
        console.log('✅ Good quality data, profile created')
      }
    } else {
      // No farmer linked (shouldn't happen, but handle edge case)
      if (parsed.confidence === 'low' && parsed.crops.length === 0 && !parsed.parish && !parsed.acres) {
        status = 'needs_review'
      }
    }

    // Step 5: Update FarmerIntake with parsed data and status
    const updatedIntake = await db.farmerIntake.update({
      where: { id: intakeId },
      data: {
        farmerId: farmerId,
        parsedJson: parsed as any, // Prisma Json type
        status: status,
        error: null, // Clear any previous errors
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            parish: true,
          },
        },
      },
    })

    console.log('✅ Updated FarmerIntake:', {
      intakeId,
      farmerId,
      status,
    })

    return NextResponse.json({
      success: true,
      message: 'Intake reprocessed successfully',
      intake: {
        id: updatedIntake.id,
        status: updatedIntake.status,
        farmerId: updatedIntake.farmerId,
        farmer: updatedIntake.farmer,
      },
    })

  } catch (error: any) {
    console.error('❌ Error reprocessing intake:', {
      error: error.message,
      stack: error.stack,
    })

    // If it's an auth error, return 401
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reprocess intake' },
      { status: 500 }
    )
  }
}
