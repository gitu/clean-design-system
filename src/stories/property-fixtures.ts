/**
 * Demo data for the property-search patterns.
 *
 * Kept apart from `fixtures.ts`, which is a newspaper archive and is what the
 * rest of this Storybook is built on. The two cases want different things: an
 * archive is a long tail of documents nobody owns, whereas a property search is
 * a small working set a team argues over — so this data carries a pipeline
 * status, a rating and a viewing history, and the archive's does not.
 *
 * Modelled on the Swiss market: prices in CHF, rooms counted in halves, area in
 * square metres, cantons as the coarse geography.
 */

export type ListingType = 'sale' | 'rent' | 'auction'

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'loft'
  | 'studio'
  | 'chalet'
  | 'land'
  | 'commercial'

/** The market's view: what the seller says the listing is doing. */
export type MarketStatus = 'available' | 'under_offer' | 'sold' | 'withdrawn'

/**
 * The team's own view, which is a different axis entirely — a flat can be
 * `available` on the portal and `rejected` by the people looking at it.
 */
export type TriageStatus = 'new' | 'interested' | 'rejected' | 'applied'

export interface Listing {
  id: string
  slug: string
  title: string
  snippet: string
  street: string
  city: string
  canton: string
  listingType: ListingType
  propertyType: PropertyType
  status: MarketStatus
  triageStatus: TriageStatus
  /** Monthly for a rental, total for a sale. */
  price: number
  /** Swiss listings count half rooms, so this is not an integer. */
  rooms: number
  livingSpace: number
  plotSize?: number
  floor?: number
  yearBuilt: number
  /** 1–5, set by the team rather than by the portal. Absent until someone rates it. */
  rating?: number
  /** Completed viewings. */
  viewingCount: number
  lastViewedAt?: string
  listedAt: string
  portal: string
  /** How well it matches the team's search brief, 0–1. */
  briefMatch: number
  imageCount: number
  archived?: boolean
}

/**
 * The one the detail pattern opens. Named rather than reached for as
 * `LISTINGS[0]`, so a story reads as being about a particular flat and the type
 * stays non-optional under `noUncheckedIndexedAccess`.
 */
export const FEATURED_LISTING: Listing = {
  id: 'p-a1b2c3',
  slug: 'seefeld-attic-conversion',
  title: 'Attic conversion above the Seefeld tramline',
  snippet:
    'Two former servants’ rooms opened into one, with the original roof timbers left exposed. South-facing, which in this street means afternoon light until late. The lift stops one floor below.',
  street: 'Seefeldstrasse 114',
  city: 'Zürich',
  canton: 'ZH',
  listingType: 'rent',
  propertyType: 'apartment',
  status: 'available',
  triageStatus: 'interested',
  price: 3450,
  rooms: 3.5,
  livingSpace: 96,
  floor: 4,
  yearBuilt: 1908,
  rating: 4,
  viewingCount: 1,
  lastViewedAt: '2026-08-14',
  listedAt: '2026-08-02',
  portal: 'Homegate',
  briefMatch: 0.91,
  imageCount: 12,
}

