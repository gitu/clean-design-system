/**
 * Shared demo data for the stories. Modelled on a newspaper archive search,
 * which is the case this system was designed against: long tail of documents,
 * many facets, dense metadata, users who scan rather than read.
 */

export interface Article {
  id: string
  title: string
  snippet: string
  section: string
  author: string
  published: string
  words: number
  language: 'de' | 'en' | 'fr'
  status: 'published' | 'embargoed' | 'retracted'
  score: number
}

export const ARTICLES: Article[] = [
  {
    id: 'A-38211',
    title: 'The quiet consolidation of Swiss private banking',
    snippet:
      'Three decades of mergers have left the sector with a handful of institutions that between them hold more assets than the rest of the market combined. The regulator now faces a question it has avoided for years.',
    section: 'Finance',
    author: 'M. Brunner',
    published: '2024-11-03',
    words: 2140,
    language: 'en',
    status: 'published',
    score: 0.97,
  },
  {
    id: 'A-38199',
    title: 'Zurich’s housing market and the limits of density',
    snippet:
      'Planners have spent a decade arguing that building upwards would ease pressure on rents. The evidence from the last four years is more equivocal than either side admits.',
    section: 'Economy',
    author: 'R. Keller',
    published: '2024-10-28',
    words: 1680,
    language: 'en',
    status: 'published',
    score: 0.94,
  },
  {
    id: 'A-38174',
    title: 'Was von der Bankenregulierung übrig bleibt',
    snippet:
      'Die Aufsicht hat ihre Instrumente erweitert, doch die entscheidenden Fragen zur Eigenkapitalquote bleiben offen. Ein Rückblick auf zwölf Monate zäher Verhandlungen.',
    section: 'Finance',
    author: 'S. Vogt',
    published: '2024-10-14',
    words: 2890,
    language: 'de',
    status: 'published',
    score: 0.91,
  },
  {
    id: 'A-38160',
    title: 'A shortage of engineers, or a shortage of patience?',
    snippet:
      'Employers say the talent pipeline has run dry. Universities point to a doubling of graduates since 2010. Both are describing the same labour market from opposite ends.',
    section: 'Technology',
    author: 'L. Frei',
    published: '2024-10-02',
    words: 1420,
    language: 'en',
    status: 'published',
    score: 0.88,
  },
  {
    id: 'A-38142',
    title: 'The referendum that nobody campaigned for',
    snippet:
      'Turnout was the lowest in nineteen years, and the result passed with a margin so narrow that the recount took longer than the campaign itself.',
    section: 'Politics',
    author: 'A. Wyss',
    published: '2024-09-21',
    words: 980,
    language: 'en',
    status: 'published',
    score: 0.85,
  },
  {
    id: 'A-38121',
    title: 'Alpine rail freight after the tunnel',
    snippet:
      'The corridor was meant to move a third of north–south lorry traffic onto rail. Eight years on, the share has moved, but not by as much as the projections promised.',
    section: 'Economy',
    author: 'R. Keller',
    published: '2024-09-09',
    words: 2260,
    language: 'en',
    status: 'embargoed',
    score: 0.81,
  },
]

export const SECTION_FACETS = [
  { value: 'finance', label: 'Finance', count: 1284 },
  { value: 'economy', label: 'Economy', count: 967 },
  { value: 'politics', label: 'Politics', count: 812 },
  { value: 'technology', label: 'Technology', count: 604 },
  { value: 'culture', label: 'Culture', count: 419 },
  { value: 'science', label: 'Science', count: 287 },
  { value: 'sport', label: 'Sport', count: 140 },
  { value: 'obituaries', label: 'Obituaries', count: 96 },
  { value: 'letters', label: 'Letters', count: 61 },
  { value: 'corrections', label: 'Corrections', count: 12 },
]

export const AUTHOR_FACETS = [
  { value: 'brunner', label: 'M. Brunner', count: 214 },
  { value: 'keller', label: 'R. Keller', count: 188 },
  { value: 'vogt', label: 'S. Vogt', count: 151 },
  { value: 'frei', label: 'L. Frei', count: 97 },
  { value: 'wyss', label: 'A. Wyss', count: 64 },
  { value: 'moser', label: 'D. Moser', count: 31 },
  { value: 'baumann', label: 'C. Baumann', count: 0 },
]

export const LANGUAGE_FACETS = [
  { value: 'de', label: 'German', count: 2640 },
  { value: 'en', label: 'English', count: 1502 },
  { value: 'fr', label: 'French', count: 428 },
  { value: 'it', label: 'Italian', count: 112 },
]

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', directional: false },
  { value: 'published', label: 'Publication date' },
  { value: 'words', label: 'Length' },
  { value: 'title', label: 'Title' },
]

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* --- Analytics ---------------------------------------------------------- */

/**
 * Weekly search telemetry for the archive. Shaped the way this kind of data
 * actually arrives: a slow upward trend with seasonal dips, one monitoring
 * outage, and a zero-result rate that improves after a reindex in week 27.
 */
export interface QueryWeek {
  week: string
  searches: number
  articles: number
  images: number
  datasets: number
  target: number
  zeroResults: number
  latencyP95: number | null
  clickThrough: number
}

