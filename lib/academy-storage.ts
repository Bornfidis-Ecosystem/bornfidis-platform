/**
 * Private Academy product storage: slug -> filename in storage/academy-products/.
 * Only products listed here are served by the secure download API.
 */
const ACADEMY_STORAGE_FILES: Record<string, string> = {
  'regenerative-enterprise-foundations': 'regenerative_enterprise_foundations_manual.pdf',
  'regenerative-farmer-blueprint': 'regenerative_farmer_blueprint.pdf',
  'vermont-contractor-foundations': 'vermont_contractor_foundations_manual.pdf',
  'jamaican-chef-enterprise-system': 'jamaican_chef_enterprise_system.pdf',
}

export function getAcademyStorageFilename(slug: string): string | undefined {
  return ACADEMY_STORAGE_FILES[slug]
}

export function hasAcademyStorageFile(slug: string): boolean {
  return slug in ACADEMY_STORAGE_FILES
}
