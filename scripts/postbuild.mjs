/**
 * Copies the self-hosted faces next to the built stylesheet and prepends an
 * @import for them, so `dist/` is a complete, relocatable bundle:
 *
 *   dist/index.css  ──@import──>  dist/fonts/fonts.css  ──url()──>  *.woff2
 *
 * The fonts are kept out of the esbuild graph on purpose: bundling them would
 * rewrite the filenames to content hashes and make the folder unreadable.
 */
import { cp, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const CSS = 'dist/index.css'
const IMPORT = "@import './fonts/fonts.css';"

if (!existsSync(CSS)) {
  console.error(`postbuild: ${CSS} not found — did the build emit any CSS?`)
  process.exit(1)
}

await cp('fonts', 'dist/fonts', { recursive: true })

const css = await readFile(CSS, 'utf8')
if (!css.startsWith(IMPORT)) {
  await writeFile(CSS, `${IMPORT}\n${css}`)
}

console.log('postbuild: fonts copied to dist/fonts, @import prepended to dist/index.css')