export const LISTINGS: Listing[] = [
  FEATURED_LISTING,
  {
    id: 'p-d4e5f6',
    slug: 'wipkingen-riverside-flat',
    title: 'Riverside flat with a balcony over the Limmat',
    snippet:
      'The balcony is the whole argument for this one: it runs the full width of the flat and looks straight down the river. Interior is dated but sound, and the kitchen was replaced in 2019.',
    street: 'Wasserwerkstrasse 87',
    city: 'Zürich',
    canton: 'ZH',
    listingType: 'rent',
    propertyType: 'apartment',
    status: 'available',
    triageStatus: 'applied',
    price: 2980,
    rooms: 3.5,
    livingSpace: 88,
    floor: 2,
    yearBuilt: 1964,
    rating: 5,
    viewingCount: 2,
    lastViewedAt: '2026-08-21',
    listedAt: '2026-07-28',
    portal: 'ImmoScout24',
    briefMatch: 0.88,
    imageCount: 18,
  },
  {
    id: 'p-g7h8i9',
    slug: 'oerlikon-new-build',
    title: 'New build near Oerlikon station, fourth floor',
    snippet:
      'Handover in March. Everything is new and nothing has any character yet, which is either the point or the problem. Minergie certified, and the service charges reflect it.',
    street: 'Baumackerstrasse 42',
    city: 'Zürich',
    canton: 'ZH',
    listingType: 'rent',
    propertyType: 'apartment',
    status: 'available',
    triageStatus: 'new',
    price: 3180,
    rooms: 4.5,
    livingSpace: 112,
    floor: 4,
    yearBuilt: 2026,
    viewingCount: 0,
    listedAt: '2026-08-26',
    portal: 'Homegate',
    briefMatch: 0.74,
    imageCount: 9,
  },
  {
    id: 'p-j1k2l3',
    slug: 'winterthur-terrace-house',
    title: 'End-of-terrace house with a walled garden',
    snippet:
      'Four bedrooms over three floors and a garden that is genuinely private rather than merely detached. Twelve minutes to the station on foot. Needs a new boiler within the year.',
    street: 'Rychenbergstrasse 208',
    city: 'Winterthur',
    canton: 'ZH',
    listingType: 'sale',
    propertyType: 'house',
    status: 'under_offer',
    triageStatus: 'interested',
    price: 1_240_000,
    rooms: 5.5,
    livingSpace: 164,
    plotSize: 320,
    yearBuilt: 1972,
    rating: 4,
    viewingCount: 1,
    lastViewedAt: '2026-08-09',
    listedAt: '2026-07-14',
    portal: 'Newhome',
    briefMatch: 0.69,
    imageCount: 24,
  },
  {
    id: 'p-m4n5o6',
    slug: 'zug-lakeside-studio',
    title: 'Studio two streets back from the lake',
    snippet:
      'Small, and honest about it. The building is quiet, the tram is at the corner, and the deposit is the only unusual thing in the listing — six months rather than three.',
    street: 'Zugerbergstrasse 19',
    city: 'Zug',
    canton: 'ZG',
    listingType: 'rent',
    propertyType: 'studio',
    status: 'available',
    triageStatus: 'rejected',
    price: 1890,
    rooms: 1.5,
    livingSpace: 41,
    floor: 1,
    yearBuilt: 1989,
    rating: 2,
    viewingCount: 1,
    lastViewedAt: '2026-07-31',
    listedAt: '2026-07-19',
    portal: 'ImmoScout24',
    briefMatch: 0.38,
    imageCount: 6,
  },
  {
    id: 'p-p7q8r9',
    slug: 'basel-loft-conversion',
    title: 'Loft in a converted ribbon factory',
    snippet:
      'Six-metre ceilings, north light through the sawtooth roof, and a heating bill to match. The freight lift is shared with two studios on the floor below.',
    street: 'Erlenstrasse 33',
    city: 'Basel',
    canton: 'BS',
    listingType: 'rent',
    propertyType: 'loft',
    status: 'available',
    triageStatus: 'new',
    price: 2740,
    rooms: 2.5,
    livingSpace: 134,
    floor: 3,
    yearBuilt: 1921,
    viewingCount: 0,
    listedAt: '2026-08-24',
    portal: 'Flatfox',
    briefMatch: 0.62,
    imageCount: 15,
  },
]

/** One that has been put away — the archived list is a real view in the app. */
export const ARCHIVED_LISTING: Listing = {
  id: 'p-s1t2u3',
  slug: 'altstetten-ground-floor',
  title: 'Ground-floor flat behind the depot',
  snippet:
    'Went under offer the same week it was listed. Kept for the price comparison rather than for itself.',
  street: 'Hohlstrasse 481',
  city: 'Zürich',
  canton: 'ZH',
  listingType: 'rent',
  propertyType: 'apartment',
  status: 'sold',
  triageStatus: 'rejected',
  price: 2450,
  rooms: 3.5,
  livingSpace: 79,
  floor: 0,
  yearBuilt: 1978,
  rating: 2,
  viewingCount: 0,
  listedAt: '2026-06-30',
  portal: 'Homegate',
  briefMatch: 0.44,
  imageCount: 7,
  archived: true,
}

/* --- Facets ---------------------------------------------------------------
 * Counts are the facet's own, not the current result set's — which is why they
 * do not add up to the six listings above. That is how a real faceted search
 * behaves and the sidebar should be designed against it.
 */

export const CITY_FACETS = [
  { value: 'zurich', label: 'Zürich', count: 148 },
  { value: 'winterthur', label: 'Winterthur', count: 42 },
  { value: 'zug', label: 'Zug', count: 31 },
  { value: 'basel', label: 'Basel', count: 27 },
  { value: 'bern', label: 'Bern', count: 19 },
  { value: 'luzern', label: 'Luzern', count: 14 },
  { value: 'stgallen', label: 'St. Gallen', count: 11 },
  { value: 'baden', label: 'Baden', count: 8 },
  { value: 'thalwil', label: 'Thalwil', count: 6 },
  { value: 'uster', label: 'Uster', count: 4 },
]