export const QUERY_WEEKS: QueryWeek[] = [
  { week: '2024-01-01', searches: 18420, articles: 12800, images: 3900, datasets: 1720, target: 18000, zeroResults: 9.1, latencyP95: 214, clickThrough: 41.2 },
  { week: '2024-01-08', searches: 19180, articles: 13240, images: 4100, datasets: 1840, target: 18000, zeroResults: 8.8, latencyP95: 208, clickThrough: 41.9 },
  { week: '2024-01-15', searches: 17960, articles: 12410, images: 3820, datasets: 1730, target: 18000, zeroResults: 9.4, latencyP95: 221, clickThrough: 40.4 },
  { week: '2024-01-22', searches: 20340, articles: 14020, images: 4380, datasets: 1940, target: 18500, zeroResults: 8.2, latencyP95: 199, clickThrough: 42.8 },
  { week: '2024-01-29', searches: 21880, articles: 15100, images: 4640, datasets: 2140, target: 18500, zeroResults: 7.9, latencyP95: 193, clickThrough: 43.6 },
  { week: '2024-02-05', searches: 20990, articles: 14380, images: 4520, datasets: 2090, target: 19000, zeroResults: 8.1, latencyP95: 201, clickThrough: 43.1 },
  { week: '2024-02-12', searches: 22640, articles: 15620, images: 4810, datasets: 2210, target: 19000, zeroResults: 7.4, latencyP95: 188, clickThrough: 44.2 },
  { week: '2024-02-19', searches: 24110, articles: 16740, images: 5020, datasets: 2350, target: 19500, zeroResults: 7.1, latencyP95: 184, clickThrough: 45.0 },
  { week: '2024-02-26', searches: 23480, articles: 16210, images: 4940, datasets: 2330, target: 19500, zeroResults: 7.3, latencyP95: 190, clickThrough: 44.6 },
  { week: '2024-03-04', searches: 25920, articles: 17980, images: 5410, datasets: 2530, target: 20000, zeroResults: 6.8, latencyP95: null, clickThrough: 45.8 },
  { week: '2024-03-11', searches: 26740, articles: 18540, images: 5590, datasets: 2610, target: 20000, zeroResults: 6.6, latencyP95: null, clickThrough: 46.1 },
  { week: '2024-03-18', searches: 25310, articles: 17490, images: 5280, datasets: 2540, target: 20500, zeroResults: 6.9, latencyP95: 186, clickThrough: 45.4 },
  { week: '2024-03-25', searches: 27880, articles: 19340, images: 5820, datasets: 2720, target: 20500, zeroResults: 6.2, latencyP95: 179, clickThrough: 46.9 },
  { week: '2024-04-01', searches: 29140, articles: 20210, images: 6110, datasets: 2820, target: 21000, zeroResults: 5.8, latencyP95: 174, clickThrough: 47.5 },
  { week: '2024-04-08', searches: 28460, articles: 19680, images: 5980, datasets: 2800, target: 21000, zeroResults: 6.0, latencyP95: 177, clickThrough: 47.1 },
  { week: '2024-04-15', searches: 30920, articles: 21440, images: 6440, datasets: 3040, target: 21500, zeroResults: 5.4, latencyP95: 168, clickThrough: 48.3 },
  { week: '2024-04-22', searches: 31780, articles: 22010, images: 6640, datasets: 3130, target: 21500, zeroResults: 5.2, latencyP95: 165, clickThrough: 48.8 },
  { week: '2024-04-29', searches: 30140, articles: 20780, images: 6300, datasets: 3060, target: 22000, zeroResults: 5.6, latencyP95: 172, clickThrough: 48.0 },
  { week: '2024-05-06', searches: 33420, articles: 23180, images: 6960, datasets: 3280, target: 22000, zeroResults: 4.9, latencyP95: 161, clickThrough: 49.4 },
  { week: '2024-05-13', searches: 34960, articles: 24290, images: 7240, datasets: 3430, target: 22500, zeroResults: 4.6, latencyP95: 157, clickThrough: 50.1 },
  { week: '2024-05-20', searches: 33810, articles: 23420, images: 7040, datasets: 3350, target: 22500, zeroResults: 4.8, latencyP95: 160, clickThrough: 49.7 },
  { week: '2024-05-27', searches: 36240, articles: 25180, images: 7520, datasets: 3540, target: 23000, zeroResults: 4.3, latencyP95: 152, clickThrough: 50.8 },
  { week: '2024-06-03', searches: 37680, articles: 26210, images: 7810, datasets: 3660, target: 23000, zeroResults: 4.1, latencyP95: 149, clickThrough: 51.3 },
  { week: '2024-06-10', searches: 36110, articles: 25040, images: 7500, datasets: 3570, target: 23500, zeroResults: 4.4, latencyP95: 154, clickThrough: 50.6 },
  { week: '2024-06-17', searches: 39240, articles: 27310, images: 8120, datasets: 3810, target: 23500, zeroResults: 3.8, latencyP95: 144, clickThrough: 52.0 },
  { week: '2024-06-24', searches: 40880, articles: 28460, images: 8460, datasets: 3960, target: 24000, zeroResults: 3.6, latencyP95: 141, clickThrough: 52.6 },
  { week: '2024-07-01', searches: 38920, articles: 27040, images: 8080, datasets: 3800, target: 24000, zeroResults: 3.9, latencyP95: 147, clickThrough: 51.9 },
  { week: '2024-07-08', searches: 42340, articles: 29480, images: 8760, datasets: 4100, target: 24500, zeroResults: 2.8, latencyP95: 138, clickThrough: 54.1 },
]

