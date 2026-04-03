/**
 * /story page photography — add files under `public/images/story/` and set paths here.
 * `null` keeps gradient placeholders via HomepageBrandImage fallbacks.
 */
const DIR = '/images/story' as const

export const STORY_IMAGE_FILES = {
  hero: 'hero.png',
  transition: 'transition.png',
  community: 'community.png',
} as const

export type StoryImageSlot = keyof typeof STORY_IMAGE_FILES

export function storyImagePath(slot: StoryImageSlot): string {
  return `${DIR}/${STORY_IMAGE_FILES[slot]}`
}

export const storyImages: Record<StoryImageSlot, string | null> = {
  hero: storyImagePath('hero'),
  transition: null,
  community: null,
}
