/**
 * Operations-only. Upload individual BBOS downloadable assets to the private
 * academy-products bucket. Not wired into build/install/seed/deploy.
 *
 *   npx tsx scripts/upload-bbos-assets.ts <assetId> <local-file> [--upsert] [--allow-production]
 *
 * assetId: calculator | weekly-rhythm-workbook
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { getBbosAssetByQueryId } from '../lib/bbos-library-manifest'
import {
  ACADEMY_PRODUCTS_BUCKET,
  assertAllowedStorageTarget,
  ensureAcademyProductsBucket,
  getServiceRoleClient,
  inspectAcademyBucket,
} from './academy-storage-bucket'

dotenv.config({ path: '.env.local' })

async function main() {
  const assetId = process.argv[2]
  const localArg = process.argv[3]
  const allowUpsert = process.argv.includes('--upsert')
  const allowProduction = process.argv.includes('--allow-production')

  if (!assetId || !localArg || assetId.startsWith('--') || localArg.startsWith('--')) {
    console.error(
      'Usage: npx tsx scripts/upload-bbos-assets.ts <calculator|weekly-rhythm-workbook> <local-file> [--upsert] [--allow-production]',
    )
    process.exit(1)
  }

  if (assetId === 'full-package' || assetId === 'tools-bundle') {
    console.error('Use scripts/upload-bbos.ts for ZIP packages')
    process.exit(1)
  }

  const asset = getBbosAssetByQueryId(assetId)
  if (!asset || !asset.available) {
    console.error(`Unknown or unavailable asset id: ${assetId}`)
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const { ref, isProduction } = assertAllowedStorageTarget(url, { allowProduction })
  console.log(`• Target Supabase project: ${ref}${isProduction ? ' (PRODUCTION)' : ' (non-prod)'}`)

  const localPath = path.resolve(localArg)
  if (!fs.existsSync(localPath)) {
    console.error(`File not found: ${localPath}`)
    process.exit(1)
  }

  const buf = fs.readFileSync(localPath)
  const client = getServiceRoleClient(url, key)

  const existing = await inspectAcademyBucket(client)
  if (existing) {
    console.log('• Existing bucket inspection:', {
      name: existing.name,
      public: existing.public,
      fileSizeLimit: existing.fileSizeLimit,
    })
  }

  await ensureAcademyProductsBucket(client, { uploadBytes: buf.byteLength })

  const contentType = asset.customerFilename.endsWith('.xlsx')
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/octet-stream'

  const { error } = await client.storage
    .from(ACADEMY_PRODUCTS_BUCKET)
    .upload(asset.storageObjectPath, buf, {
      contentType,
      upsert: allowUpsert,
    })

  if (error) {
    console.error('Upload failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ Uploaded → ${ACADEMY_PRODUCTS_BUCKET}/${asset.storageObjectPath}`)
  console.log(`  Customer filename: ${asset.customerFilename}`)
  console.log('  Never log signed URLs. Delivery is entitlement-gated.')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
