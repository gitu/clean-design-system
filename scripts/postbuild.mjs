/**
 * Checks that the build emitted a stylesheet, and that the one thing the
 * package promises about it is true.
 *
 * This used to copy `fonts/` into `dist/` and prepend an unconditional
 * `@import './fonts/fonts.css'` to `dist/index.css`, on the reasoning that
 * `dist/` should be a self-contained, relocatable bundle. Two things were wrong
 * with that, both found by reading `npm pack` output rather than the code:
 *
 *   1. It made the faces mandatory. Importing `clean-design-system/styles.css`
 *      pulled 396 KB of woff2 whether the consumer wanted them or not — while
 *      the README, `src/index.ts` and `src/styles/index.css` all said, in those
 *      words, that they were optional. The tokens carry real fallbacks
 *      (Iowan Old Style, Georgia; the system sans), so opting out is a
 *      supported choice and the build was quietly removing it.
 *   2. It shipped them twice. `files` publishes both `fonts/` — which is what
 *      the `./fonts/*` export points at — and `dist/fonts/`, which nothing
 *      exported. Half the tarball was a duplicate nobody could import by name.
 *
 * So the faces stay opt-in, as documented:
 *
 *   import 'clean-design-system/styles.css'      // tokens, reset, components
 *   import 'clean-design-system/fonts/fonts.css' // optional, self-hosted faces
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const CSS = 'dist/index.css'

if (!existsSync(CSS)) {
  console.error(`postbuild: ${CSS} not found — did the build emit any CSS?`)
  process.exit(1)
}

const css = await readFile(CSS, 'utf8')

/**
 * The stylesheet must not reach for a font file on its own.
 *
 * A guard rather than a comment, because the failure is invisible: an `@import`
 * of a path that is no longer published resolves to a 404 at runtime in the
 * consumer's app, and nothing here would have noticed.
 */
if (/@import\s+['"][^'"]*fonts/.test(css)) {
  console.error('postbuild: dist/index.css imports a font file — the faces are meant to be opt-in')
  process.exit(1)
}

const kb = (css.length / 1024).toFixed(0)
console.log(`postbuild: dist/index.css is ${kb} KB, and pulls no fonts of its own`)
