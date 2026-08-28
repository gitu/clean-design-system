/**
 * Packs the tarball, installs it into an empty project, and uses it.
 *
 *   pnpm build && node scripts/check-package.mjs
 *
 * This is the only check that exercises what consumers actually touch: the
 * `exports` map and the `files` list. `smoke.mjs` imports `../dist/index.js` by
 * relative path, so it passes happily while `exports` points at a file that was
 * never published — the two most expensive mistakes you can make on npm, since
 * a broken version cannot be taken back.
 *
 * What it would have caught, had it existed:
 *
 *   - `dist/index.css` carried an `@import './fonts/fonts.css'` while the
 *     `./fonts/*` export pointed at the repository root. Publishing without
 *     `dist/fonts` would have 404'd every consumer's stylesheet.
 *   - The faces shipped twice, because `files` published both copies.
 *
 * It installs with npm rather than pnpm on purpose: pnpm's symlinked store is
 * more forgiving of a wrong `exports` map than npm's flat `node_modules`, and
 * being forgiving is exactly what we do not want here.
 */
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

if (!existsSync(path.join(ROOT, 'dist/index.js'))) {
  console.error('check-package: dist/ is missing — run `pnpm build` first')
  process.exit(1)
}

const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'))

/** A real file to stand in for each wildcard subpath in `exports`. */
const WILDCARD_PROBES = { './fonts/*': './fonts/fonts.css' }
const dir = await mkdtemp(path.join(tmpdir(), 'cds-pack-'))
const checks = {}

try {
  const tarball = run('npm', ['pack', '--silent', '--pack-destination', dir], ROOT).trim()
  const tgz = path.join(dir, tarball)

  await writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'consumer', version: '0.0.0', private: true, type: 'module' }, null, 2)
  )

  run('npm', ['install', '--silent', '--no-audit', '--no-fund', tgz, 'react', 'react-dom'], dir)

  /* Every path a consumer is promised, resolved the way Node resolves it. */
  const probe = `
    import { createRequire } from 'node:module'
    import { renderToStaticMarkup } from 'react-dom/server'
    import { createElement as h } from 'react'
    import * as ESM from '${pkg.name}'

    const require = createRequire(import.meta.url)
    const cjs = require('${pkg.name}')

    // A wildcard subpath is a pattern, not a path — resolving './fonts/*'
    // literally always fails. Each one is probed with a real file behind it.
    const WILDCARD = ${JSON.stringify(WILDCARD_PROBES)}
    const subpaths = ${JSON.stringify(Object.keys(pkg.exports))}
    const resolved = {}
    for (const sub of subpaths) {
      const concrete = WILDCARD[sub] ?? sub
      const spec = concrete === '.' ? '${pkg.name}' : '${pkg.name}/' + concrete.replace('./', '')
      try { require.resolve(spec); resolved[sub] = true } catch { resolved[sub] = false }
    }

    const html = renderToStaticMarkup(
      h(ESM.ThemeProvider, { theme: 'light', applyTo: 'element' },
        h(ESM.Button, { variant: 'primary' }, 'Apply'),
        h(ESM.DateInput, { label: 'Published', value: '2024-07-08', onChange: () => {} }),
        // split preview, because the default pane is Write and shows none.
        h(ESM.MarkdownEditor, { label: 'Body', value: '**b**', onChange: () => {}, preview: 'split' })))

    console.log(JSON.stringify({
      esm: Object.keys(ESM).length,
      cjs: Object.keys(cjs).length,
      resolved,
      renders: html.includes('cds-btn--primary'),
      intl: html.includes('08/07/2024'),
      markdown: html.includes('<strong>b</strong>'),
    }))
  `
  await writeFile(path.join(dir, 'probe.mjs'), probe)
  const result = JSON.parse(run('node', ['probe.mjs'], dir))

  /* The stylesheet must stand alone: no @import of anything not published. */
  const css = await readFile(path.join(dir, 'node_modules', pkg.name, 'dist/index.css'), 'utf8')
  const imports = [...css.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map(match => match[1])
  const danglingImports = imports.filter(
    spec => !existsSync(path.join(dir, 'node_modules', pkg.name, 'dist', spec))
  )

  checks['tarball packs'] = Boolean(tarball)
  checks['installs into an empty project'] = existsSync(path.join(dir, 'node_modules', pkg.name))
  for (const [sub, ok] of Object.entries(result.resolved)) checks[`exports ${sub}`] = ok
  checks['esm and cjs agree'] = result.esm === result.cjs && result.esm > 50
  checks['renders on the server'] = result.renders
  checks['dates format through Intl'] = result.intl
  checks['markdown renders as elements'] = result.markdown
  checks['stylesheet has no dangling @import'] = danglingImports.length === 0
  checks['LICENSE is published'] = existsSync(path.join(dir, 'node_modules', pkg.name, 'LICENSE'))
  checks['README is published'] = existsSync(path.join(dir, 'node_modules', pkg.name, 'README.md'))

  if (danglingImports.length) console.error(`  dangling: ${danglingImports.join(', ')}`)
} finally {
  await rm(dir, { recursive: true, force: true })
}

let failed = 0
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`)
}
console.log(`\n${Object.keys(checks).length - failed}/${Object.keys(checks).length} checks passed`)
process.exitCode = failed === 0 ? 0 : 1
