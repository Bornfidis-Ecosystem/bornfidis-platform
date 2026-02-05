'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Chef, ChefStatus } from '@/types/chef'
import { ChefTier } from '@prisma/client'

/**
 * Phase 5A: Get all chefs
 */
export async function getAllChefs(): Promise<{
    success: boolean
    chefs?: Chef[]
    error?: string
}> {
    await requireAuth()

    try {
        const { data, error } = await supabaseAdmin
            .from('chefs')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching chefs:', error)
            // If chefs table doesn't exist in Supabase yet (schema cache / table not found), return empty instead of failing the page
            const msg = error.message || ''
            if (msg.includes('Could not find the table') || msg.includes('schema cache') || msg.includes('does not exist')) {
                return { success: true, chefs: [] }
            }
            return { success: false, error: error.message || 'Failed to fetch chefs' }
        }

        return { success: true, chefs: data as Chef[] }
    } catch (error: any) {
        console.error('Error in getAllChefs:', error)
        return { success: false, error: error.message || 'Failed to fetch chefs' }
    }
}

/**
 * Phase 5A: Get chef by ID
 */
export async function getChefById(chefId: string): Promise<{
    success: boolean
    chef?: Chef
    error?: string
}> {
    await requireAuth()

    try {
        const { data, error } = await supabaseAdmin
            .from('chefs')
            .select('*')
            .eq('id', chefId)
            .single()

        if (error) {
            console.error('Error fetching chef:', error)
            return { success: false, error: error.message || 'Chef not found' }
        }

        return { success: true, chef: data as Chef }
    } catch (error: any) {
        console.error('Error in getChefById:', error)
        return { success: false, error: error.message || 'Failed to fetch chef' }
    }
}

/**
 * Phase 5A: Get active chefs (for assignment dropdown)
 */
export async function getActiveChefs(): Promise<{
    success: boolean
    chefs?: Chef[]
    error?: string
}> {
    await requireAuth()

    try {
        const { data, error } = await supabaseAdmin
            .from('chefs')
            .select('id, name, email, status, payout_percentage')
            .in('status', ['active', 'approved']) // Include approved chefs who can be assigned
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching active chefs:', error)
            return { success: false, error: error.message || 'Failed to fetch chefs' }
        }

        return { success: true, chefs: data as Chef[] }
    } catch (error: any) {
        console.error('Error in getActiveChefs:', error)
        return { success: false, error: error.message || 'Failed to fetch chefs' }
    }
}

/**
 * Phase 2S: Set chef tier override (admin). Pass null to clear override and use computed tier.
 */
export async function setChefTierOverride(
    chefId: string,
    tier: ChefTier | null
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    try {
        if (tier === null) {
            await db.chefProfile.updateMany({
                where: { userId: chefId },
                data: { tierOverride: null },
            })
            return { success: true }
        }
        await db.chefProfile.upsert({
            where: { userId: chefId },
            create: { userId: chefId, tier: ChefTier.STANDARD, tierOverride: tier },
            update: { tierOverride: tier },
        })
        return { success: true }
    } catch (e: any) {
        console.error('setChefTierOverride:', e)
        return { success: false, error: e.message || 'Failed to update tier' }
    }
}

/**
 * Phase 2T: Resend monthly statement email to a chef (admin only).
 */
export async function resendChefStatement(
    chefId: string,
    year: number,
    month: number
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    const { getStatementDataForChefMonth } = await import('@/lib/chef-statements')
    const { sendChefMonthlyStatementEmail } = await import('@/lib/email')
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { ChefStatementPdfDocument } = await import('@/components/pdf/ChefStatementPdf')

    const statement = await getStatementDataForChefMonth(chefId, year, month)
    if (!statement) {
        return { success: false, error: 'No paid jobs for that month' }
    }
    const pdfBuffer = await renderToBuffer(ChefStatementPdfDocument({ statement }))
    const filename = `Chef-Statement-${year}-${String(month).padStart(2, '0')}.pdf`
    const result = await sendChefMonthlyStatementEmail({
        to: statement.chefEmail,
        chefName: statement.chefName,
        monthLabel: statement.monthLabel,
        pdfBuffer: Buffer.from(pdfBuffer),
        filename,
    })
    return result
}

