/**
 * Load BBOS module Markdown from the repo allowlist only.
 */
import fs from 'fs'
import path from 'path'
import {
  getBbosModuleByKey,
  type BbosModuleEntry,
} from '@/lib/bbos-library-manifest'

export type LoadedBbosModule = {
  module: BbosModuleEntry
  markdown: string
}

/**
 * Resolve and read an allowlisted module file.
 * Rejects path escape attempts by resolving against cwd and verifying prefix.
 */
export function loadBbosModuleMarkdown(moduleKey: string): LoadedBbosModule | null {
  const mod = getBbosModuleByKey(moduleKey)
  if (!mod) return null

  const root = path.resolve(process.cwd())
  const contentRoot = path.resolve(root, 'content', 'bbos')
  const absolute = path.resolve(root, mod.relativePath)

  if (!absolute.startsWith(contentRoot + path.sep) && absolute !== contentRoot) {
    return null
  }

  // Defense in depth: never serve blueprints even if somehow mapped.
  if (absolute.includes('-blueprint.md') || path.basename(absolute).startsWith('.')) {
    return null
  }

  if (!fs.existsSync(absolute)) {
    return null
  }

  const markdown = fs.readFileSync(absolute, 'utf8')
  return { module: mod, markdown }
}
