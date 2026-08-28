/**
 * Verifies the built bundle is actually consumable — that `dist/` imports,
 * renders, and produces the markup the CSS is written against. Catches the
 * class of failure a typecheck cannot: a broken export map, a component that
 * throws on the server, a renamed class the stylesheet no longer matches.
 *
 * Both output formats are exercised. The ESM build gets the full render; the
 * CJS build is required and its exports inspected, because `require()` of an
 * ESM-only transitive dependency fails at load time and an ESM-only test would
 * never see it.
 *
 *   pnpm build && node scripts/smoke.mjs
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h } from 'react'
import { createRequire } from 'node:module'
import * as DS from '../dist/index.js'

const html = renderToStaticMarkup(
  h(
    DS.ThemeProvider,
    { theme: 'light', applyTo: 'element' },
    h(
      DS.AppShell,
      {
        sidebar: h(
          DS.FacetGroup,
          { title: 'Section', selectedCount: 1 },
          h(DS.FacetItem, { label: 'Finance', count: 1284, defaultChecked: true })
        ),
      },
      h(DS.ResultMeta, { total: 4231, from: 1, to: 6, took: 82, query: 'swiss banking' }),
      h(
        DS.ResultList,
        null,
        h(DS.ResultCard, {
          kicker: 'Finance',
          title: 'The quiet consolidation of Swiss private banking',
          snippet: 'Three decades of mergers have left the sector…',
          query: 'swiss banking',
          href: '#',
          meta: ['3 Nov 2024', 'M. Brunner'],
          tags: h(DS.Badge, { tone: 'success', size: 'sm' }, 'Indexed'),
        })
      ),
      h(DS.Pagination, { page: 1, pageCount: 212, onChange: () => {} }),
      h(DS.Button, { variant: 'primary' }, 'Apply'),
      // Charts pull visx (and d3 under it) into the graph. Rendering one here
      // is what proves the scale and shape maths run on a server at all.
      h(DS.Sparkline, {
        label: 'Queries, last seven days',
        summary: 'up 12 per cent',
        data: [4, 9, 7, 12, 11, 18, 21],
        value: n => n,
        kind: 'area',
        endpoint: true,
      }),
      // The form controls that do real work before hydration: the editor
      // renders its preview from the markdown parser, and the date field
      // formats its value through Intl. Both would throw on a server if they
      // reached for `window` or `navigator` at render time — which is exactly
      // what an editor toolbar and a locale-aware placeholder are tempted to do.
      h(DS.MarkdownEditor, {
        label: 'Body',
        value: '## Heading\n\nA **bold** claim and a [link](https://example.org).',
        onChange: () => {},
        preview: 'split',
      }),
      h(DS.DateInput, { label: 'Published', value: '2024-07-08', onChange: () => {} }),
      h(DS.TimeInput, { label: 'At', value: '06:00', onChange: () => {}, hideList: true })
    )
  )
)

/**
 * Require the CJS build. Any ESM-only dependency reached through `require()`
 * throws ERR_REQUIRE_ESM here and nowhere else.
 */
let cjs = null
let cjsError = null
try {
  cjs = createRequire(import.meta.url)('../dist/index.cjs')
} catch (error) {
  cjsError = error
}
if (cjsError) console.error(`\n  ${cjsError.code ?? 'Error'}: ${cjsError.message}\n`)

const checks = {
  'root class present': html.includes('cds-root'),
  'theme attribute written': html.includes('data-cds-theme="light"'),
  'shell renders its sidebar': html.includes('cds-shell__sidebar'),
  'facet counts are grouped': html.includes('1,284'),
  'result title renders': html.includes('cds-result__title'),
  'query terms are marked': html.includes('<mark class="cds-mark">'),
  'result total is formatted': html.includes('4,231'),
  'pagination marks the current page': html.includes('aria-current="page"'),
  'button variant class applied': html.includes('cds-btn--primary'),
  // visx prepends its own `visx-linepath` class, so match on ours not the whole
  // attribute — and assert the path data actually got computed, not just that
  // an element appeared.
  'sparkline renders a computed path': /<path class="[^"]*cds-sparkline__line"[^>]*d="M[\d.]+,[\d.]+L/.test(html),
  'sparkline is labelled for AT': html.includes('aria-label="Queries, last seven days. up 12 per cent"'),
  // The preview is rendered markup, not an escaped string — which is the
  // whole security claim, checked rather than asserted in a comment.
  'markdown preview renders elements': html.includes('<strong>bold</strong>'),
  'markdown escapes nothing into the dom': !html.includes('&lt;strong&gt;'),
  'editor toolbar renders on the server': html.includes('aria-label="Formatting"'),
  'date input formats through Intl': html.includes('value="08/07/2024"'),
  'time input renders its value': html.includes('value="06:00"'),
  'cjs build loads': cjs !== null,
  'cjs exports match esm': cjs !== null && Object.keys(DS).every(name => name in cjs),
}

let failed = 0
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`)
}

console.log(`\n${Object.keys(checks).length - failed}/${Object.keys(checks).length} checks passed`)
process.exitCode = failed === 0 ? 0 : 1
