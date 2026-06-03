// scripts/upload-lead-magnet.ts
// Run with: npx tsx scripts/upload-lead-magnet.ts
// (or: npm run upload-lead-magnet)
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const BUCKET = 'lead-magnets'
const LEAD_MAGNET_DIR = path.join(process.cwd(), 'storage/lead-magnet')
const REMOTE_FILENAME = '5-caribbean-sauces.pdf'

// Try these local filenames in order (API always expects remote name 5-caribbean-sauces.pdf)
const LOCAL_CANDIDATES = ['Bornfidis_5_Caribbean_Sauces.pdf', '5-caribbean-sauces.pdf']

function findLocalPdf(): string | null {
  for (const name of LOCAL_CANDIDATES) {
    const fullPath = path.join(LEAD_MAGNET_DIR, name)
    if (fs.existsSync(fullPath)) return fullPath
  }
  return null
}

async function upload() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const localPdf = findLocalPdf()
  if (!localPdf) {
    console.error(`No PDF found in ${LEAD_MAGNET_DIR}`)
    console.error('Add one of: Bornfidis_5_Caribbean_Sauces.pdf or 5-caribbean-sauces.pdf')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  // Create bucket if it doesn't exist
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: false, // private — files only served via signed URL or server
    fileSizeLimit: 52428800, // 50MB max
  })
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Bucket error:', bucketError)
    process.exit(1)
  }

  const fileBuffer = fs.readFileSync(localPdf)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(REMOTE_FILENAME, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true, // overwrite if re-uploading a new version
    })

  if (error) {
    console.error('Upload failed:', error)
    process.exit(1)
  }

  console.log(`✓ Uploaded: ${REMOTE_FILENAME} → supabase/${BUCKET}/`)
  console.log('  The API will now serve it without a local file.')
}

upload()
