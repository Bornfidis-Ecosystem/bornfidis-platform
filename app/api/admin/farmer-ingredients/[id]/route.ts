import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Phase 6B: Delete farmer ingredient
 * DELETE /api/admin/farmer-ingredients/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth()
        const { id } = params

        const { error } = await supabaseAdmin
            .from('farmer_ingredients')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting farmer ingredient:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to remove ingredient' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Ingredient removed from farmer',
        })
    } catch (error: any) {
        console.error('Error deleting farmer ingredient:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to remove ingredient' },
            { status: 500 }
        )
    }
}
