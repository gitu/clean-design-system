/**
 * clean-design-system — a quiet, editorial design system for complex search
 * applications.
 *
 * Import the stylesheet once, at your application's entry point:
 *   import '@gitu/clean-design-system/fonts/fonts.css'  // optional, self-hosted faces
 *   import '@gitu/clean-design-system/styles.css'
 *
 * Then wrap the tree in a <ThemeProvider>. Nothing is styled without it.
 */
import './styles/index.css'

/* --- Root --- */
export * from './components/ThemeProvider'

/* --- Primitives --- */
export * from './components/Icon'
export * from './components/Button'
export * from './components/IconButton'
export * from './components/Badge'
export * from './components/Tag'
export * from './components/Kbd'
export * from './components/Spinner'
export * from './components/Skeleton'
export * from './components/Divider'
export * from './components/Progress'
export * from './components/Avatar'

/* --- Forms --- */
export * from './components/Field'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Switch'
export * from './components/SegmentedControl'
export * from './components/Calendar'
export * from './components/DateInput'
export * from './components/TimeInput'
export * from './components/DateTimeInput'
export * from './components/DateRangePicker'
export * from './components/MarkdownEditor'

/* --- Search --- */
export * from './components/SearchInput'
export * from './components/Highlight'
export * from './components/ResultMeta'
export * from './components/ResultCard'
export * from './components/ResultList'
export * from './components/Pagination'
export * from './components/SortControl'
export * from './components/ActiveFilters'
export * from './components/FacetGroup'
export * from './components/FacetItem'
export * from './components/RangeFilter'
export * from './components/CommandPalette'

/* --- Charts --- */
export * from './components/LineChart'
export * from './components/AreaChart'
export * from './components/BarChart'
export * from './components/Sparkline'
export * from './components/ChartFrame'
export * from './components/ChartLegend'
export * from './components/ChartTooltip'
export * from './components/ChartGroup'
// The shared chart types live in exactly one place. Re-exporting them from
// each chart's index as well would trip isolatedModules on the duplicate.
export type {
  ChartKey,
  ChartMargin,
  ChartDomain,
  ChartSeries,
  ChartDatumEvent,
  ChartTooltipContext,
} from './components/Chart/chart-types'

/* --- Data --- */
export * from './components/DataTable'
export * from './components/EmptyState'

/* --- Layout --- */
export * from './components/AppShell'
export * from './components/Toolbar'
export * from './components/Panel'
export * from './components/Stack'
export * from './components/Tabs'
export * from './components/Breadcrumbs'
export * from './components/NavList'
export * from './components/Drawer'
export * from './components/Dialog'
export * from './components/Menu'
export * from './components/Toast'

/* --- Prose --- */
export * from './components/Markdown'

/* --- Assistant --- */
export * from './components/Chat'

/* --- Utilities --- */
export { cx } from './utils/cx'
export type { ClassValue } from './utils/cx'