/**
 * Phase 2U: Hide or unhide a review (admin moderation).
 */
export async function setReviewHidden(
    reviewId: string,
    hidden: boolean
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    try {
        await db.review.update({
            where: { id: reviewId },
            data: { hidden },
        })
        return { success: true }
    } catch (e: any) {
        console.error('setReviewHidden:', e)
        return { success: false, error: e.message || 'Failed to update review' }
    }
}

/**
 * Phase 2W: Flag chef for coaching (admin). v1: no persistence; can wire to email/workflow later.
 */
export async function flagChefForCoaching(chefId: string): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    try {
        // TODO: persist (e.g. chef_coaching_flags table or ChefProfile column) and/or send email
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed' }
    }
}

/**
 * Phase 2W: Require refresher education for chef (admin). v1: no persistence; can wire later.
 */
export async function requireChefRefresherEducation(chefId: string): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    try {
        // TODO: persist and/or assign education module / send email
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed' }
    }
}

/**
 * Phase 2X: Set chef featured (admin). Max 5 featured; admin can override eligibility.
 */
export async function setChefFeaturedAction(
    chefId: string,
    featured: boolean,
    adminOverride: boolean
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    const { setChefFeatured } = await import('@/lib/featured-chefs')
    return setChefFeatured(chefId, featured, adminOverride)
}

/**
 * Phase 2X: Remove featured from chefs no longer eligible (no admin override). For weekly review.
 */
export async function removeIneligibleFeaturedAction(): Promise<{ success: boolean; removed: string[]; error?: string }> {
    await requireAuth()
    try {
        const { removeIneligibleFeatured } = await import('@/lib/featured-chefs')
        const { removed } = await removeIneligibleFeatured()
        return { success: true, removed }
    } catch (e: any) {
        return { success: false, removed: [], error: e.message || 'Failed' }
    }
}

/**
 * Phase 2AI: Admin override for chef payout currency (USD, JMD, EUR, GBP). Pass null to clear override.
 */
export async function setChefPayoutCurrencyOverride(
    chefId: string,
    currency: string | null
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    const { isSupportedCurrency } = await import('@/lib/currency')
    if (currency != null && !isSupportedCurrency(currency)) {
        return { success: false, error: 'Unsupported currency' }
    }
    try {
        const { db } = await import('@/lib/db')
        await db.chefProfile.upsert({
            where: { userId: chefId },
            create: { userId: chefId, payoutCurrencyOverride: currency ?? undefined },
            update: { payoutCurrencyOverride: currency ?? undefined },
        })
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed' }
    }
}

/**
 * Phase 2AF: Resend annual tax summary email to a chef (admin only). Read-only; no edits after generation.
 */
export async function resendChefTaxSummary(
    chefId: string,
    year: number
): Promise<{ success: boolean; error?: string }> {
    await requireAuth()
    const { getChefTaxSummaryData } = await import('@/lib/chef-tax-summary')
    const { sendChefTaxSummaryEmail } = await import('@/lib/email')
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { ChefTaxSummaryPdfDocument } = await import('@/components/pdf/ChefTaxSummaryPdf')

    const data = await getChefTaxSummaryData(chefId, year)
    if (!data) {
        return { success: false, error: 'No paid jobs for that year' }
    }
    const pdfBuffer = await renderToBuffer(ChefTaxSummaryPdfDocument({ data }))
    const filename = `Chef-Tax-Summary-${year}.pdf`
    return sendChefTaxSummaryEmail({
        to: data.chefEmail,
        chefName: data.chefName,
        year,
        pdfBuffer: Buffer.from(pdfBuffer),
        filename,
    })
}
