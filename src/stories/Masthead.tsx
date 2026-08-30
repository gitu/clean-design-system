import type { ReactNode } from 'react'
import { ThemeToggle } from '../index'
import { BrandMark } from './BrandMark'

interface MastheadProps {
  /** The section name, set as a kicker beside the wordmark. */
  section: string
  /** The wordmark. Defaults to this Storybook's own. */
  brand?: string
  /**
   * Primary navigation, for a product whose bar carries one — usually a
   * horizontal `NavList`. Hidden below 720px, where a `Drawer` should take it.
   */
  nav?: ReactNode
  /** Optional wide slot — a search field, usually. */
  children?: ReactNode
  /** Right-aligned controls. The theme toggle is appended after them. */
  actions?: ReactNode
  /** Drop the theme toggle — for a screen that has its own. */
  hideThemeToggle?: boolean
}

/**
 * The application bar the pattern stories share.
 *
 * It lives here rather than in `src/components` because it is *not* part of the
 * system — every product's masthead is its own, and `AppShell` deliberately
 * takes it as a slot. What it does demonstrate is how to build one that
 * survives a phone: the row wraps, the section kicker drops out below the
 * point where it would push the actions off-screen, and nothing is given a
 * fixed height.
 *
 * Its styles are in `.storybook/preview.css`, which is canvas-only and never
 * reaches `dist/`.
 */
export function Masthead({
  section,
  brand = 'archiv_',
  nav,
  children,
  actions,
  hideThemeToggle = false,
}: MastheadProps) {
  return (
    <div className="sb-masthead">
      <BrandMark brand={brand} />
      <span className="sb-masthead__section cds-kicker">{section}</span>
      {nav && <div className="sb-masthead__nav">{nav}</div>}
      {children && <div className="sb-masthead__slot">{children}</div>}
      {(actions || !hideThemeToggle) && (
        <div className="sb-masthead__actions">
          {actions}
          {!hideThemeToggle && <ThemeToggle />}
        </div>
      )}
    </div>
  )
}
