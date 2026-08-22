/**
 * Verifies the built bundle is actually consumable — that `dist/` imports,
 * renders, and produces the markup the CSS is written against. Catches the
 * class of failure a typecheck cannot: a broken export map, a component that
 * throws on the server, a renamed class the stylesheet no longer matches.
 *
 *   pnpm build && node scripts/smoke.mjs
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h } from 'react'
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
      h(DS.Button, { variant: 'primary' }, 'Apply')
    )
  )
)

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
}

let failed = 0
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`)
}

console.log(`\n${Object.keys(checks).length - failed}/${Object.keys(checks).length} checks passed`)
process.exitCode = failed === 0 ? 0 : 1