export const PROPERTY_TYPE_FACETS = [
  { value: 'apartment', label: 'Apartment', count: 214 },
  { value: 'house', label: 'House', count: 48 },
  { value: 'loft', label: 'Loft', count: 17 },
  { value: 'studio', label: 'Studio', count: 12 },
  { value: 'villa', label: 'Villa', count: 9 },
  { value: 'chalet', label: 'Chalet', count: 3 },
]

/**
 * The pipeline facet, with a swatch each. `new` deliberately has no strong
 * colour: it is the default state and would otherwise shout on every row.
 */
export const TRIAGE_FACETS: Array<{
  value: TriageStatus
  label: string
  count: number
  swatch: string
}> = [
  { value: 'new', label: 'New', count: 96, swatch: 'var(--cds-color-rule-strong)' },
  { value: 'interested', label: 'Interested', count: 24, swatch: 'var(--cds-color-info)' },
  { value: 'applied', label: 'Applied', count: 7, swatch: 'var(--cds-color-success)' },
  { value: 'rejected', label: 'Rejected', count: 61, swatch: 'var(--cds-color-danger)' },
]

export const FEATURE_FACETS = [
  { value: 'balcony', label: 'Balcony or terrace', count: 132 },
  { value: 'lift', label: 'Lift', count: 118 },
  { value: 'parking', label: 'Parking', count: 87 },
  { value: 'dishwasher', label: 'Dishwasher', count: 76 },
  { value: 'pets', label: 'Pets allowed', count: 41 },
  { value: 'fireplace', label: 'Fireplace', count: 12 },
]

export const PORTAL_FACETS = [
  { value: 'homegate', label: 'Homegate', count: 121 },
  { value: 'immoscout24', label: 'ImmoScout24', count: 98 },
  { value: 'newhome', label: 'Newhome', count: 44 },
  { value: 'flatfox', label: 'Flatfox', count: 29 },
]

/** Mirrors `PropertySort` in the app: newest, oldest, rating, viewed, price. */
export const PROPERTY_SORT_OPTIONS = [
  { value: 'match', label: 'Brief match', directional: false },
  { value: 'listed', label: 'Date listed' },
  { value: 'price', label: 'Price' },
  { value: 'space', label: 'Living space' },
  { value: 'rating', label: 'Team rating' },
  { value: 'viewed', label: 'Last viewed' },
]

/* --- Viewings ------------------------------------------------------------- */

export type ViewingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Viewing {
  id: string
  listingId: string
  listingTitle: string
  city: string
  /** `YYYY-MM-DDTHH:mm`, no zone — the system's convention for wall-clock time. */
  at: string
  status: ViewingStatus
  attendee: string
  agent: string
  note?: string
}

export const VIEWINGS: Viewing[] = [
  {
    id: 'v-1041',
    listingId: 'p-d4e5f6',
    listingTitle: 'Riverside flat with a balcony over the Limmat',
    city: 'Zürich',
    at: '2026-09-02T18:30',
    status: 'scheduled',
    attendee: 'Both of us',
    agent: 'B. Ammann, ImmoScout24',
    note: 'Second viewing. Ask about the boiler service record and the storage cellar.',
  },
  {
    id: 'v-1039',
    listingId: 'p-g7h8i9',
    listingTitle: 'New build near Oerlikon station, fourth floor',
    city: 'Zürich',
    at: '2026-09-04T12:00',
    status: 'scheduled',
    attendee: 'Flo',
    agent: 'Sales office, on site',
  },
  {
    id: 'v-1036',
    listingId: 'p-a1b2c3',
    listingTitle: 'Attic conversion above the Seefeld tramline',
    city: 'Zürich',
    at: '2026-08-14T17:00',
    status: 'completed',
    attendee: 'Both of us',
    agent: 'M. Roth, Homegate',
    note: 'Warmer than expected under the roof. Worth asking what the summer is like.',
  },
  {
    id: 'v-1033',
    listingId: 'p-j1k2l3',
    listingTitle: 'End-of-terrace house with a walled garden',
    city: 'Winterthur',
    at: '2026-08-09T10:30',
    status: 'completed',
    attendee: 'Flo',
    agent: 'K. Bianchi, Newhome',
  },
  {
    id: 'v-1030',
    listingId: 'p-m4n5o6',
    listingTitle: 'Studio two streets back from the lake',
    city: 'Zug',
    at: '2026-07-31T09:00',
    status: 'cancelled',
    attendee: 'Flo',
    agent: 'L. Furrer, ImmoScout24',
    note: 'Cancelled by the agent an hour before. Let after all.',
  },
]

