/**
 * clean-design-system — a quiet, editorial design system for complex search
 * applications.
 *
 * Import the stylesheet once, at your application's entry point:
 *   import 'clean-design-system/fonts/fonts.css'  // optional, self-hosted faces
 *   import 'clean-design-system/styles.css'
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

/* --- Forms --- */
export * from './components/Field'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/Select'
export * from './components/Checkbox'
export * from './components/Radio'
export * from './components/Switch'
export * from './components/SegmentedControl'

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
export * from './components/Drawer'

/* --- Utilities --- */
export { cx } from './utils/cx'
export type { ClassValue } from './utils/cx'
