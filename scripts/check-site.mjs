/**
 * Loads every page of the built site in a real browser and fails if one is
 * blank, and checks that the parts nobody looks at landed too.
 *
 *   pnpm build-site && pnpm check-site
 *
 * The gap this closes is specific. `tsc` and ESLint both pass happily on a
 * story whose `render` calls `useState`, and so does the build — but rendering
 * one as a page means *mounting* it rather than calling it, and getting that
 * wrong takes the page down at runtime with a null-hook error and nothing else.
 * The same is true of a missing stylesheet, an asset path that only resolves at
 * the site root, and a story that throws on a fixture it only sees here. None
 * of those are visible in a build log; all of them are visible in one page load.
 *
 * So: serve the built directory, open every page, and require that each one
 * mounted something, applied the system's canvas, and logged no errors.
 *
 * The pages are discovered from the output rather than from the catalog, which
 * makes this a check on what will actually be published — including the case
 * where the build quietly emitted nothing at all.
 *
 * The three files asserted at the end are the site's contracts with things that
 * are not a browser: the registry URL in everyone's `components.json`, the
 * index an agent is pointed at, and the Storybook that the landing page and
 * every example link to.
 */
import { createServer } from 'node:http'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = resolve(fileURLToPath(new URL('../site-dist', import.meta.url)))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
}

/** The smallest a page can be and still be a screen rather than an error. */
const MIN_ELEMENTS = 25

/**
 * Served by the site but not rendered by it. A missing one of these is a broken
 * `npx shadcn add` or a dead link from the landing page, neither of which any
 * page load would notice.
 */
const REQUIRED_FILES = ['r/button.json', 'llms.txt', 'favicon.svg', 'storybook/index.html']

let pages
try {
  const examples = await readdir(join(ROOT, 'examples'), { withFileTypes: true })
  pages = [
    '',
    'examples/',
    ...examples.filter(e => e.isDirectory()).map(e => `examples/${e.name}/`),
  ]
} catch {
  console.error(`No build at ${ROOT}/examples. Run \`pnpm build-site\` first.`)
  process.exit(1)
}

if (pages.length < 3) {
  console.error('The site build produced no example page directories.')
  process.exit(1)
}

// Static, and deliberately dumb: the only behaviour it borrows from GitHub
// Pages is serving index.html for a directory, which is the one thing the
// relative asset paths in these pages depend on.
const server = createServer((req, res) => {
  void (async () => {
    try {
      let file = join(ROOT, normalize(decodeURIComponent(req.url.split('?')[0])))
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
      res.end(await readFile(file))
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  })()
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const { port } = server.address()

const browser = await chromium.launch()
const failures = []

for (const path of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const problems = []
  page.on('console', message => {
    if (message.type() === 'error') problems.push(message.text())
  })
  page.on('pageerror', error => problems.push(error.message))

  await page.goto(`http://127.0.0.1:${port}/${path}`, { waitUntil: 'networkidle' })

  const found = await page.evaluate(() => ({
    elements: document.getElementById('root')?.querySelectorAll('*').length ?? 0,
    // `.cds-root` is the provider; `.sb-canvas` is the story chrome. Both
    // missing means the stylesheets did not arrive, which looks like a working
    // page in a screenshot of the DOM and like nothing at all in a browser.
    canvas: Boolean(document.querySelector('.cds-root .sb-canvas')),
  }))

  const name = path === '' ? '(landing)' : path.replace(/\/$/, '')
  if (found.elements < MIN_ELEMENTS) problems.push(`only ${found.elements} elements rendered`)
  if (!found.canvas) problems.push('no .cds-root .sb-canvas — the stylesheets did not load')

  if (problems.length > 0) failures.push({ name, problems })
  console.log(`${problems.length === 0 ? 'ok  ' : 'FAIL'} ${name}`)
  for (const problem of problems) console.log(`       ${problem}`)

  await page.close()
}

await browser.close()
server.close()

for (const file of REQUIRED_FILES) {
  try {
    await access(join(ROOT, file))
    console.log(`ok   ${file}`)
  } catch {
    failures.push({ name: file, problems: ['missing from the built site'] })
    console.log(`FAIL ${file}\n       missing from the built site`)
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check${failures.length === 1 ? '' : 's'} failed.`)
  process.exit(1)
}
console.log(`\n${pages.length} pages rendered, ${REQUIRED_FILES.length} published files present.`)
