import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Shell } from './Shell'
import { EXAMPLES } from './catalog'
// Mirrors `.storybook/preview.tsx` exactly, deliberately: the same modules in
// the same order through the same bundler produce the same cascade, which is
// the only way these pages are guaranteed to look like the Storybook they were
// designed in. `preview.css` carries the chrome the pattern stories are written
// against — the masthead, the board, the reader column — and never reaches
// dist/, so importing it here is how the examples get it.
import '../../fonts/fonts.css'
import '../../src/styles/index.css'
import '../../.storybook/preview.css'
import './site.css'

/**
 * The shape of a story module, reduced to what a page actually needs.
 *
 * Not `Meta`/`StoryObj` from Storybook: those describe a story as the test
 * runner and the docs generator see it, with args, decorators and loaders, and
 * none of that applies to rendering one screen into an empty page. A nullary
 * `render` and an optional `layout` are the whole contract relied on here.
 */
interface StoryLike {
  /**
   * A React *component*, despite the name — half of these call `useState` in
   * their body. Storybook mounts it rather than calling it, and so must this;
   * calling it would run the hooks outside a render and take the page down.
   */
  render?: () => ReactNode
  parameters?: { layout?: string }
}

type StoryModule = Record<string, StoryLike | undefined> & { default?: StoryLike }

/**
 * Every pattern story, as lazy imports.
 *
 * A glob rather than a map of hand-written `import()` calls, so the catalog can
 * stay plain data that the Vite config is able to read. Vite rewrites this at
 * build time into one chunk per story, so a page downloads its own screen and
 * nothing else — which matters when the set includes a MapLibre map.
 */
const MODULES = import.meta.glob<StoryModule>('../../src/stories/*.stories.tsx')

type Layout = 'fullscreen' | 'padded' | 'centered'

/** Storybook's `parameters.layout` is an open string; this closes it. */
function toLayout(value: string | undefined): Layout {
  return value === 'fullscreen' || value === 'centered' ? value : 'padded'
}

/** Renders a failure into the page rather than leaving a white rectangle. */
function fail(root: HTMLElement, message: string): void {
  root.textContent = message
  root.setAttribute('style', 'font-family: system-ui, sans-serif; padding: 2rem')
}

/**
 * Mounts one sample application, by slug.
 *
 * Called from the inline script in each generated `index.html`. The slug is the
 * page's own directory name, so a page can only ever ask for the example it is.
 */
export async function mount(slug: string): Promise<void> {
  const root = document.getElementById('root')
  if (!root) return

  const example = EXAMPLES.find(e => e.slug === slug)
  if (!example) {
    fail(root, `No example named “${slug}”.`)
    return
  }

  const path = `../../src/stories/${example.module}.stories.tsx`
  const load = MODULES[path]
  if (!load) {
    fail(root, `Example “${slug}” points at ${path}, which does not exist.`)
    return
  }

  const mod = await load()
  const story = mod[example.story]
  if (!story?.render) {
    fail(root, `Example “${slug}” points at ${example.module}.${example.story}, which has no render.`)
    return
  }

  // Story first, meta second — the same precedence Storybook applies.
  const layout = story.parameters?.layout ?? mod.default?.parameters?.layout

  // No `StrictMode`. Storybook does not use it either, and these pages are
  // meant to be the stories exactly — a double-invoked effect would give the
  // map and the toast queue a different life here than in the documentation.
  const Screen = story.render
  createRoot(root).render(
    <Shell layout={toLayout(layout)} indexHref="../">
      <Screen />
    </Shell>,
  )
}
