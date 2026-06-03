#!/usr/bin/env node
/**
 * Copy and optimize academy cover images from _source to public/academy/covers/.
 * Run: npm run copy-academy-covers
 * Requires: place the 4 source PNGs in public/academy/covers/_source/ (see _source/README.txt).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const defaultSource = path.join(root, 'public', 'academy', 'covers', '_source')
const sourceDir = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultSource
const outDir = path.join(root, 'public', 'academy', 'covers')

// [output filename stem, dest file] — script will look for stem + .png, stem + _compressed.jpg, or stem + _compressed (1).jpg
const MAPPING = [
  ['regenerative_enterprise_foundations_cover', 'regenerative-enterprise-foundations.png'],
  ['regenerative_farmer_blueprint_cover', 'regenerative-farmer-blueprint.png'],
  ['vermont_contractor_foundations_cover', 'vermont-contractor-foundations.png'],
  ['jamaican_chef_enterprise_system_cover', 'jamaican-chef-enterprise-system.png'],
]

const SOURCE_CANDIDATES = (stem) => [
  `${stem}.png`,
  `${stem}_compressed.jpg`,
  `${stem}_compressed (1).jpg`,
]

const MAX_WIDTH = 1200
const PNG_COMPRESSION = 9

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function optimizeWithSharp(srcPath, destPath) {
  const sharp = (await import('sharp')).default
  const stat = await sharp(srcPath)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .png({ compressionLevel: PNG_COMPRESSION })
    .toFile(destPath)
  return stat
}

function copyFallback(srcPath, destPath) {
  fs.copyFileSync(srcPath, destPath)
}

async function main() {
  ensureDir(outDir)
  let usedSharp = false
  try {
    await import('sharp')
    usedSharp = true
  } catch {
    console.log('sharp not installed; copying without optimization. Add with: npm i -D sharp')
  }

  const parentDir = path.dirname(sourceDir) // covers/ when source is covers/_source

  for (const [sourceStem, destName] of MAPPING) {
    const candidates = SOURCE_CANDIDATES(sourceStem)
    let srcPath = null
    for (const name of candidates) {
      const inSource = path.join(sourceDir, name)
      const inParent = path.join(parentDir, name)
      if (fs.existsSync(inSource)) {
        srcPath = inSource
        break
      }
      if (fs.existsSync(inParent)) {
        srcPath = inParent
        break
      }
    }
    const destPath = path.join(outDir, destName)
    if (!srcPath) {
      console.warn(`Skip: no source found for ${destName} (tried ${candidates.join(', ')}) in _source/ or covers/`)
      continue
    }
    if (usedSharp) {
      await optimizeWithSharp(srcPath, destPath)
      console.log(`Optimized: ${destName}`)
    } else {
      copyFallback(srcPath, destPath)
      console.log(`Copied: ${destName}`)
    }
  }
  console.log('Done. Images are at /academy/covers/*.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
