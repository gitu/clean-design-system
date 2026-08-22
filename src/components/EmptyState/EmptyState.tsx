import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './EmptyState.css'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** One line, set in the serif. State what happened, not what went wrong. */
  title: ReactNode
  /** What to do about it. Keep it to a sentence or two. */
  description?: ReactNode
  /** Glyph above the title. Optional — often the page reads better without. */
  icon?: ReactNode
  /** Primary and secondary actions. */
  actions?: ReactNode
  /** Concrete next steps, e.g. spelling, fewer filters, a broader date range. */
  suggestions?: ReactNode[]
  size?: 'sm' | 'md'
}

/**
 * A zero-result state. Worth care: this is the screen people see most often
 * when a search tool is failing them, and a bare "No results" tells them
 * nothing about what to try next.
 */
export function EmptyState({
  title,
  description,
  icon,
  actions,
  suggestions,
  size = 'md',
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={cx('cds-empty', `cds-empty--${size}`, className)} {...rest}>
      {icon && <div className="cds-empty__icon">{icon}</div>}
      <h2 className="cds-empty__title">{title}</h2>
      {description && <p className="cds-empty__description">{description}</p>}

      {suggestions && suggestions.length > 0 && (
        <ul className="cds-empty__suggestions">
          {suggestions.map((suggestion, i) => (
            <li key={i} className="cds-empty__suggestion">
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {actions && <div className="cds-empty__actions">{actions}</div>}
    </div>
  )
}
