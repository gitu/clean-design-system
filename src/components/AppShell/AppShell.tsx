import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './AppShell.css'

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Masthead. Sticks to the top and carries the accent rule underneath. */
  header?: ReactNode
  /** Filter column. Sticky on wide screens; move it into a `Drawer` on narrow. */
  sidebar?: ReactNode
  /** Optional second column on the trailing edge — detail view, preview pane. */
  aside?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  /** Width of the filter column. Any CSS length. */
  sidebarWidth?: string
  asideWidth?: string
  /** Hide the sidebar — pair with a `Drawer` at narrow widths. */
  sidebarHidden?: boolean
  /**
   * What happens to the aside below 1100px.
   *
   * `hide` is the default because the usual aside is a preview pane, and a
   * preview stacked under a hundred results helps nobody. Use `stack` when the
   * aside carries something that exists nowhere else — a document's metadata,
   * a summary — so a narrow screen does not simply lose it.
   */
  asideCollapse?: 'hide' | 'stack'
  /** Cap and centre the content column. */
  maxWidth?: string | false
}

/**
 * The page frame for a search application: masthead, filter column, results,
 * optional detail pane. The sidebar and content scroll independently, so
 * filters stay put while results scroll — the single most important layout
 * behaviour in this kind of interface.
 */
export function AppShell({
  header,
  sidebar,
  aside,
  footer,
  children,
  sidebarWidth = 'var(--cds-sidebar-width)',
  asideWidth = '22rem',
  sidebarHidden = false,
  asideCollapse = 'hide',
  maxWidth = 'var(--cds-content-max)',
  className,
  style,
  ...rest
}: AppShellProps) {
  const vars = {
    '--cds-shell-sidebar': sidebarWidth,
    '--cds-shell-aside': asideWidth,
    '--cds-shell-max': maxWidth === false ? 'none' : maxWidth,
    ...style,
  } as CSSProperties

  return (
    <div
      className={cx('cds-shell', asideCollapse === 'stack' && 'cds-shell--aside-stack', className)}
      style={vars}
      {...rest}
    >
      {header && <header className="cds-shell__header">{header}</header>}

      <div className="cds-shell__main">
        {sidebar && !sidebarHidden && (
          <aside className="cds-shell__sidebar" aria-label="Filters">
            <div className="cds-shell__sidebar-inner">{sidebar}</div>
          </aside>
        )}

        <main className="cds-shell__content">{children}</main>

        {aside && (
          <aside className="cds-shell__aside" aria-label="Details">
            <div className="cds-shell__aside-inner">{aside}</div>
          </aside>
        )}
      </div>

      {footer && <footer className="cds-shell__footer">{footer}</footer>}
    </div>
  )
}
