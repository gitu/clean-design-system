import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Badge.css'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic colour. `neutral` is the default and by far the most common. */
  tone?: BadgeTone
  /** `soft` is a tinted ground, `outline` a hairline rule, `solid` a fill. */
  variant?: 'soft' | 'outline' | 'solid'
  size?: 'sm' | 'md'
  /** A small leading dot — useful for live/status readouts. */
  dot?: boolean
  children?: ReactNode
}

/**
 * A read-only status marker: pipeline state, document type, embargo flag.
 * For a value the user chose and can remove, reach for `Tag` instead.
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        'cds-badge',
        `cds-badge--${tone}`,
        `cds-badge--${variant}`,
        `cds-badge--${size}`,
        className
      )}
      {...rest}
    >
      {dot && <span className="cds-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
