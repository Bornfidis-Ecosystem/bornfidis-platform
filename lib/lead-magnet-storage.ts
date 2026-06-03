// lib/lead-magnet-storage.ts
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'lead-magnets'

const slugToFilename: Record<string, string> = {
  '5-caribbean-sauces': '5-caribbean-sauces.pdf',
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key)
}

export function getLeadMagnetFilename(slug: string): string | null {
  return slugToFilename[slug] ?? null
}

export async function readLeadMagnetFile(slug: string): Promise<Buffer | null> {
  const filename = getLeadMagnetFilename(slug)
  if (!filename) return null

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(filename)

    if (error || !data) {
      console.error('[lead-magnet-storage] Supabase download error:', error)
      return null
    }

    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error('[lead-magnet-storage] Failed to read lead magnet file:', err instanceof Error ? err.message : err)
    return null
  }
}
