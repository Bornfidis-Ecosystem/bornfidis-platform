export type MenuTemplateId =
  | 'intimate_caribbean'
  | 'gathering_experience'
  | 'retreat_celebration'

export interface MenuTemplate {
  id: MenuTemplateId
  name: string
  subtitle: string
  menuItems: string[]
  recommendedAddOns: string[]
}

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: 'intimate_caribbean',
    name: 'Intimate Caribbean Dining Experience',
    subtitle: 'Premium in-villa table hospitality, designed for warmth and presence.',
    menuItems: [
      'Welcome bites with tropical accents',
      'Chef-led starter with Caribbean depth',
      'Refined seafood or premium protein main',
      'Thoughtful sides rooted in island flavor',
      'Signature dessert finish',
    ],
    recommendedAddOns: ["Chef's welcome cocktail", 'Extra dessert upgrade'],
  },
  {
    id: 'gathering_experience',
    name: 'Gathering Experience',
    subtitle: 'A flowing table rhythm for celebrations, teams, and family gatherings.',
    menuItems: [
      'Light starters for mingling',
      'Main course built for sharing',
      'Seasonal sides and island-inspired finishing touches',
      'Family-style or buffet-style service flow',
      'Crowd-pleasing dessert finale',
    ],
    recommendedAddOns: ['Seafood or vegetarian option add-on', 'Late-night dessert'],
  },
  {
    id: 'retreat_celebration',
    name: 'Retreat & Celebration Table',
    subtitle: 'Structured hospitality for retreats, wellness groups, and multi-day events.',
    menuItems: [
      'Welcome bites to begin the gathering',
      'Multi-course plated experience (or hybrid option)',
      'Clean, nourishing sides with local produce focus',
      'Island-forward sauces and gourmet specials',
      'Celebration dessert with custom add-ons',
    ],
    recommendedAddOns: ['Custom sauce pairing flight', 'Celebration dessert plating'],
  },
]

export type PackageType = 'Intimate Dinner' | 'Gathering Experience' | 'Retreat/Celebration'
export const PACKAGE_TYPES: PackageType[] = [
  'Intimate Dinner',
  'Gathering Experience',
  'Retreat/Celebration',
]

export type ServiceStyle = 'Plated' | 'Buffet' | 'Drop-off'
export const SERVICE_STYLES: ServiceStyle[] = ['Plated', 'Buffet', 'Drop-off']