/** Top queries, for a horizontal bar chart and a cross-filtered table. */
export interface TopQuery {
  query: string
  searches: number
  zeroRate: number
  clickThrough: number
  trend: number[]
}

export const TOP_QUERIES: TopQuery[] = [
  { query: 'swiss banking', searches: 4231, zeroRate: 1.2, clickThrough: 61.4, trend: [180, 210, 198, 240, 268, 291, 344] },
  { query: 'referendum 2024', searches: 3187, zeroRate: 0.8, clickThrough: 58.9, trend: [420, 380, 344, 301, 288, 260, 231] },
  { query: 'alpine rail freight', searches: 2094, zeroRate: 3.4, clickThrough: 44.2, trend: [90, 104, 98, 121, 140, 152, 168] },
  { query: 'eigenkapitalquote', searches: 1668, zeroRate: 8.1, clickThrough: 39.7, trend: [140, 132, 128, 119, 112, 104, 96] },
  { query: 'housing density zurich', searches: 1402, zeroRate: 2.1, clickThrough: 52.3, trend: [60, 71, 84, 96, 110, 128, 142] },
  { query: 'engineer shortage', searches: 1188, zeroRate: 5.6, clickThrough: 41.0, trend: [88, 92, 90, 101, 108, 112, 121] },
  { query: 'bundesgesetz archiv', searches: 964, zeroRate: 12.4, clickThrough: 28.6, trend: [130, 124, 118, 109, 101, 94, 88] },
  { query: 'photo desk 1998', searches: 741, zeroRate: 18.9, clickThrough: 22.4, trend: [40, 44, 41, 48, 52, 58, 61] },
]

/* --- Index console ------------------------------------------------------ */

export interface CrawlJob {
  id: string
  source: string
  status: 'running' | 'queued' | 'done' | 'failed'
  documents: number
  progress: number
  started: string
  throughput: number[]
  error?: string
}

export const CRAWL_JOBS: CrawlJob[] = [
  { id: 'J-4821', source: 'NZZ archive', status: 'running', documents: 184203, progress: 62, started: '2024-07-08T06:12:00Z', throughput: [1200, 1340, 1280, 1410, 1520, 1490, 1610] },
  { id: 'J-4820', source: 'Agency wire', status: 'running', documents: 96410, progress: 88, started: '2024-07-08T05:40:00Z', throughput: [880, 910, 870, 940, 1020, 1080, 1140] },
  { id: 'J-4819', source: 'Federal gazette', status: 'queued', documents: 41288, progress: 0, started: '2024-07-08T07:00:00Z', throughput: [310, 298, 320, 340, 336, 352, 368] },
  { id: 'J-4818', source: 'Photo desk', status: 'done', documents: 22940, progress: 100, started: '2024-07-07T22:05:00Z', throughput: [140, 152, 148, 160, 158, 166, 171] },
  { id: 'J-4817', source: 'Parliamentary record', status: 'failed', documents: 8104, progress: 34, started: '2024-07-07T19:31:00Z', throughput: [90, 88, 61, 40, 12, 0, 0], error: 'Upstream returned 503 after 2,760 documents' },
  { id: 'J-4816', source: 'Reader letters', status: 'done', documents: 6120, progress: 100, started: '2024-07-07T14:18:00Z', throughput: [70, 74, 72, 78, 81, 79, 84] },
]

export interface IngestDay {
  day: string
  indexed: number
  updated: number
  deleted: number
}

export const INGEST_DAYS: IngestDay[] = [
  { day: '2024-07-01', indexed: 12400, updated: 3200, deleted: 410 },
  { day: '2024-07-02', indexed: 13800, updated: 3600, deleted: 380 },
  { day: '2024-07-03', indexed: 11900, updated: 2900, deleted: 520 },
  { day: '2024-07-04', indexed: 15200, updated: 4100, deleted: 340 },
  { day: '2024-07-05', indexed: 16800, updated: 4400, deleted: 290 },
  { day: '2024-07-06', indexed: 9400, updated: 2100, deleted: 610 },
  { day: '2024-07-07', indexed: 8800, updated: 1900, deleted: 580 },
  { day: '2024-07-08', indexed: 17600, updated: 4800, deleted: 260 },
]

/* --- Relevance workbench ------------------------------------------------ */

export interface RankedResult {
  id: string
  title: string
  section: string
  /** Score contributions, which sum to `score`. */
  textMatch: number
  freshness: number
  authority: number
  popularity: number
  score: number
  /** Rank in the opposing variant, for the movement arrows. */
  rankInOther: number
}

