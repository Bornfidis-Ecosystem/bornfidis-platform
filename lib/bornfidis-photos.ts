/**
 * Bornfidis marketing photography — paths under `public/images/bornfidis-*`.
 * Hero slots use premium hospitality; Royal Caribbean legacy lives in story credibility only.
 */
export const bornfidisPhotos = {
  founder: {
    kitchenHero: '/images/bornfidis-founder/brian-kitchen-black-coat.jpg',
    kitchenCap: '/images/bornfidis-founder/brian-kitchen-chef-cap.png',
    suitPortrait: '/images/bornfidis-founder/brian-founder-suit-portrait.png',
    rclWhites2007: '/images/bornfidis-founder/brian-rcl-whites-2007.png',
    azamaraVest: '/images/bornfidis-founder/brian-azamara-vest.png',
    romeColosseum: '/images/bornfidis-founder/brian-rome-colosseum.png',
  },
  events: {
    servicePlating: '/images/bornfidis-events/brian-service-plating.png',
    platesServiceRow: '/images/bornfidis-events/plates-service-row.png',
    rcGuestsDining: '/images/bornfidis-events/brian-rc-guests-dining.jpg',
    rcGalleySaute: '/images/bornfidis-events/brian-rc-galley-saute.png',
    rcDiningTrick: '/images/bornfidis-events/brian-rc-dining-trick.png',
    rcMediterraneanBoat: '/images/bornfidis-events/brian-rc-mediterranean-boat.png',
  },
  food: {
    grilledFishOrchid: '/images/bornfidis-food/grilled-fish-orchid.png',
    cremeBrulee: '/images/bornfidis-food/creme-brulee.png',
    oystersOnIce: '/images/bornfidis-food/oysters-on-ice.png',
    seasonalSalad: '/images/bornfidis-food/seasonal-salad-watermelon-radish.png',
    guestPlatedChicken: '/images/bornfidis-food/guest-plated-chicken.jpg',
    guestPlatedCourse: '/images/bornfidis-food/guest-plated-course.jpg',
  },
  table: {
    vermontCabin: '/images/bornfidis-table/vermont-table-cabin.jpg',
  },
  jamaica: {
    portAntonioBayView: '/images/bornfidis-jamaica/port-antonio-bay-view.jpg',
    portAntonioMarina: '/images/bornfidis-jamaica/port-antonio-marina.jpg',
    portAntonioPier: '/images/bornfidis-jamaica/port-antonio-pier.jpg',
    portAntonioRainbowRoad: '/images/bornfidis-jamaica/port-antonio-rainbow-road.jpg',
  },
} as const

/** Royal Caribbean era — story/credibility sections only, never homepage or service heroes. */
export const rcCredibilityGallery = [
  {
    src: bornfidisPhotos.founder.azamaraVest,
    alt: 'Brian Maylor in Royal Caribbean Azamara service vest — luxury tier credentials',
  },
  {
    src: bornfidisPhotos.events.rcGuestsDining,
    alt: 'Brian Maylor with guests in a Royal Caribbean dining room — thirteen years of table service',
  },
  {
    src: bornfidisPhotos.events.rcGalleySaute,
    alt: 'Brian Maylor in the galley, sautéing corn and peppers — Royal Caribbean kitchen years',
  },
  {
    src: bornfidisPhotos.events.rcDiningTrick,
    alt: 'Brian Maylor at the dining room table — guest connection aboard ship',
  },
] as const
