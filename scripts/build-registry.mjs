/**
 * Generates a shadcn-compatible registry from `src/`.
 *
 *   node scripts/build-registry.mjs
 *
 * The point is that people can take the source rather than the package:
 *
 *   npx shadcn@latest add https://gitu.github.io/clean-design-system/r/button.json
 *
 * No CLI of our own. The shadcn CLI installs from any public URL, so the whole
 * job here is emitting the JSON it expects — and emitting it *from the source
 * tree*, so the registry cannot drift from the package. Nothing below is
 * hand-written; if a component gains a file or an import, the next build picks
 * it up.
 *
 * Why this system suits copy-in distribution unusually well:
 *
 *   - No runtime dependencies outside React, except `@visx/*` for the charts
 *     and `react-dom`'s `createPortal` for the four overlay components.
 *   - Exactly three shared helpers (`cx`, `useControllableState`,
 *     `useModalLayer`), each its own registry item, so a `Badge` does not drag
 *     a focus trap in behind it.
 *   - Every stylesheet is colocated with its component and imported by it, so a
 *     component is genuinely two files and a token dependency.
 *
 * Everything lands under one namespace directory (`ui/cds/`) and imports each
 * other *relatively*. That is deliberately not how shadcn's own registry does
 * it — shadcn rewrites `@/registry/...` to the consumer's aliases at install
 * time, which works right up until someone's `tsconfig` paths disagree. Keeping
 * the tree self-contained means it installs the same way into a Vite app, a
 * Next app or a Remix app, and the whole thing can be moved by dragging the
 * folder.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'registry')
const BASE_URL = (process.env.REGISTRY_URL ?? 'https://gitu.github.io/clean-design-system').replace(/\/$/, '')

/** Where the whole system lands inside the consumer's ui directory. */
const NS = 'cds'

const url = name => `${BASE_URL}/r/${name}.json`

/** `MarkdownEditor` -> `markdown-editor`, `AppShell` -> `app-shell`. */
const kebab = name =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

/* --- Shared helpers ------------------------------------------------------- */

const LIB = {
  cx: { name: 'cx', type: 'registry:lib', file: 'cx.ts', title: 'cx', description: 'Class-name joiner. Every component takes className and merges it through this.' },
  useControllableState: {
    name: 'use-controllable-state',
    type: 'registry:hook',
    file: 'useControllableState.ts',
    title: 'useControllableState',
    description: 'One hook for the controlled-or-uncontrolled pattern every input in the system follows.',
  },
  useModalLayer: {
    name: 'use-modal-layer',
    type: 'registry:hook',
    file: 'useModalLayer.ts',
    title: 'useModalLayer',
    description: 'Escape, focus trap, scroll lock and focus return — shared by Dialog, Drawer and CommandPalette.',
  },
}

const STYLES_ITEM = 'styles'

/* --- Reading the source tree ---------------------------------------------- */

const isSource = file => /\.(tsx|ts)$/.test(file) && !file.includes('.stories.')

async function readComponent(dir) {
  const abs = path.join(ROOT, 'src/components', dir)
  const entries = await readdir(abs)

  const files = entries.filter(f => isSource(f) || f.endsWith('.css')).sort()
  if (files.length === 0) return null

  const deps = new Set()
  const libs = new Set()
  const npm = new Set()
  let loc = 0

  const emitted = []
  for (const file of files) {
    const raw = await readFile(path.join(abs, file), 'utf8')
    loc += raw.split('\n').length

    for (const [, spec] of raw.matchAll(/from '([^']+)'/g)) {
      if (spec.startsWith('../../utils/')) libs.add(spec.split('/').pop())
      else if (spec.startsWith('../')) {
        const other = spec.split('/')[1]
        if (other && other !== dir) deps.add(other)
      } else if (!spec.startsWith('.') && spec !== 'react') npm.add(spec)
    }

    emitted.push({
      // `path` is where it came from; `target` is where it goes. Both, because
      // the first is what makes an install traceable back to this repository.
      path: `src/components/${dir}/${file}`,
      type: file.endsWith('.css') ? 'registry:file' : 'registry:ui',
      target: `@ui/${NS}/${kebab(dir)}/${file}`,
      content: rewrite(raw),
    })
  }

  return { dir, files: emitted, deps: [...deps], libs: [...libs], npm: [...npm], loc }
}