export const VARIANT_A: RankedResult[] = [
  { id: 'A-38211', title: 'The quiet consolidation of Swiss private banking', section: 'Finance', textMatch: 0.52, freshness: 0.18, authority: 0.16, popularity: 0.11, score: 0.97, rankInOther: 2 },
  { id: 'A-38174', title: 'Was von der Bankenregulierung übrig bleibt', section: 'Finance', textMatch: 0.49, freshness: 0.12, authority: 0.19, popularity: 0.11, score: 0.91, rankInOther: 4 },
  { id: 'A-38199', title: 'Zurich’s housing market and the limits of density', section: 'Economy', textMatch: 0.44, freshness: 0.21, authority: 0.14, popularity: 0.15, score: 0.94, rankInOther: 1 },
  { id: 'A-38160', title: 'A shortage of engineers, or a shortage of patience?', section: 'Technology', textMatch: 0.41, freshness: 0.19, authority: 0.15, popularity: 0.13, score: 0.88, rankInOther: 3 },
  { id: 'A-38142', title: 'The referendum that nobody campaigned for', section: 'Politics', textMatch: 0.38, freshness: 0.22, authority: 0.13, popularity: 0.12, score: 0.85, rankInOther: 6 },
  { id: 'A-38121', title: 'Alpine rail freight after the tunnel', section: 'Economy', textMatch: 0.36, freshness: 0.17, authority: 0.16, popularity: 0.12, score: 0.81, rankInOther: 5 },
]

export const VARIANT_B: RankedResult[] = [
  { id: 'A-38199', title: 'Zurich’s housing market and the limits of density', section: 'Economy', textMatch: 0.38, freshness: 0.34, authority: 0.14, popularity: 0.13, score: 0.99, rankInOther: 3 },
  { id: 'A-38211', title: 'The quiet consolidation of Swiss private banking', section: 'Finance', textMatch: 0.45, freshness: 0.29, authority: 0.16, popularity: 0.06, score: 0.96, rankInOther: 1 },
  { id: 'A-38160', title: 'A shortage of engineers, or a shortage of patience?', section: 'Technology', textMatch: 0.35, freshness: 0.31, authority: 0.15, popularity: 0.09, score: 0.90, rankInOther: 4 },
  { id: 'A-38174', title: 'Was von der Bankenregulierung übrig bleibt', section: 'Finance', textMatch: 0.42, freshness: 0.19, authority: 0.19, popularity: 0.06, score: 0.86, rankInOther: 2 },
  { id: 'A-38121', title: 'Alpine rail freight after the tunnel', section: 'Economy', textMatch: 0.31, freshness: 0.28, authority: 0.16, popularity: 0.08, score: 0.83, rankInOther: 6 },
  { id: 'A-38142', title: 'The referendum that nobody campaigned for', section: 'Politics', textMatch: 0.29, freshness: 0.24, authority: 0.13, popularity: 0.07, score: 0.73, rankInOther: 5 },
]

/** NDCG@10 across an evaluation set, per variant. */
export interface EvalPoint {
  queryIndex: number
  variantA: number
  variantB: number
}

export const EVAL_CURVE: EvalPoint[] = Array.from({ length: 20 }, (_, i) => ({
  queryIndex: i + 1,
  variantA: Number((0.62 + Math.sin(i / 3) * 0.06 + i * 0.004).toFixed(3)),
  variantB: Number((0.60 + Math.sin(i / 3 + 1) * 0.07 + i * 0.009).toFixed(3)),
}))

/* --- People, for user management --------------------------------------- */

export interface Member {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Editor' | 'Analyst' | 'Viewer'
  status: 'active' | 'invited' | 'suspended'
  lastSeen: string
  searches: number
}

export const MEMBERS: Member[] = [
  { id: 'u-01', name: 'Marta Brunner', email: 'm.brunner@archiv.ch', role: 'Owner', status: 'active', lastSeen: '2024-07-08T09:12:00Z', searches: 1284 },
  { id: 'u-02', name: 'Rico Keller', email: 'r.keller@archiv.ch', role: 'Editor', status: 'active', lastSeen: '2024-07-08T08:41:00Z', searches: 964 },
  { id: 'u-03', name: 'Sara Vogt', email: 's.vogt@archiv.ch', role: 'Editor', status: 'active', lastSeen: '2024-07-07T17:03:00Z', searches: 812 },
  { id: 'u-04', name: 'Luca Frei', email: 'l.frei@archiv.ch', role: 'Analyst', status: 'active', lastSeen: '2024-07-07T11:55:00Z', searches: 604 },
  { id: 'u-05', name: 'Anna Wyss', email: 'a.wyss@archiv.ch', role: 'Analyst', status: 'invited', lastSeen: '—', searches: 0 },
  { id: 'u-06', name: 'Dario Moser', email: 'd.moser@archiv.ch', role: 'Viewer', status: 'active', lastSeen: '2024-07-05T14:20:00Z', searches: 141 },
  { id: 'u-07', name: 'Claudia Baumann', email: 'c.baumann@archiv.ch', role: 'Viewer', status: 'suspended', lastSeen: '2024-05-30T09:00:00Z', searches: 22 },
]

/* --- Editorial calendar -------------------------------------------------- */

