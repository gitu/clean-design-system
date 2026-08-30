import type { ReactNode } from 'react'
import { Icon, ThemeProvider } from '../../src/index'
import { BrandLinkProvider } from '../../src/stories/BrandMark'

/**
 * Where the theme choice is kept. One key for the whole site — landing page,
 * examples index and every sample application — so switching to dark in the
 * task tracker and then going back to the front page lands you in dark. A site
 * that forgets its own theme on every navigation reads as broken.
 *
 * The inline script in each page's `<head>` reads the same key before the first
 * frame; keep them in step.
 */
const THEME_KEY = 'cds-site-theme'

interface ShellProps {
  /** Rendered inside the canvas. A whole application, usually. */
  children: ReactNode
  /**
   * Matches the story's own `parameters.layout`. `fullscreen` is edge-to-edge;
   * `padded` gets the canvas gutter, exactly as in Storybook.
   */
  layout?: 'fullscreen' | 'padded' | 'centered'
  /**
   * Where the way out goes, relative to this page. Omitted on the pages that
   * are themselves the destination.
   */
  indexHref?: string
  /** What is at `indexHref`. Names the two links that point at it. */
  indexLabel?: string
}

/**
 * The chrome the sample applications share, which is deliberately almost none.
 *
 * These pages exist to be looked at as products, so nothing is allowed to sit
 * in the layout: no wrapper bar, no frame, no badge in the flow. The provider
 * and the canvas class reproduce what `.storybook/preview.tsx` does — the
 * stories are written against `.sb-canvas` inside a `.cds-root`, and the reset
 * is scoped to that root, so rendering them without it would be showing a
 * different screen from the one the Storybook documents.
 *
 * The additions are two ways back out, because someone arriving on
 * `/examples/task-tracker/` from a link has no other route to the rest of them
 * and browser Back is not an answer when there is nothing to go back to:
 *
 * - the screen's own top-left wordmark becomes a link, which is where everyone
 *   clicks first and costs no space at all;
 * - a labelled disc in the corner, fixed to the viewport rather than the page,
 *   for the screens where the wordmark has scrolled away or where nobody
 *   thought to try it.
 *
 * Neither sits in the layout. These pages exist to be read as products, and a
 * strip of site chrome above the masthead would make every one of them look
 * like it lived in a frame.
 */
export function Shell({
  children,
  layout = 'fullscreen',
  indexHref,
  indexLabel = 'All examples',
}: ShellProps) {
  const canvas = (
    <div className="sb-canvas" data-layout={layout}>
      {children}
    </div>
  )

  return (
    <ThemeProvider defaultTheme="system" storageKey={THEME_KEY} applyTo="document">
      {/* The provider is what turns the screen's own wordmark into a link, so
          it goes on only when there is somewhere for it to point. In Storybook
          there never is, and the same markup stays text. */}
      {indexHref ? (
        <BrandLinkProvider href={indexHref} label={indexLabel}>
          {canvas}
        </BrandLinkProvider>
      ) : (
        canvas
      )}
      {indexHref && (
        <a className="site-return" href={indexHref}>
          <Icon name="chevron-left" size={14} />
          {/* Clipped rather than removed: the link's accessible name is this
              text, and an icon-only link back to a page called "Examples"
              would have to invent one. */}
          <span className="site-return__label">{indexLabel}</span>
        </a>
      )}
    </ThemeProvider>
  )
}
