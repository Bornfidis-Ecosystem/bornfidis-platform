'use server'

import { revalidatePath } from 'next/cache'
import { recalculateLeaderboard, setLeaderboardExcluded } from '@/lib/leaderboard'
import { getCurrentPrismaUser } from '@/lib/partner'

export async function recalculateLeaderboardAction(): Promise<{
  ok: boolean
  updated?: number
  error?: string
}> {
  try {
    const { updated } = await recalculateLeaderboard()
    revalidatePath('/admin/leaderboard')
    revalidatePath('/chefs/leaderboard')
    return { ok: true, updated }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Recalculate failed',
    }
  }
}

export async function setLeaderboardExcludedAction(
  chefId: string,
  excluded: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getCurrentPrismaUser()
    await setLeaderboardExcluded(chefId, excluded, user?.id ?? null)
    revalidatePath('/admin/leaderboard')
    revalidatePath('/chefs/leaderboard')
    return { ok: true }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Update failed',
    }
  }
}
