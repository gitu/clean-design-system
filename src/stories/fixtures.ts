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