export interface CalendarEntry {
  id: string
  date: string
  title: string
  kind: 'embargo' | 'publication' | 'review' | 'maintenance'
  owner: string
  time?: string
}

export const CALENDAR_ENTRIES: CalendarEntry[] = [
  { id: 'e-01', date: '2024-07-02', title: 'Banking consolidation — embargo lifts', kind: 'embargo', owner: 'M. Brunner', time: '06:00' },
  { id: 'e-02', date: '2024-07-04', title: 'Quarterly index review', kind: 'review', owner: 'R. Keller', time: '10:00' },
  { id: 'e-03', date: '2024-07-08', title: 'Referendum retrospective', kind: 'publication', owner: 'A. Wyss', time: '05:00' },
  { id: 'e-04', date: '2024-07-08', title: 'Photo desk migration', kind: 'maintenance', owner: 'D. Moser', time: '23:00' },
  { id: 'e-05', date: '2024-07-11', title: 'Alpine freight feature', kind: 'publication', owner: 'S. Vogt', time: '05:00' },
  { id: 'e-06', date: '2024-07-15', title: 'Gazette reindex', kind: 'maintenance', owner: 'L. Frei', time: '02:00' },
  { id: 'e-07', date: '2024-07-18', title: 'Housing series — part two', kind: 'publication', owner: 'R. Keller', time: '05:00' },
  { id: 'e-08', date: '2024-07-22', title: 'Engineering shortage — embargo lifts', kind: 'embargo', owner: 'L. Frei', time: '07:00' },
  { id: 'e-09', date: '2024-07-25', title: 'Relevance model review', kind: 'review', owner: 'M. Brunner', time: '14:00' },
  { id: 'e-10', date: '2024-07-29', title: 'Wire ingest upgrade', kind: 'maintenance', owner: 'D. Moser', time: '01:00' },
]

/* --- Delivery routing ---------------------------------------------------- */

export interface Stop {
  id: string
  sequence: number
  name: string
  address: string
  /** [longitude, latitude] — the order MapLibre expects. */
  coordinates: [number, number]
  window: string
  eta: string
  parcels: number
  status: 'delivered' | 'next' | 'pending' | 'failed'
}

/** A morning round through central Zurich. */
export const ROUTE_STOPS: Stop[] = [
  { id: 's-01', sequence: 1, name: 'Bahnhofstrasse 12', address: '8001 Zürich', coordinates: [8.5386, 47.3717], window: '08:00–09:00', eta: '08:12', parcels: 3, status: 'delivered' },
  { id: 's-02', sequence: 2, name: 'Rennweg 34', address: '8001 Zürich', coordinates: [8.5395, 47.3735], window: '08:00–09:30', eta: '08:29', parcels: 1, status: 'delivered' },
  { id: 's-03', sequence: 3, name: 'Limmatquai 78', address: '8001 Zürich', coordinates: [8.5435, 47.3720], window: '09:00–10:00', eta: '09:04', parcels: 5, status: 'delivered' },
  { id: 's-04', sequence: 4, name: 'Niederdorfstrasse 21', address: '8001 Zürich', coordinates: [8.5447, 47.3745], window: '09:00–10:30', eta: '09:31', parcels: 2, status: 'failed' },
  { id: 's-05', sequence: 5, name: 'Universitätstrasse 5', address: '8006 Zürich', coordinates: [8.5470, 47.3782], window: '10:00–11:00', eta: '10:08', parcels: 4, status: 'next' },
  { id: 's-06', sequence: 6, name: 'Weinbergstrasse 44', address: '8006 Zürich', coordinates: [8.5432, 47.3810], window: '10:30–11:30', eta: '10:41', parcels: 2, status: 'pending' },
  { id: 's-07', sequence: 7, name: 'Röntgenstrasse 16', address: '8005 Zürich', coordinates: [8.5290, 47.3846], window: '11:00–12:00', eta: '11:15', parcels: 6, status: 'pending' },
  { id: 's-08', sequence: 8, name: 'Hardturmstrasse 100', address: '8005 Zürich', coordinates: [8.5122, 47.3902], window: '11:30–12:30', eta: '11:48', parcels: 3, status: 'pending' },
]

/* --- Task tracker -------------------------------------------------------- */

/**
 * Where a task sits on the board.
 *
 * Note what is deliberately *not* here: `blocked`. Blocking is a relationship
 * between two tasks, not a stage of work — a task waiting on another is still
 * in whichever column its own work belongs to. Giving it a column would mean a
 * card's position stopped describing its progress, and would need answering
 * again the moment the blocker cleared. It is derived from `blockedBy` and
 * marked on the card instead.
 */
export type TaskStatus = 'backlog' | 'ready' | 'doing' | 'review' | 'done'

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'

export interface Subtask {
  id: string
  label: string
  done: boolean
}

export interface Task {
  /** The human reference people say out loud. Shown on the card. */
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  /** A `Member.id`, or null when nobody has picked it up. */
  assignee: string | null
  epic: string
  labels: string[]
  /** ISO date, or null where there is no deadline. */
  due: string | null
  /** Rough size, in points. */
  estimate: number
  subtasks: Subtask[]
  /** Task ids that have to finish first. */
  blockedBy: string[]
  description: string
  created: string
  updated: string
}