/**
 * Points the imports at where the files actually land.
 *
 * Only two shapes ever need touching, which is the whole reason this is
 * fifteen lines rather than a TypeScript transform: sibling components move
 * from `../Icon/Icon` to `../icon/Icon` because the folders are kebab-cased on
 * the way out, and the three shared helpers move from `src/utils` into
 * `ui/cds/lib`. Colocated `./Button.css` imports are already correct.
 */
function rewrite(source) {
  return source
    .replace(/from '\.\.\/\.\.\/utils\/([^']+)'/g, "from '../lib/$1'")
    .replace(/from '\.\.\/([A-Z][A-Za-z0-9]*)\//g, (_, dir) => `from '../${kebab(dir)}/`)
}

/** Every file under a directory, relative to the repo root. */
async function walk(dir) {
  const out = []
  for (const entry of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...(await walk(rel)))
    else out.push(rel)
  }
  return out.sort()
}

/* --- Items ---------------------------------------------------------------- */

async function buildStyles() {
  const files = []
  for (const rel of await walk('src/styles')) {
    files.push({
      path: rel,
      type: 'registry:file',
      target: `@ui/${NS}/styles/${rel.replace('src/styles/', '')}`,
      content: await readFile(path.join(ROOT, rel), 'utf8'),
    })
  }

  // Every component imports its own stylesheet, and TypeScript has no idea what
  // a `.css` module is until something tells it. Without this the very first
  // install fails to compile on `import './Button.css'` — found by installing
  // into an empty project rather than by reasoning about it.
  //
  // Written here rather than copied from `src/css.d.ts`: that file also
  // augments `ImportMeta` for Vite, which is this repository's business and
  // would collide with a consumer's own environment types.
  files.push({
    path: 'src/css.d.ts',
    type: 'registry:file',
    target: `@ui/${NS}/styles/css.d.ts`,
    content: [
      '// Lets TypeScript accept the colocated stylesheet each component imports.',
      '// Safe to delete if your project already declares this.',
      "declare module '*.css'",
      '',
    ].join('\n'),
  })

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: STYLES_ITEM,
    type: 'registry:item',
    title: 'Design tokens and base layer',
    description:
      'The token cascade, the reset and the typographic base. Every component depends on this — nothing in the system is styled without it.',
    files,
    docs: [
      `Import the stylesheet once, at your application's entry point:`,
      ``,
      `    import '@/components/ui/${NS}/styles/index.css'`,
      ``,
      `Then wrap your tree in <ThemeProvider>. The reset is wrapped in :where(),`,
      `so it cannot outrank your own classes and will not fight Tailwind.`,
      ``,
      `Self-hosted faces are optional and are not installed: the tokens fall back`,
      `to system fonts. See the repository's fonts/ directory to add them.`,
    ].join('\n'),
  }
}

async function buildLib(key) {
  const spec = LIB[key]
  const rel = `src/utils/${spec.file}`
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: spec.name,
    type: spec.type,
    title: spec.title,
    description: spec.description,
    files: [
      {
        path: rel,
        type: spec.type === 'registry:hook' ? 'registry:hook' : 'registry:lib',
        target: `@ui/${NS}/lib/${spec.file}`,
        content: await readFile(path.join(ROOT, rel), 'utf8'),
      },
    ],
  }
}

/**
 * Descriptions the components already carry, rather than a second set here.
 *
 * Two exceptions, both honest ones: `Chart` is an internal folder with no
 * component of its own, and `Chat` is a family of eleven in one directory. A
 * generated one-liner for either would be a guess.
 */
const OVERRIDES = {
  Chart:
    'Internal chart machinery — scales, axes, the SVG surface, the keyboard cursor. Installed as a dependency of the charts; not used directly.',
  Chat: 'The assistant family: transcript, messages, tool calls, artefacts, files, diffs, images and question sets.',
}

/**
 * The first sentence of the JSDoc attached to the exported component.
 *
 * The block has to be *immediately* above the export, which is fiddlier than it
 * sounds: a lazy `[\s\S]*?` will happily swallow one comment's closing `*\/`
 * and keep going until it finds an export, so the first documented prop in the
 * file wins and `Button` ends up described as "primary is a solid ink fill".
 * The tempered `(?:(?!\*\/)[\s\S])*` below cannot cross a comment boundary.
 */