/* --- Discussion ----------------------------------------------------------- */

export interface Comment {
  id: string
  author: string
  at: string
  body: string
  reactions?: Array<{ emoji: string; count: number }>
}

export const COMMENTS: Comment[] = [
  {
    id: 'c-1',
    author: 'Flo',
    at: '2026-08-14T19:12',
    body: 'The roof timbers are lovely and the light is as good as the photographs suggest. It was 27° up there at five in the afternoon, though, and the windows are single-glazed on the street side.',
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: 'c-2',
    author: 'Nina',
    at: '2026-08-14T20:40',
    body: 'Single glazing on a tramline is the part I would want to solve before signing anything. Can we ask whether the owner would replace them?',
  },
  {
    id: 'c-3',
    author: 'Flo',
    at: '2026-08-15T08:02',
    body: 'Asked. The agent says the building is listed, so the windows have to match the originals — which means secondary glazing at best. Rating dropped to 4.',
    reactions: [
      { emoji: '👍', count: 1 },
      { emoji: '😕', count: 1 },
    ],
  },
]

/* --- Search brief --------------------------------------------------------- */

export interface BriefVersion {
  id: string
  version: number
  at: string
  author: string
  summary: string
  candidatesFound: number
}

export const BRIEF_VERSIONS: BriefVersion[] = [
  {
    id: 'bv-4',
    version: 4,
    at: '2026-08-22T09:15',
    author: 'Nina',
    summary: 'Raised the ceiling to CHF 3,600 and dropped the “lift required” condition.',
    candidatesFound: 31,
  },
  {
    id: 'bv-3',
    version: 3,
    at: '2026-08-05T14:48',
    author: 'Flo',
    summary: 'Added Winterthur and Baden. Minimum 3.5 rooms.',
    candidatesFound: 24,
  },
  {
    id: 'bv-2',
    version: 2,
    at: '2026-07-21T11:02',
    author: 'Flo',
    summary: 'Narrowed to Zürich city and Zug after two disappointing viewings.',
    candidatesFound: 12,
  },
  {
    id: 'bv-1',
    version: 1,
    at: '2026-07-08T16:30',
    author: 'Nina',
    summary: 'First brief: 3.5 rooms, CHF 3,200, anywhere within 30 minutes of Hauptbahnhof.',
    candidatesFound: 8,
  },
]

/* --- Formatting ----------------------------------------------------------- */

/**
 * Swiss thousands separator is an apostrophe, which is worth getting right in a
 * pattern whose whole subject is a price the reader is comparing.
 */
export function formatPrice(amount: number, listingType: ListingType) {
  const value = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(amount)
  return listingType === 'rent' ? `CHF ${value}/mo` : `CHF ${value}`
}

/** `3.5` reads as "3½ rooms" in the market; keep the half but drop a bare `.0`. */
export function formatRooms(rooms: number) {
  return `${rooms % 1 === 0 ? rooms.toFixed(0) : rooms.toFixed(1)} rooms`
}

export function formatArea(m2: number) {
  return `${m2} m²`
}

export function formatListingDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** `2026-09-02T18:30` → `Wed 2 Sep, 18:30`. Wall-clock, never converted. */
export function formatViewingAt(local: string) {
  const [date, time] = local.split('T')
  const day = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return `${day}, ${time}`
}

export function formatCommentAt(local: string) {
  const [date, time] = local.split('T')
  const day = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
  return `${day} at ${time}`
}

export function triageTone(status: TriageStatus): 'neutral' | 'info' | 'success' | 'danger' {
  switch (status) {
    case 'interested':
      return 'info'
    case 'applied':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function marketStatusTone(status: MarketStatus): 'neutral' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'available':
      return 'success'
    case 'under_offer':
      return 'warning'
    case 'sold':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function formatMarketStatus(status: MarketStatus) {
  return { available: 'Available', under_offer: 'Under offer', sold: 'Let', withdrawn: 'Withdrawn' }[
    status
  ]
}

export function formatTriageStatus(status: TriageStatus) {
  return { new: 'New', interested: 'Interested', applied: 'Applied', rejected: 'Rejected' }[status]
}

export function formatPropertyType(type: PropertyType) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
