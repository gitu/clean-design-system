/**
 * Guards the one structural hazard in `theme.css`: the dark theme is declared
 * twice — once under `@media (prefers-color-scheme: dark)` and once under
 * `[data-cds-theme='dark']` — so a toggle beats the media query in both
 * directions. The file says "keep them in sync"; this makes that a build error
 * rather than a code-review hope.
 *
 * Three assertions:
 *   1. the two dark blocks declare an identical set of name -> value pairs
 *   2. every token in the light block is also declared in both dark blocks
 *   3. no token is declared twice within the same block
 *
 *   node scripts/check-tokens.mjs
 */
import { readFile } from 'node:fs/promises'

const FILE = new URL('../src/styles/tokens/theme.css', import.meta.url)
const css = await readFile(FILE, 'utf8')

/**
 * Slice out one brace-balanced block starting at the given index. Custom
 * property values here never contain braces, so a depth counter is enough.
 */
function blockAt(source, startIndex) {
  const open = source.indexOf('{', startIndex)
  if (open === -1) return null
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(open + 1, i)
    }
  }
  return null
}

/** Every `--cds-*: value` declaration in a block, as a Map plus a duplicate list. */
function declarations(block) {
  const map = new Map()
  const duplicates = []
  const re = /(--cds-[\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(block))) {
    const [, name, value] = m
    const clean = value.trim().replace(/\s+/g, ' ')
    if (map.has(name)) duplicates.push(name)
    map.set(name, clean)
  }
  return { map, duplicates }
}

function find(marker) {
  const at = css.indexOf(marker)
  if (at === -1) throw new Error(`could not find the ${marker} block in theme.css`)
  return blockAt(css, at)
}

// The light block is the `:root, [data-cds-theme='light']` selector at the top.
const light = declarations(find(":root,\n[data-cds-theme='light']"))
// The media-query dark block — nest one level in, past the @media wrapper.
const mediaOuter = find('@media (prefers-color-scheme: dark)')
const mediaDark = declarations(blockAt(mediaOuter, mediaOuter.indexOf(':root')))
const attrDark = declarations(find("[data-cds-theme='dark']"))

const problems = []

for (const [label, block] of [
  ['light', light],
  ['media dark', mediaDark],
  ['attribute dark', attrDark],
]) {
  for (const name of block.duplicates) {
    problems.push(`${name} is declared twice in the ${label} block`)
  }
}

// 1. the two dark blocks must agree exactly
for (const [name, value] of mediaDark.map) {
  if (!attrDark.map.has(name)) {
    problems.push(`${name} is in the media dark block but missing from [data-cds-theme='dark']`)
  } else if (attrDark.map.get(name) !== value) {
    problems.push(
      `${name} differs between the dark blocks: media "${value}" vs attribute "${attrDark.map.get(name)}"`
    )
  }
}
for (const name of attrDark.map.keys()) {
  if (!mediaDark.map.has(name)) {
    problems.push(`${name} is in [data-cds-theme='dark'] but missing from the media dark block`)
  }
}

// 2. every colour token in light must be themed in dark, or dark falls through
//    to the light value and the night edition quietly breaks.
for (const name of light.map.keys()) {
  if (!name.startsWith('--cds-color-') && !name.startsWith('--cds-shadow-')) continue
  if (!mediaDark.map.has(name)) {
    problems.push(`${name} is declared for light but never overridden for dark`)
  }
}

const counts = `light ${light.map.size}, media dark ${mediaDark.map.size}, attribute dark ${attrDark.map.size}`

if (problems.length) {
  console.error(`theme.css token check FAILED (${counts})\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}`)
  process.exitCode = 1
} else {
  console.log(`ok   theme.css tokens are in sync (${counts})`)
}
