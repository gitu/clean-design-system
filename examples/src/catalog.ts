/**
 * The sample applications, and the one list that decides what exists.
 *
 * Everything downstream reads this file: `vite.config.ts` turns each entry into
 * a page directory before the build starts, `boot.tsx` resolves the story it
 * names, and `index.tsx` renders the landing page from it. Adding an example is
 * one entry here and nothing else.
 *
 * It is deliberately plain, serialisable data — no imports, no components, no
 * loader functions. The Vite config imports it while it is still deciding what
 * to build, which is a moment where a module that pulls in React would not
 * load. `module` and `story` are the *names* of a Storybook module and its
 * export; `boot.tsx` does the resolving, where a browser is available.
 */

/** The sections the landing page groups the examples into, in order. */
export const GROUPS = ['Search', 'Operations', 'Documents', 'Front door'] as const

export type Group = (typeof GROUPS)[number]

export interface Example {
  /** URL segment, and the directory the page is built into. */
  slug: string
  /** Shown as the page title and on the card. */
  title: string
  /** One or two sentences on the card. What the screen is *for*. */
  summary: string
  /** Which section of the landing page it appears under. */
  group: Group
  /** File in `src/stories`, without the `.stories.tsx` suffix. */
  module: string
  /** The export in that file to render. Always the fullest one. */
  story: string
}

/**
 * Ordered within each group by how much of the system a screen exercises, so
 * the first card under each heading is the one to open first.
 */
export const EXAMPLES: Example[] = [
  {
    slug: 'search-application',
    title: 'Search application',
    summary:
      'The whole system at once: masthead, faceted sidebar, an applied-filter receipt, results as a list or a table, pagination and a command palette.',
    group: 'Search',
    module: 'SearchApplication',
    story: 'FullApplication',
  },
  {
    slug: 'property-search',
    title: 'Property search',
    summary:
      'The same faceted search against listings rather than documents — cards and a grid, price and area ranges, and the filters again in a drawer on a phone.',
    group: 'Search',
    module: 'PropertySearch',
    story: 'FullApplication',
  },
  {
    slug: 'search-analytics',
    title: 'Search analytics',
    summary:
      'The chart family working as one screen: linked hover, click-to-filter that reaches the table below, legend toggling, drill-down and a brushed time series.',
    group: 'Search',
    module: 'SearchAnalytics',
    story: 'Dashboard',
  },
  {
    slug: 'relevance-workbench',
    title: 'Relevance workbench',
    summary:
      'Two rankers side by side over one query, each result carrying the score breakdown that explains its position as an eighteen-pixel stacked bar.',
    group: 'Search',
    module: 'RelevanceWorkbench',
    story: 'Compare',
  },
  {
    slug: 'index-console',
    title: 'Index console',
    summary:
      'The operational side of a search product — what is being ingested, what is stuck, and what broke, with determinate and indeterminate progress side by side.',
    group: 'Search',
    module: 'IndexConsole',
    story: 'Console',
  },
  {
    slug: 'search-brief',
    title: 'Search brief',
    summary:
      'A standing query, its history, and what the last scan turned up — one screen rather than three, because the three are only useful next to each other.',
    group: 'Search',
    module: 'SearchBrief',
    story: 'Brief',
  },

  {
    slug: 'task-tracker',
    title: 'Task tracker',
    summary:
      'The densest screen here: a board you can drag on, the same tasks as a table, a due-date calendar and the sprint numbers — over one set of filters, with a keyboard route through all of it.',
    group: 'Operations',
    module: 'TaskTracker',
    story: 'Tracker',
  },
  {
    slug: 'workspace',
    title: 'Workspace',
    summary:
      'Two levels of navigation done properly: product areas in the bar, pages in the sidebar, and a shell that survives being narrowed to a phone.',
    group: 'Operations',
    module: 'Workspace',
    story: 'MultiPage',
  },
  {
    slug: 'editorial-calendar',
    title: 'Editorial calendar',
    summary:
      'A month of entries and the two things a calendar is for: seeing where the work falls, and picking a span to look at.',
    group: 'Operations',
    module: 'EditorialCalendar',
    story: 'Month',
  },
  {
    slug: 'user-management',
    title: 'User management',
    summary:
      'A member list with the destructive action done carefully — a danger dialog that names what will happen, and an undo in the toast that follows.',
    group: 'Operations',
    module: 'UserManagement',
    story: 'Members',
  },
  {
    slug: 'delivery-router',
    title: 'Delivery router',
    summary:
      'The furthest thing here from faceted search: a driver’s round as a real map, a queue and one very large button, with a stop list to fall back on when the tiles will not load.',
    group: 'Operations',
    module: 'DeliveryRouter',
    story: 'Round',
  },
  {
    slug: 'viewing-schedule',
    title: 'Viewing schedule',
    summary:
      'Appointments against listings, and a log-a-viewing form anchored to the button that opens it rather than taking the page away to a modal.',
    group: 'Operations',
    module: 'ViewingSchedule',
    story: 'Schedule',
  },

  {
    slug: 'document-reader',
    title: 'Document reader',
    summary:
      'Where you land after clicking a result, and the hardest typography test in the system — the one place the serif has to carry six hundred words rather than a headline.',
    group: 'Documents',
    module: 'DocumentReader',
    story: 'Reader',
  },
  {
    slug: 'document-form',
    title: 'Document form',
    summary:
      'The long form: markdown body with a live preview, dates you type before you point at, a wall-clock embargo, and validation that waits until you ask to save.',
    group: 'Documents',
    module: 'DocumentForm',
    story: 'Editor',
  },
  {
    slug: 'assistant',
    title: 'Assistant',
    summary:
      'A model that can use tools, ask a question back, and show its work — every computed thing on screen says where it came from, so the reader need not trust the sentence.',
    group: 'Documents',
    module: 'Assistant',
    story: 'Conversation',
  },
  {
    slug: 'property-detail',
    title: 'Property detail',
    summary:
      'A record page with a photo reel, the numbers, the prose and the history — the reading view for a listing rather than a document.',
    group: 'Documents',
    module: 'PropertyDetail',
    story: 'FullDetail',
  },
  {
    slug: 'property-intake',
    title: 'Property intake',
    summary:
      'Twenty fields made readable by grouping them the way the person filling them in already thinks: where it is, how big, what it costs, what is in it.',
    group: 'Documents',
    module: 'PropertyIntake',
    story: 'EditForm',
  },

  {
    slug: 'landing-page',
    title: 'Landing page',
    summary:
      'A marketing page built from the same parts as the application — the test of whether a system tuned for dense interface work has anything to say at display sizes.',
    group: 'Front door',
    module: 'Landing',
    story: 'Landing',
  },
  {
    slug: 'sign-in',
    title: 'Sign in',
    summary:
      'Sign-in, which adds nothing to the system and is the point. The only decision worth naming is that the error sits on the field rather than in a banner.',
    group: 'Front door',
    module: 'Auth',
    story: 'SignIn',
  },
]
