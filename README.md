# clean-design-system

A quiet, editorial design system for complex search applications.

Its manners come from Swiss and British newspaper design — the NZZ and The
Economist in particular: a serif for editorial content, a grotesque for
interface chrome, hairline rules instead of boxes and shadows, generous
whitespace, and exactly one loud colour. Its job, though, is dense application
work: faceted search, long result lists, sortable tables, saved queries.

**[Browse the Storybook →](https://gitu.github.io/clean-design-system/)** — every
component with its states and a props table generated from the source, plus
fourteen example applications built from the system.

- 72 React components, TypeScript throughout
- Plain CSS with custom properties — no runtime, no CSS framework, no build plugin
- Light and dark, driven by one attribute
- Self-hosted Inter, Source Serif 4 and IBM Plex Mono — genuinely optional: the
  stylesheet pulls no fonts of its own, and the tokens fall back to Georgia and
  the system sans

## Install

Two ways, for two different relationships with a design system.

**As a package**, when you want upgrades as a version bump. It is published to
[GitHub Packages](https://github.com/gitu/clean-design-system/pkgs/npm/clean-design-system),
which needs a token to install even though the package is public:

```bash
# ~/.npmrc — a classic PAT with read:packages
@gitu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_your_token

npm install @gitu/clean-design-system
```

**As source you own**, when the system is a starting point rather than a
dependency:

```bash
npx shadcn@latest add https://gitu.github.io/clean-design-system/r/button.json
```

The [shadcn CLI](https://ui.shadcn.com/docs/registry) installs from any public
registry URL, so this works without a CLI of our own. Transitive dependencies
resolve automatically — asking for `date-input` brings the tokens, `cx` and the
seven components a date field is actually made of.

No account needed for this route, which is the practical difference between the
two: the registry is plain JSON over HTTPS.

The registry is **generated from `src/` on every build** (`scripts/build-registry.mjs`),
so it cannot drift from the package. Browse it at
[`/registry.json`](https://gitu.github.io/clean-design-system/registry.json), or
read the [Installation page](https://gitu.github.io/clean-design-system/?path=/docs/foundations-installation--docs)
for the `components.json` you need and what the trade costs.

No Tailwind. This is plain CSS with custom properties, and the reset is wrapped
in `:where()` so it carries zero specificity and will not fight whatever else
you have.

### Maps

The delivery-router pattern renders a real MapLibre map on **OpenFreeMap** —
full-planet OpenStreetMap tiles with no API key, no sign-up and no rate limit.
The basemap is repainted at load from the live `--cds-color-*` properties, so it
follows the theme instead of sitting on the page as a cool-grey rectangle from
somebody else's product. `VITE_MAP_STYLE` overrides it with a commercial style.

`maplibre-gl` is a **devDependency** and the map lives in `src/stories/`. It is
not part of the system: a map is not editorial search, and the library is larger
than everything this package ships put together. Note that `.storybook/main.ts`
excludes it from Vite's dependency pre-bundler — through the optimiser its tile
worker cannot fetch, and the map renders its chrome and then silently never
requests a tile.

### Dates, times and prose

`DateInput`, `TimeInput` and `DateTimeInput` are deliberately not
`<input type="date">` / `type="time"`. The native controls render in the
browser's own UI font and metrics, show the *browser's* locale format rather
than the application's, give no way to mark days unavailable, and — on desktop
Firefox — offer no picker at all. In a system whose subject is typographic
consistency that is a visible seam in every form.

What they buy instead is typing. `8.7.`, `8 Jul`, `today`, `+3d` and `friday`
all parse; so do `930`, `9.30`, `9h30`, `9am` and `noon`. The calendar and the
suggestion list stay for what pointing is better at. The cost is honest and is
written down in `date-parse.ts`.

`MarkdownEditor` is a `<textarea>`, not a `contentEditable` surface. The value
is the markdown source, and the preview is `Markdown`, which constructs React
elements and never hands a string to the DOM as markup — so there is no
sanitiser anywhere on the path from the field to the published page, because
there is nothing to sanitise. The toolbar and its shortcuts act on the
selection, and every transform is a pure function in `markdown-commands.ts`.

Times are stored as `HH:mm` and datetimes as `YYYY-MM-DDTHH:mm` with no zone:
an embargo lifting at 06:00 lifts at 06:00 on the desk, and turning that into an
instant means choosing a zone at the moment of entry and being wrong at the next
clock change.

### Dependencies

The charts are built on visx's scale and shape maths, so three small packages
come along: `@visx/scale`, `@visx/shape` and `@visx/curve`. Nothing else in the
system touches them, and they are external to the bundle, so an app that imports
only a `Button` never loads them.

The axes, legend, tooltip and brush are written here rather than taken from
visx. `@visx/axis` and `@visx/legend` reach `@visx/text`, which pulls in lodash
and measures strings through the DOM; `@visx/responsive` and `@visx/tooltip`
measure on mount and so render nothing on a server. Roughly 250 lines in
exchange for keeping the whole system server-renderable and lodash-free.

## Use

```tsx
import '@gitu/clean-design-system/fonts/fonts.css' // optional, self-hosted faces
import '@gitu/clean-design-system/styles.css'
import { ThemeProvider, SearchInput, ResultCard, ResultList } from '@gitu/clean-design-system'

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

`ThemeToggle` is the whole control in one button. It steps through three states,
not two: following the system → the opposite of what is on screen → what the
system says, pinned → following again. A plain light/dark switch has no way back
to *following*, so the first press would lose that behaviour permanently. The
choice is kept in `localStorage` under `cds-theme`; pass `storageKey={false}` to
keep it in memory, and read it from a blocking inline script in your own
`<head>` if you mind the one-frame flash on a pinned theme.

By default the attribute is written to `<html>` so portalled surfaces — the
command palette, drawers — inherit it. Pass `applyTo="element"` to scope it to
the subtree instead, which is what you want when embedding in a host page.

To restyle the system, override the semantic tokens; never the primitives:

```css
:root {
  --cds-color-accent: #8a0a12;
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
status, series), `--cds-space-0…24`, `--cds-text-2xs…4xl`, `--cds-radius-*`,
`--cds-shadow-*`, `--cds-duration-*`, `--cds-stagger`, `--cds-ease-*`,
`--cds-control-height-*`.

**An assistant turn is not a paragraph.** The `Chat*` family exists because a
model that uses tools produces a sequence of things it *did* — ran a query,
computed a figure, drew a chart, asked a question — and each has to be shown as
itself. `ChatToolCall` says what ran; `ChatArtifact` carries a source line, so a
chart inside an answer states where its numbers came from and a reader can tell
a query from a recollection. `ChatQuestion` takes a *set* of questions, single
or multiple choice, each accepting answers the model did not think of — a model
needing three facts should not spend three turns getting them.
`ChatMarkdown` renders a documented subset as React elements and never injects
HTML, because model output is untrusted input.

**Responsive by collapse, not by breakpoint soup.** `AppShell` drops its aside
below 1100px and its filter sidebar below 860px — pair the latter with a
`Drawer`. Where the aside carries content that exists nowhere else, pass
`asideCollapse="stack"` so a narrow screen moves it below the content instead
of throwing it away. `Toolbar` wraps, `Tabs` scroll sideways, `DataTable`
scrolls and honours each column's `hideBelow`, and charts thin their own axis
ticks to what the width can hold rather than drawing labels on top of each
other. Drawers leave a strip of the page showing on a phone, so a detail panel
still reads as a layer over the list rather than a different screen.

**Rules over boxes.** Separate regions with a hairline (`Divider`, or
`border-bottom: var(--cds-hairline) solid var(--cds-color-rule)`). Reserve
shadow for things that genuinely float — popovers, drawers.

**One accent.** `--cds-color-accent` means "here": selection, focus, applied
filters, active tabs. Primary buttons use `--cds-color-ink`, the maximum-
contrast solid, so the accent never competes with itself. Red is reserved for
`danger` alone — if something is red, it is wrong, not merely selected.

**Six series, four of them safe on colour alone.** `--cds-color-series-1…6` is
the only categorical scale, and it exists for charts. Slot 1 *is* the accent, so
a single-series chart is drawn in the system's own colour. Slots 1–4 stay
separable under normal, deuteranopic, protanopic and tritanopic vision; past
four, a muted palette cannot do it on hue alone, so a fifth or sixth series must
carry a dash pattern, a distinct marker or a direct label.
`scripts/check-series-palette.mjs` enforces both halves of that and runs in
`pnpm verify`. Selection in a chart is expressed by opacity, never by hue — so
colour only ever means *which series*.

## Components

**Root** — `ThemeProvider`

**Primitives** — `Button` `IconButton` `Icon` `Badge` `Tag` `Kbd` `Spinner`
`Skeleton` `Divider` `Progress` `Avatar`

**Forms** — `Field` `Input` `Textarea` `Select` `Checkbox` `Radio` `RadioGroup`
`Switch` `SegmentedControl` `Calendar` `DateRangePicker`

**Search** — `SearchInput` `Highlight` `ResultMeta` `ResultCard` `ResultList`
`Pagination` `SortControl` `ActiveFilters` `FacetGroup` `FacetItem`
`RangeFilter` `CommandPalette`

**Data** — `DataTable` `EmptyState`

**Charts** — `LineChart` `AreaChart` `BarChart` `Sparkline` `ChartFrame`
`ChartLegend` `ChartTooltip` `ChartGroup`

**Layout** — `AppShell` `Toolbar` `Panel` `Stack` `Tabs` `Breadcrumbs` `NavList`
`Drawer` `Dialog` `Menu` `Toast` `ThemeToggle`

**Assistant** — `ChatThread` `ChatMessage` `ChatComposer` `ChatToolCall`
`ChatQuestion` `ChatArtifact` `ChatFile` `ChatDiff` `ChatImage` `ChatMarkdown`

Every component's props are documented in its source and surfaced in Storybook's
controls table.

## Development

```bash
pnpm install
pnpm storybook       # http://localhost:6006
pnpm build           # dist/ — ESM, CJS, .d.ts and a single stylesheet
pnpm typecheck
pnpm test            # every story, in a real browser
pnpm verify          # all of the above, in order
```

### Tests

`pnpm test` runs **every story as a test** through `@storybook/addon-vitest`:
each is mounted in headless Chromium, its `play` function is run, and the axe
rules from `addon-a11y` are applied as assertions. There is no parallel test
suite to keep in sync — the stories already describe each component's states,
so this makes that description load-bearing.

`a11y: { test: 'error' }` in `.storybook/preview.tsx` is what turns a violation
into a failure. Two stories scope the contrast rule away from disabled controls,
which WCAG 2.2 SC 1.4.3 exempts; nothing else is excluded.

### Token gates

Two scripts run in `pnpm verify` and guard things a review would not reliably
catch:

- `check-tokens.mjs` — the dark theme is declared twice (once for the media
  query, once for the attribute). This asserts the two blocks stay identical
  and that every light colour token has a dark counterpart.
- `check-series-palette.mjs` — measures the chart palette's perceptual
  separation (CIEDE2000) under normal vision and under simulated deuteranopia,
  protanopia and tritanopia, plus non-text contrast against each canvas. This
  is what makes "slots 1–4 are safe on hue alone" a fact rather than a hope.

### Screenshots

Visual checks are screenshot-based rather than eyeballed:

```bash
pnpm storybook &
pnpm shots -- --theme light
pnpm shots -- --theme dark
```

Every **Patterns** story also has a `Mobile` story showing the same screen at
390 × 844. It renders in an iframe rather than a narrowed container, because
every responsive rule here is a `@media (max-width: …)` query and those ask the
viewport, not the element — a shrunk `<div>` would still get the desktop layout
drawn inside it.

One PNG per story, in both themes, failing on any console or page error. The
browser emulates `prefers-reduced-motion`, so every duration token collapses to
`0ms` and animated stories land on their final frame instead of being caught
mid-flight — which is what makes the images comparable between runs.

## Releasing

```bash
pnpm version minor && git push --follow-tags
```

A `v*` tag runs `.github/workflows/release.yml`, which re-runs every gate,
checks the tag agrees with `package.json`, and publishes.

It publishes to **GitHub Packages**, authenticated with the `GITHUB_TOKEN` that
Actions mints for the run — so there is no stored credential to rotate, revoke
or leak, and no setup beyond pushing the tag.

The trade is that GitHub Packages requires authentication to *install*, even for
a public package, so consumers need a PAT with `read:packages`. If that is the
wrong trade later, npmjs.com over OIDC is the alternative; it installs with no
account but the first publish has to be manual, because npm cannot attach a
trusted publisher to a package name that does not exist yet.

`prepublishOnly` runs `build`, `smoke` and `check-package` for anyone publishing
by hand, so the same gates apply either way.

### check-package

`pnpm check-package` packs the tarball, installs it into an empty project with
npm, and uses it — resolving every subpath in `exports`, rendering on a server,
and asserting the stylesheet pulls nothing that was not published.

It exists because `pnpm smoke` imports `dist/index.js` by relative path, so it
passes happily while `exports` points at a file that was never shipped. That is
the expensive mistake: a published version cannot be withdrawn, only superseded.
It found two before the first release — a stylesheet importing fonts from a
directory the package did not publish, and those same fonts shipped twice.

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
