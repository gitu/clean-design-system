import type { ReactNode } from 'react'
import { Icon, ThemeProvider } from '../../src/index'

/**
 * Where the theme choice is kept. One key for every page under `/examples/`,
 * so switching to dark in the task tracker and then opening the landing page
 * lands you in dark — they are the same site, and a demo that forgets its own
 * theme on every navigation reads as broken.
 */
const THEME_KEY = 'cds-examples-theme'

interface ShellProps {
  /** Rendered inside the canvas. A whole application, usually. */
  children: ReactNode
  /**
   * Matches the story's own `parameters.layout`. `fullscreen` is edge-to-edge;
   * `padded` gets the canvas gutter, exactly as in Storybook.
   */
  layout?: 'fullscreen' | 'padded' | 'centered'
  /**
   * Where the corner link goes, relative to this page. Omitted on the index,
   * which is what it points at.
   */
  indexHref?: string
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
 * The single addition is a corner link back to the index, fixed to the viewport
 * rather than the page. Someone arriving on `/examples/task-tracker/` from a
 * link has no other way to find the rest of them, and browser Back is not an
 * answer when there is nothing to go back to.
 */
export function Shell({ children, layout = 'fullscreen', indexHref }: ShellProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey={THEME_KEY} applyTo="document">
      <div className="sb-canvas" data-layout={layout}>
        {children}
      </div>
      {indexHref && (
        <a className="ex-return" href={indexHref}>
          <Icon name="chevron-left" size={14} />
          {/* Clipped rather than removed: the link's accessible name is this
              text, and an icon-only link back to a page called "Examples"
              would have to invent one. */}
          <span className="ex-return__label">All examples</span>
        </a>
      )}
    </ThemeProvider>
  )
}