export const TASK_EPICS = [
  'Reindex pipeline',
  'Relevance v3',
  'Archive UI',
  'Platform',
] as const

export const TASK_LABELS = ['bug', 'infra', 'a11y', 'perf', 'docs', 'design'] as const

/** The archive team's current sprint, 1–12 July. Today is the 8th. */
export const TASKS: Task[] = [
  {
    id: 'ARC-104',
    title: 'Resume the parliamentary record crawl after a 503',
    status: 'doing',
    priority: 'urgent',
    assignee: 'u-04',
    epic: 'Reindex pipeline',
    labels: ['bug', 'infra'],
    due: '2024-07-09',
    estimate: 8,
    blockedBy: [],
    description:
      'The crawler stops at the first upstream 503 and loses its cursor, so a rerun starts from zero. It should back off, keep the cursor, and resume where it left off.',
    subtasks: [
      { id: 'ARC-104-1', label: 'Persist the cursor between attempts', done: true },
      { id: 'ARC-104-2', label: 'Exponential backoff with a ceiling', done: true },
      { id: 'ARC-104-3', label: 'Surface the retry count on the job row', done: false },
      { id: 'ARC-104-4', label: 'Alert after the third consecutive failure', done: false },
    ],
    created: '2024-07-02',
    updated: '2024-07-08',
  },
  {
    id: 'ARC-108',
    title: 'Freshness is swamping text relevance on the long tail',
    status: 'doing',
    priority: 'urgent',
    assignee: 'u-02',
    epic: 'Relevance v3',
    labels: ['bug'],
    due: '2024-07-10',
    estimate: 5,
    blockedBy: [],
    description:
      'A 2023 stub with two matching terms beats a 1998 feature that answers the query. Freshness carries a weight of 0.6 and decays to nearly nothing, so an old document can never recover.',
    subtasks: [
      { id: 'ARC-108-1', label: 'Halve the weight and floor the decay', done: true },
      { id: 'ARC-108-2', label: 'Rerun the judged set', done: false },
      { id: 'ARC-108-3', label: 'Check the eight worst queries by hand', done: false },
    ],
    created: '2024-07-03',
    updated: '2024-07-08',
  },
  {
    id: 'ARC-110',
    title: 'Drawer scrim reads as opaque on the index console',
    status: 'doing',
    priority: 'normal',
    assignee: 'u-03',
    epic: 'Archive UI',
    labels: ['bug', 'a11y'],
    due: '2024-07-11',
    estimate: 2,
    blockedBy: [],
    description:
      'Opening a job hides the list entirely, so you lose your place in it. The scrim should dim the page, not replace it.',
    subtasks: [
      { id: 'ARC-110-1', label: 'Stop the portal layer painting the canvas', done: true },
      { id: 'ARC-110-2', label: 'Check contrast of the dimmed list', done: false },
    ],
    created: '2024-07-04',
    updated: '2024-07-08',
  },
  {
    id: 'ARC-113',
    title: 'A latency budget for faceted queries',
    status: 'doing',
    priority: 'high',
    assignee: 'u-06',
    epic: 'Platform',
    labels: ['perf'],
    // Deliberately in the past: a sprint with nothing overdue is not a sprint,
    // and the board's overdue treatment needs something to sit on.
    due: '2024-07-05',
    estimate: 8,
    blockedBy: [],
    description:
      'p95 drifts past 200 ms whenever four or more facets are applied at once. Agree a budget, then make the build fail when a change spends past it.',
    subtasks: [
      { id: 'ARC-113-1', label: 'Measure the current distribution', done: false },
      { id: 'ARC-113-2', label: 'Pick a budget the team will actually hold', done: false },
      { id: 'ARC-113-3', label: 'Wire it into CI', done: false },
    ],
    created: '2024-06-28',
    updated: '2024-07-07',
  },
  {
    id: 'ARC-119',
    title: 'Synonym set for legal references',
    status: 'doing',
    priority: 'normal',
    assignee: 'u-01',
    epic: 'Relevance v3',
    labels: [],
    due: '2024-07-16',
    estimate: 5,
    blockedBy: ['ARC-108'],
    description:
      'Readers search for “bundesgesetz” and get nothing, because the documents say “BG” and “SR 101”. A curated set beats a broader analyser here.',
    subtasks: [],
    created: '2024-07-05',
    updated: '2024-07-08',
  },

  {
    id: 'ARC-112',
    title: 'Zero-result report for the weekly digest',
    status: 'ready',
    priority: 'normal',
    assignee: 'u-02',
    epic: 'Relevance v3',
    labels: ['docs'],
    due: '2024-07-12',
    estimate: 3,
    blockedBy: [],
    description:
      'The numbers already exist on the analytics screen. This is about getting them in front of the desk editors once a week without anyone having to open a dashboard.',
    subtasks: [],
    created: '2024-07-01',
    updated: '2024-07-06',
  },
  {
    id: 'ARC-115',
    title: 'Keyboard cursor for the analytics charts',
    status: 'ready',
    priority: 'high',
    assignee: 'u-03',
    epic: 'Archive UI',
    labels: ['a11y'],
    due: '2024-07-11',
    estimate: 5,
    blockedBy: [],
    description:
      'A twenty-eight point line chart should be one tab stop with arrow keys inside it, not twenty-eight tab stops.',
    subtasks: [],
    created: '2024-07-02',
    updated: '2024-07-05',
  },
  {
    id: 'ARC-117',
    title: 'Cap photo-desk thumbnails at 400px',
    status: 'ready',
    priority: 'low',
    assignee: 'u-06',
    epic: 'Platform',
    labels: ['perf'],
    due: '2024-07-18',
    estimate: 2,
    blockedBy: [],
    description:
      'Some scans are served at their full 4,000px width into a 96px box. The result list moves three megabytes to draw a contact sheet.',
    subtasks: [],
    created: '2024-06-30',
    updated: '2024-07-03',
  },
  {
    id: 'ARC-120',
    title: 'Embargo warning on the result card',
    status: 'ready',
    priority: 'high',
    assignee: 'u-03',
    epic: 'Archive UI',
    labels: ['design'],
    due: '2024-07-12',
    estimate: 3,
    blockedBy: ['ARC-108'],
    description:
      'Embargoed documents are already excluded from public search, but internal users see them ranked among everything else with nothing to say so.',
    subtasks: [],
    created: '2024-07-04',
    updated: '2024-07-07',
  },

  {
    id: 'ARC-118',
    title: 'Retry policy for the parliamentary record crawler',
    status: 'backlog',
    priority: 'high',
    assignee: 'u-04',
    epic: 'Reindex pipeline',
    labels: ['infra'],
    due: '2024-07-19',
    estimate: 5,
    blockedBy: ['ARC-104'],
    description:
      'Once the crawl can resume, the policy around it — how often, how many attempts, and who hears about it — needs writing down rather than living in one function.',
    subtasks: [],
    created: '2024-07-05',
    updated: '2024-07-05',
  },
  {
    id: 'ARC-121',
    title: 'Facet counts drift after a partial reindex',
    status: 'backlog',
    priority: 'urgent',
    assignee: null,
    epic: 'Reindex pipeline',
    labels: ['bug'],
    due: '2024-07-15',
    estimate: 8,
    blockedBy: [],
    description:
      'Section counts in the sidebar disagree with the number of results by a few dozen, and the gap grows over a week until the next full rebuild clears it.',
    subtasks: [],
    created: '2024-07-06',
    updated: '2024-07-06',
  },
  {
    id: 'ARC-124',
    title: 'German compound splitting in the analyser',
    status: 'backlog',
    priority: 'normal',
    assignee: null,
    epic: 'Relevance v3',
    labels: [],
    due: null,
    estimate: 13,
    blockedBy: [],
    description:
      '“Bankenregulierung” should find documents that say “Regulierung der Banken”. This is the single largest recall gap in the German half of the archive, and also the largest piece of work in the epic.',
    subtasks: [],
    created: '2024-06-24',
    updated: '2024-07-01',
  },
  {
    id: 'ARC-126',
    title: 'Cite as you read, in the document reader',
    status: 'backlog',
    priority: 'low',
    assignee: null,
    epic: 'Archive UI',
    labels: ['design'],
    due: null,
    estimate: 8,
    blockedBy: [],
    description:
      'Researchers copy the reference by hand and get it wrong. Selecting a passage should offer a citation in the house format.',
    subtasks: [],
    created: '2024-06-20',
    updated: '2024-06-28',
  },
  {
    id: 'ARC-129',
    title: 'Rotate the ingest service account',
    status: 'backlog',
    priority: 'normal',
    assignee: 'u-06',
    epic: 'Platform',
    labels: ['infra'],
    due: '2024-07-26',
    estimate: 2,
    blockedBy: [],
    description: 'Overdue by a quarter. Nothing is wrong; it is simply older than the policy allows.',
    subtasks: [],
    created: '2024-07-07',
    updated: '2024-07-07',
  },

  {
    id: 'ARC-101',
    title: 'Weekly ingest throughput panel',
    status: 'review',
    priority: 'normal',
    assignee: 'u-04',
    epic: 'Reindex pipeline',
    labels: [],
    due: '2024-07-09',
    estimate: 5,
    blockedBy: [],
    description:
      'Indexed, updated and deleted per day, stacked, with the weekend dip visible rather than smoothed away.',
    subtasks: [],
    created: '2024-06-25',
    updated: '2024-07-08',
  },
  {
    id: 'ARC-106',
    title: 'A series palette that survives colour blindness',
    status: 'review',
    priority: 'high',
    assignee: 'u-03',
    epic: 'Archive UI',
    labels: ['a11y', 'design'],
    due: '2024-07-09',
    estimate: 8,
    blockedBy: [],
    description:
      'The muted set we sketched measures a perceptual distance of 1.6 under deuteranopia at six series — effectively identical. Retune it, and add a script so it cannot regress.',
    subtasks: [
      { id: 'ARC-106-1', label: 'Retune the six hues', done: true },
      { id: 'ARC-106-2', label: 'Port the CIEDE2000 validator', done: true },
      { id: 'ARC-106-3', label: 'Require redundant encoding past four series', done: true },
    ],
    created: '2024-06-26',
    updated: '2024-07-08',
  },
  {
    id: 'ARC-109',
    title: 'Fail the build on a token that is not themed',
    status: 'review',
    priority: 'normal',
    assignee: 'u-06',
    epic: 'Platform',
    labels: ['infra'],
    due: '2024-07-10',
    estimate: 3,
    blockedBy: [],
    description:
      'Three theme blocks are kept in sync by a comment asking people to keep them in sync. A script can simply check.',
    subtasks: [],
    created: '2024-06-27',
    updated: '2024-07-07',
  },
  {
    id: 'ARC-111',
    title: 'Sort by publication date on the mobile result list',
    status: 'review',
    priority: 'low',
    assignee: 'u-05',
    epic: 'Archive UI',
    labels: [],
    due: '2024-07-12',
    estimate: 2,
    blockedBy: [],
    description: 'The control is there on a desktop and quietly absent below 640px.',
    subtasks: [],
    created: '2024-07-01',
    updated: '2024-07-06',
  },

  {
    id: 'ARC-092',
    title: 'Wire the crawl-job drawer to the live queue',
    status: 'done',
    priority: 'normal',
    assignee: 'u-04',
    epic: 'Reindex pipeline',
    labels: [],
    due: '2024-07-03',
    estimate: 5,
    blockedBy: [],
    description: 'The drawer showed the job as it was when the page loaded, not as it is.',
    subtasks: [],
    created: '2024-06-18',
    updated: '2024-07-03',
  },
  {
    id: 'ARC-095',
    title: 'A judged set for the relevance workbench',
    status: 'done',
    priority: 'high',
    assignee: 'u-02',
    epic: 'Relevance v3',
    labels: ['docs'],
    due: '2024-07-04',
    estimate: 8,
    blockedBy: [],
    description:
      'Two hundred queries with editor-assigned grades. Without it every ranking change is an argument about taste.',
    subtasks: [],
    created: '2024-06-17',
    updated: '2024-07-04',
  },
  {
    id: 'ARC-097',
    title: 'Compact density for the document table',
    status: 'done',
    priority: 'low',
    assignee: 'u-03',
    epic: 'Archive UI',
    labels: ['design'],
    due: '2024-07-02',
    estimate: 2,
    blockedBy: [],
    description: 'Twenty-four rows on a laptop instead of fourteen, without shrinking the type.',
    subtasks: [],
    created: '2024-06-19',
    updated: '2024-07-02',
  },
  {
    id: 'ARC-099',
    title: 'Move tile parsing off the main thread',
    status: 'done',
    priority: 'normal',
    assignee: 'u-06',
    epic: 'Platform',
    labels: ['perf'],
    due: '2024-07-05',
    estimate: 5,
    blockedBy: [],
    description: 'Panning the route map dropped frames on anything older than a two-year-old phone.',
    subtasks: [],
    created: '2024-06-21',
    updated: '2024-07-05',
  },
  {
    id: 'ARC-102',
    title: 'Retire the legacy /search/v1 endpoint',
    status: 'done',
    priority: 'normal',
    assignee: 'u-01',
    epic: 'Platform',
    labels: ['infra'],
    due: '2024-07-05',
    estimate: 3,
    blockedBy: [],
    description: 'Two callers left, both internal, both migrated in May.',
    subtasks: [],
    created: '2024-06-14',
    updated: '2024-07-05',
  },
  {
    id: 'ARC-105',
    title: 'Undo on destructive member actions',
    status: 'done',
    priority: 'normal',
    assignee: 'u-05',
    epic: 'Archive UI',
    labels: ['a11y'],
    due: '2024-07-06',
    estimate: 3,
    blockedBy: [],
    description:
      'Removing a member is one click and permanent. A confirmation that names what will happen, then a toast carrying an undo.',
    subtasks: [],
    created: '2024-06-22',
    updated: '2024-07-06',
  },
]

/**
 * Points remaining against the straight line to zero.
 *
 * `remaining` is null from the 9th onwards — the sprint has not been worked
 * yet, and a chart that draws a flat line into the future is stating a fact it
 * does not have. `ideal` runs the full span, because that part *is* known.
 */
export interface SprintDay {
  day: string
  remaining: number | null
  ideal: number
}

export const SPRINT_BURNDOWN: SprintDay[] = [
  { day: '2024-07-01', remaining: 86, ideal: 86 },
  { day: '2024-07-02', remaining: 82, ideal: 79 },
  { day: '2024-07-03', remaining: 74, ideal: 71 },
  { day: '2024-07-04', remaining: 74, ideal: 64 },
  { day: '2024-07-05', remaining: 66, ideal: 57 },
  { day: '2024-07-06', remaining: 66, ideal: 50 },
  { day: '2024-07-07', remaining: 66, ideal: 43 },
  { day: '2024-07-08', remaining: 58, ideal: 36 },
  { day: '2024-07-09', remaining: null, ideal: 29 },
  { day: '2024-07-10', remaining: null, ideal: 21 },
  { day: '2024-07-11', remaining: null, ideal: 14 },
  { day: '2024-07-12', remaining: null, ideal: 0 },
]
