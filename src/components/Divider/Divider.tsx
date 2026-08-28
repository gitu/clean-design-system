import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Divider.css'

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  /** `accent` is the heavy masthead rule — at most once per view. */
  tone?: 'subtle' | 'default' | 'strong' | 'accent'
  /** Optional label set into the rule as a kicker. Horizontal only. */
  label?: ReactNode
  /** Where a label sits along the rule. */
  align?: 'start' | 'center'
  /** Vertical space above and below. */
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * A hairline rule — the main structural device in this system. Prefer a rule
 * over a border-box or a shadow when separating regions.
 */
export function Divider({
  orientation = 'horizontal',
  tone = 'default',
  label,
  align = 'start',
  spacing = 'none',
  className,
  ...rest
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cx('cds-divider', 'cds-divider--vertical', `cds-divider--${tone}`, className)}
        role="separator"
        aria-orientation="vertical"
        {...rest}
      />
    )
  }

  if (label != null) {
    return (
      <div
        className={cx(
          'cds-divider-labelled',
          `cds-divider-labelled--${align}`,
          `cds-divider--${tone}`,
          `cds-divider--space-${spacing}`,
          className
        )}
        role="separator"
        {...rest}
      >
        {align === 'center' && <span className="cds-divider-labelled__line" />}
        <span className="cds-divider-labelled__label cds-kicker">{label}</span>
        <span className="cds-divider-labelled__line" />
      </div>
    )
  }

  return (
    <div
      className={cx(
        'cds-divider',
        'cds-divider--horizontal',
        `cds-divider--${tone}`,
        `cds-divider--space-${spacing}`,
        className
      )}
      role="separator"
      {...rest}
    />
  )
}
