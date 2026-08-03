// scripts/upload-bbos.ts
//
// Operations-only. Uploads a BBOS ZIP to the PRIVATE academy-products bucket.
// Default: Tools Bundle. Full Package path is reserved and must be passed
// explicitly with --full-package (still does not build the real package).
//
//   npx tsx scripts/upload-bbos.ts [path-to.zip] [--upsert] [--allow-production]
//   npx tsx scripts/upload-bbos.ts --tools-bundle [--upsert]
//
// Not wired into build / install / seed / deploy.
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  ACADEMY_PRODUCTS_BUCKET,
  assertAllowedStorageTarget,
  ensureAcademyProductsBucket,
  getServiceRoleClient,
  inspectAcademyBucket,
} from './academy-storage-bucket'

dotenv.config({ path: '.env.local' })

const TOOLS_BUNDLE_OBJECT =
  'bornfidis-business-operating-system/v1/bbos-tools-bundle-v1.zip'
const FULL_PACKAGE_OBJECT =
  'bornfidis-business-operating-system/v1/bornfidis-business-operating-system-v1.zip'

const DEFAULT_TOOLS_BUNDLE = path.join(
  process.cwd(),
  'storage/bbos/BBOS-Tools-Bundle-v1.zip',
)

function resolveLocalZip(): { localPath: string; objectPath: string; label: string } {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const wantFull = process.argv.includes('--full-package')
  if (wantFull) {
    console.error(
      'Refusing --full-package upload in this pass: Full Package is reserved and unavailable until built.',
    )
    process.exit(1)
  }
  const localPath = args[0] ? path.resolve(args[0]) : DEFAULT_TOOLS_BUNDLE
  return {
    localPath,
    objectPath: TOOLS_BUNDLE_OBJECT,
    label: 'BBOS Tools Bundle',
  }
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

  const allowProduction = process.argv.includes('--allow-production')
  const { ref, isProduction } = assertAllowedStorageTarget(url, { allowProduction })
  console.log(`• Target Supabase project: ${ref}${isProduction ? ' (PRODUCTION)' : ' (non-prod)'}`)

  const { localPath, objectPath, label } = resolveLocalZip()
  if (objectPath === FULL_PACKAGE_OBJECT) {
    console.error('Refusing to upload to reserved Full Package path')
    process.exit(1)
  }
  if (!fs.existsSync(localPath)) {
    console.error(`ZIP not found at: ${localPath}`)
    console.error('Build first: python scripts/build-bbos-tools-bundle.py')
    process.exit(1)
  }

  const allowUpsert = process.argv.includes('--upsert')
  const fileBuffer = fs.readFileSync(localPath)
  const client = getServiceRoleClient(url, key)

  const before = await inspectAcademyBucket(client)
  if (before) {
    console.log('• Existing bucket inspection:', {
      name: before.name,
      public: before.public,
      fileSizeLimit: before.fileSizeLimit,
    })
  }

  const { created, bucket } = await ensureAcademyProductsBucket(client, {
    uploadBytes: fileBuffer.byteLength,
  })
  console.log(
    created
      ? `✓ Created private bucket: ${ACADEMY_PRODUCTS_BUCKET}`
      : `• Bucket already exists (left unchanged): ${ACADEMY_PRODUCTS_BUCKET}`,
  )
  console.log('• Bucket config:', {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
  })

  const { error: uploadErr } = await client.storage
    .from(ACADEMY_PRODUCTS_BUCKET)
    .upload(objectPath, fileBuffer, {
      contentType: 'application/zip',
      upsert: allowUpsert,
    })

  if (uploadErr) {
    if (!allowUpsert && /exist/i.test(uploadErr.message)) {
      console.error(
        `Object already exists at ${objectPath}. Re-run with --upsert to overwrite.`,
      )
    } else {
      console.error('Upload failed:', uploadErr.message)
    }
    process.exit(1)
  }

  console.log(`✓ Uploaded ${label} → ${ACADEMY_PRODUCTS_BUCKET}/${objectPath}`)
  console.log('  Delivery is entitlement-gated via /api/academy/download/[slug]?asset=tools-bundle')
  console.log('  Never log signed URLs.')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
