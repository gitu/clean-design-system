/**
 * Renders stories from a running Storybook and writes a PNG per story, so the
 * system can be checked visually rather than by reading CSS.
 *
 *   pnpm storybook            # in one shell
 *   node scripts/screenshot-stories.mjs --out .shots --theme dark
 *
 * Console errors and page errors are collected and reported per story — a
 * story that renders but throws is a failure, not a pass.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const PORT = opt('port', '6006')  // matches `pnpm storybook`
const BASE = `http://localhost:${PORT}`
const OUT = opt('out', '.shots')
const THEME = opt('theme', 'light')
const WIDTH = Number(opt('width', '1200'))
const HEIGHT = Number(opt('height', '800'))
const ONLY = opt('only', '')

const index = await fetch(`${BASE}/index.json`).then(r => r.json())
const entries = Object.values(index.entries ?? {}).filter(
  e => e.type === 'story' && (!ONLY || e.id.includes(ONLY))
)

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  // Emulate reduced motion. Every duration token collapses to 0ms under it
  // (see tokens/motion.css), so entrance animations land on their final frame
  // instead of being caught mid-flight — which is what makes these PNGs
  // comparable between runs. It also means the shots record the reduced-motion
  // rendering, which is the one nobody otherwise looks at.
  reducedMotion: 'reduce',
})

const failures = []

for (const entry of entries) {
  const errors = []
  const onConsole = msg => msg.type() === 'error' && errors.push(msg.text())
  const onError = err => errors.push(String(err))
  page.on('console', onConsole)
  page.on('pageerror', onError)

  const url = `${BASE}/iframe.html?id=${entry.id}&globals=theme:${THEME}&viewMode=story`
  await page.goto(url, { waitUntil: 'networkidle' })
  // Storybook marks the root once the story has mounted.
  await page.waitForSelector('#storybook-root > *', { timeout: 15000 }).catch(() => {
    errors.push('story never mounted')
  })
  // Longer than --cds-duration-slower (420ms) so anything not covered by the
  // reduced-motion emulation above has still settled.
  await page.waitForTimeout(500)

  // Clip to the mounted story rather than the viewport, so a shot is exactly
  // as tall as the component and reviewing a hundred of them stays practical.
  const root = await page.$('#storybook-root')
  // `animations: 'disabled'` finishes any running CSS animation rather than
  // catching a frame of it — the infinite ones (Spinner, Skeleton) have no
  // final frame to settle on and were non-deterministic before this.
  const shot = { path: `${OUT}/${entry.id}--${THEME}.png`, animations: 'disabled' }
  if (root) await root.screenshot(shot).catch(() => page.screenshot(shot))
  else await page.screenshot(shot)

  page.off('console', onConsole)
  page.off('pageerror', onError)

  // React logs a benign act() / key warning family we do not want to fail on.
  const real = errors.filter(e => !/Download the React DevTools/.test(e))
  if (real.length) failures.push({ id: entry.id, errors: real })
}

await browser.close()

await writeFile(`${OUT}/report-${THEME}.json`, JSON.stringify({ count: entries.length, failures }, null, 2))

console.log(`shot ${entries.length} stories (${THEME}) -> ${OUT}`)
if (failures.length) {
  console.log(`\n${failures.length} story/stories reported errors:`)
  for (const f of failures) console.log(` - ${f.id}\n   ${f.errors.join('\n   ')}`)
  process.exitCode = 1
} else {
  console.log('no console or page errors')
}
