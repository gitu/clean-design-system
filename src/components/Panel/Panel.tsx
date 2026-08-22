import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Panel.css'

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Heading, set as a kicker over a rule. */
  title?: ReactNode
  /** Secondary line under the title. */
  description?: ReactNode
  /** Right-aligned slot in the header. */
  actions?: ReactNode
  /** Pinned to the bottom, above a rule. */
  footer?: ReactNode
  /**
   * `plain` has no ground at all — the default, and the most editorial.
   * `ruled` draws a hairline box. `sunken` fills with the recessed surface.
   */
  variant?: 'plain' | 'ruled' | 'sunken'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children?: ReactNode
}

/**
 * A titled region. Prefer `plain` or `ruled` — filled, shadowed cards fight
 * the flatness this system is built on.
 */
export function Panel({
  title,
  description,
  actions,
  footer,
  variant = 'plain',
  padding = 'md',
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section
      className={cx('cds-panel', `cds-panel--${variant}`, `cds-panel--pad-${padding}`, className)}
      {...rest}
    >
      {(title || actions || description) && (
        <header className="cds-panel__header">
          <div className="cds-panel__heading">
            {title && <h2 className="cds-panel__title cds-kicker">{title}</h2>}
            {description && <p className="cds-panel__description">{description}</p>}
          </div>
          {actions && <div className="cds-panel__actions">{actions}</div>}
        </header>
      )}
      <div className="cds-panel__body">{children}</div>
      {footer && <footer className="cds-panel__footer">{footer}</footer>}
    </section>
  )
}
