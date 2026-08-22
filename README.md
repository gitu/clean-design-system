# clean-design-system

A quiet, editorial design system for complex search applications.

Its manners come from Swiss and British newspaper design — the NZZ and The
Economist in particular: a serif for editorial content, a grotesque for
interface chrome, hairline rules instead of boxes and shadows, generous
whitespace, and exactly one loud colour. Its job, though, is dense application
work: faceted search, long result lists, sortable tables, saved queries.

- 39 React components, TypeScript throughout
- Plain CSS with custom properties — no runtime, no CSS framework, no build plugin
- Light and dark, driven by one attribute
- Self-hosted Inter, Source Serif 4 and IBM Plex Mono (optional)

## Install

```bash
npm install clean-design-system
```

## Use

```tsx
import 'clean-design-system/fonts/fonts.css' // optional, self-hosted faces
import 'clean-design-system/styles.css'
import { ThemeProvider, SearchInput, ResultCard, ResultList } from 'clean-design-system'

export function App() {
  return (
    <ThemeProvider>
      <SearchInput size="lg" placeholder="Search the archive" />
      <ResultList>
        <ResultCard
          kicker="Finance"
          title="The quiet consolidation of Swiss private banking"
          snippet="Three decades of mergers have left the sector with a handful of institutions…"
          query="swiss banking"
          meta={['3 Nov 2024', 'M. Brunner', '2,140 words']}
          href="/a/38211"
        />
      </ResultList>
    </ThemeProvider>
  )
}
```

**`ThemeProvider` is required.** It supplies the `cds-root` class that carries
the base typography, colour and box model, and it owns the theme attribute the
tokens key off. Components rendered outside it are unstyled.

## Theming

Tokens resolve in this order: an explicit `data-cds-theme="dark"` or
`"light"` wins; with no attribute, `prefers-color-scheme` decides.

```tsx
<ThemeProvider defaultTheme="system" />        // follows the OS (default)
<ThemeProvider theme="dark" />                 // pinned
```

```tsx
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
```

By default the attribute is written to `<html>` so portalled surfaces — the
command palette, drawers — inherit it. Pass `applyTo="element"` to scope it to
the subtree instead, which is what you want when embedding in a host page.

To restyle the system, override the semantic tokens; never the primitives:

```css
:root {
  --cds-color-accent: #0b5cad;
  --cds-color-rule: #dfe3e8;
  --cds-font-serif: 'Freight Text', Georgia, serif;
}
```

## The styling idiom

Style your own layout glue with tokens and the type-role classes, not ad-hoc
values. Every token is a CSS custom property under `--cds-*`; the full set is
in `src/styles/tokens/`.

**Type roles** — apply one class rather than setting font properties by hand:

| Serif (editorial) | Sans (interface) |
|---|---|
| `.cds-display` `.cds-headline` `.cds-title` | `.cds-ui` `.cds-ui-sm` `.cds-label` |
| `.cds-subtitle` `.cds-lede` `.cds-body` | `.cds-body-sm` `.cds-kicker` `.cds-mono` |

Plus `.cds-numeric` (tabular figures — mandatory anywhere numbers stack),
`.cds-text-muted` / `-subtle` / `-accent`, `.cds-link`, `.cds-link-quiet`
(for links in dense tables), and `.cds-rule` / `-strong` / `-accent`.

**Token families**: `--cds-color-*` (canvas, surface, text, rule, accent, ink,
status), `--cds-space-0…24`, `--cds-text-2xs…4xl`, `--cds-radius-*`,
`--cds-shadow-*`, `--cds-duration-*`, `--cds-ease-*`, `--cds-control-height-*`.

**Rules over boxes.** Separate regions with a hairline (`Divider`, or
`border-bottom: var(--cds-hairline) solid var(--cds-color-rule)`). Reserve
shadow for things that genuinely float — popovers, drawers.

**One accent.** `--cds-color-accent` means "here": selection, focus, applied
filters, active tabs. Primary buttons use `--cds-color-ink`, the maximum-
contrast solid, so the red never competes with itself.

## Components

**Root** — `ThemeProvider`

**Primitives** — `Button` `IconButton` `Icon` `Badge` `Tag` `Kbd` `Spinner`
`Skeleton` `Divider`

**Forms** — `Field` `Input` `Textarea` `Select` `Checkbox` `Radio` `RadioGroup`
`Switch` `SegmentedControl`

**Search** — `SearchInput` `Highlight` `ResultMeta` `ResultCard` `ResultList`
`Pagination` `SortControl` `ActiveFilters` `FacetGroup` `FacetItem`
`RangeFilter` `CommandPalette`

**Data** — `DataTable` `EmptyState`

**Layout** — `AppShell` `Toolbar` `Panel` `Stack` `Tabs` `Breadcrumbs` `Drawer`

Every component's props are documented in its source and surfaced in Storybook's
controls table.

## Development

```bash
pnpm install
pnpm storybook       # http://localhost:6006
pnpm build           # dist/ — ESM, CJS, .d.ts and a single stylesheet
pnpm typecheck
```

Visual checks are screenshot-based rather than eyeballed:

```bash
pnpm storybook &
node scripts/screenshot-stories.mjs --out .shots --theme light
node scripts/screenshot-stories.mjs --out .shots --theme dark
```

It writes one PNG per story and fails on any console or page error.

## Conventions

- Component CSS is colocated (`Button.tsx` + `Button.css`) and collected into
  one stylesheet at build time.
- Reset rules are wrapped in `:where()` so they can never outrank a component
  class. This is load-bearing — see the comment at the top of
  `src/styles/base/reset.css`.
- Components take `className` and forward refs where a DOM node is meaningful.
- Controlled and uncontrolled both work: pass `value` to control, omit it and
  the component keeps its own state while still reporting through `onChange`.

## Licence

MIT. Bundled faces are SIL OFL 1.1 — Inter, Source Serif 4 and IBM Plex Mono.
