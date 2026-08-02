/**
 * Operations-only. Upload individual BBOS downloadable assets to the private
 * academy-products bucket. Not wired into build/install/seed/deploy.
 *
 *   npx tsx scripts/upload-bbos-assets.ts <assetId> <local-file> [--upsert]
 *
 * assetId: calculator | weekly-rhythm-workbook
 *
 * Do not upload real customer assets until authorized after code review.
 * For signing smoke tests only, a small placeholder file may be used in
 * non-production.
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { getBbosAssetByQueryId } from '../lib/bbos-library-manifest'

dotenv.config({ path: '.env.local' })

const BUCKET = 'academy-products'
const MAX_BYTES = 50 * 1024 * 1024

async function main() {
  const assetId = process.argv[2]
  const localArg = process.argv[3]
  const allowUpsert = process.argv.includes('--upsert')

  if (!assetId || !localArg || assetId.startsWith('--') || localArg.startsWith('--')) {
    console.error(
      'Usage: npx tsx scripts/upload-bbos-assets.ts <calculator|weekly-rhythm-workbook> <local-file> [--upsert]',
    )
    process.exit(1)
  }

  const asset = getBbosAssetByQueryId(assetId)
  if (!asset) {
    console.error(`Unknown asset id: ${assetId}`)
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const localPath = path.resolve(localArg)
  if (!fs.existsSync(localPath)) {
    console.error(`File not found: ${localPath}`)
    process.exit(1)
  }

  const buf = fs.readFileSync(localPath)
  if (buf.byteLength > MAX_BYTES) {
    console.error('File exceeds max size')
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const contentType =
    asset.customerFilename.endsWith('.xlsx')
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/octet-stream'

  const { error } = await supabase.storage.from(BUCKET).upload(asset.storageObjectPath, buf, {
    contentType,
    upsert: allowUpsert,
  })

  if (error) {
    console.error('Upload failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ Uploaded → ${BUCKET}/${asset.storageObjectPath}`)
  console.log(`  Customer filename: ${asset.customerFilename}`)
  console.log('  Never log signed URLs. Delivery is entitlement-gated.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
