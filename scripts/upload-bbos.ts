// scripts/upload-bbos.ts
//
// Operations-only. Uploads the paid BBOS package to the PRIVATE Supabase
// Storage bucket used for digital-product delivery.
//
// This script is intentionally NOT wired into build / install / seed / deploy.
// Run it manually and explicitly:
//
//   npx tsx scripts/upload-bbos.ts <path-to-bbos.zip> [--upsert]
//
// If no path argument is supplied, it falls back to the documented local
// constant below. It never prints credentials or signed URLs.
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const BUCKET = 'academy-products'
const OBJECT_PATH =
  'bornfidis-business-operating-system/v1/bornfidis-business-operating-system-v1.zip'

// Documented default source location if no CLI path argument is supplied.
const DEFAULT_LOCAL_ZIP = path.join(
  process.cwd(),
  'storage/bbos/bornfidis-business-operating-system-v1.zip',
)

const MAX_ZIP_BYTES = 209715200 // 200MB — paid ZIP packages

function resolveLocalZip(): string {
  const arg = process.argv[2]
  const argPath = arg && !arg.startsWith('--') ? arg : null
  return argPath ? path.resolve(argPath) : DEFAULT_LOCAL_ZIP
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Missing env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
    )
    process.exit(1)
  }

  const localZip = resolveLocalZip()
  if (!fs.existsSync(localZip)) {
    console.error(`BBOS ZIP not found at: ${localZip}`)
    console.error('Pass an explicit path: npx tsx scripts/upload-bbos.ts <path-to-bbos.zip>')
    process.exit(1)
  }

  const allowUpsert = process.argv.includes('--upsert')
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Only create the bucket if it does not already exist. Never flip an existing
  // bucket to public.
  const { data: existingBucket } = await supabase.storage.getBucket(BUCKET)
  if (!existingBucket) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_ZIP_BYTES,
    })
    if (createErr && !createErr.message.includes('already exists')) {
      console.error('Bucket create failed:', createErr.message)
      process.exit(1)
    }
    console.log(`✓ Created private bucket: ${BUCKET}`)
  } else {
    console.log(`• Bucket already exists (left unchanged): ${BUCKET}`)
  }

  const fileBuffer = fs.readFileSync(localZip)
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT_PATH, fileBuffer, {
      contentType: 'application/zip',
      upsert: allowUpsert,
    })

  if (uploadErr) {
    if (!allowUpsert && /exist/i.test(uploadErr.message)) {
      console.error(
        `Object already exists at ${OBJECT_PATH}. Re-run with --upsert to overwrite.`,
      )
    } else {
      console.error('Upload failed:', uploadErr.message)
    }
    process.exit(1)
  }

  console.log(`✓ Uploaded BBOS package → ${BUCKET}/${OBJECT_PATH}`)
  console.log('  Delivery is entitlement-gated via /api/academy/download/[slug].')
}

main()