function describe(component) {
  if (OVERRIDES[component.dir]) return OVERRIDES[component.dir]

  const tsx = component.files.filter(file => file.path.endsWith('.tsx'))
  const main =
    tsx.find(file => file.path.endsWith(`${component.dir}.tsx`)) ??
    tsx.sort((a, b) => b.content.length - a.content.length)[0]
  if (!main) return `The ${component.dir} component.`

  const blocks = [
    ...main.content.matchAll(
      /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:function|const)\s+([A-Za-z0-9_]+)/g
    ),
  ]
  const hit = blocks.find(block => block[2] === component.dir) ?? blocks[0]
  if (!hit) return `The ${component.dir} component.`

  const text = hit[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  const sentence = text.split(/(?<=[.!?])\s/)[0] ?? text
  return sentence.replace(/[`*]/g, '').slice(0, 240)
}

function buildComponent(component) {
  const registryDependencies = [
    url(STYLES_ITEM),
    ...component.libs.map(lib => url(LIB[lib].name)),
    ...component.deps.map(dep => url(kebab(dep))),
  ]

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: kebab(component.dir),
    type: 'registry:ui',
    title: component.dir,
    description: describe(component),
    ...(component.npm.length ? { dependencies: component.npm.sort() } : null),
    registryDependencies,
    files: component.files,
    meta: { loc: component.loc, source: `src/components/${component.dir}` },
  }
}

/* --- Build ---------------------------------------------------------------- */

const componentDirs = (
  await readdir(path.join(ROOT, 'src/components'), { withFileTypes: true })
)
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

const components = (await Promise.all(componentDirs.map(readComponent))).filter(Boolean)

const items = [
  await buildStyles(),
  ...(await Promise.all(Object.keys(LIB).map(buildLib))),
  ...components.map(buildComponent),
]

await rm(OUT, { recursive: true, force: true })
await mkdir(path.join(OUT, 'r'), { recursive: true })

for (const item of items) {
  await writeFile(path.join(OUT, 'r', `${item.name}.json`), JSON.stringify(item, null, 2) + '\n')
}

/** The catalogue. File contents are left out — that is what `r/<name>.json` is for. */
const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'clean-design-system',
  homepage: `${BASE_URL}/`,
  items: items.map(item => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    ...(item.dependencies ? { dependencies: item.dependencies } : null),
    ...(item.registryDependencies ? { registryDependencies: item.registryDependencies } : null),
    files: item.files.map(({ path: from, type, target }) => ({ path: from, type, target })),
  })),
}

await writeFile(path.join(OUT, 'registry.json'), JSON.stringify(registry, null, 2) + '\n')

/* --- Checks ---------------------------------------------------------------
 * A registry that emits an item pointing at an item that does not exist is
 * broken in the one way nobody notices until a stranger runs the install.
 * ------------------------------------------------------------------------- */

const names = new Set(items.map(item => item.name))
const problems = []

for (const item of items) {
  for (const dep of item.registryDependencies ?? []) {
    const name = dep.split('/').pop().replace('.json', '')
    if (!names.has(name)) problems.push(`${item.name} -> missing dependency ${name}`)
  }
  for (const file of item.files) {
    if (!existsSync(path.join(ROOT, file.path))) problems.push(`${item.name} -> missing file ${file.path}`)
    if (!file.target) problems.push(`${item.name} -> ${file.path} has no target`)
    // A rewritten import that still points outside the namespace would land in
    // the consumer's project as a broken path.
    if (/from '\.\.\/\.\.\//.test(file.content)) {
      problems.push(`${item.name} -> ${file.path} still escapes the namespace`)
    }
    if (/from '\.\.\/[A-Z]/.test(file.content)) {
      problems.push(`${item.name} -> ${file.path} has an unrewritten sibling import`)
    }
  }
}

const bytes = JSON.stringify(items).length

if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`)
  console.error(`\n${problems.length} problem(s)`)
  process.exitCode = 1
} else {
  const total = items.reduce((sum, item) => sum + item.files.length, 0)
  console.log(
    `registry: ${items.length} items, ${total} files, ${(bytes / 1024).toFixed(0)} KB -> registry/`
  )
  console.log(`          ${BASE_URL}/r/<name>.json`)
}
