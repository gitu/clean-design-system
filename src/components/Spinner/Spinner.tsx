import type { HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Spinner.css'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Diameter. `sm` 12px, `md` 16px, `lg` 24px. */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Announced to assistive tech. Pass `null` when a surrounding element already
   * carries `aria-busy` — otherwise screen readers hear the state twice.
   */
  label?: string | null
}

/**
 * An indeterminate wait.
 *
 * `label` is announced politely and defaults to "Loading"; pass `null` when
 * something adjacent already says it, which is the case inside `Button`. The
 * animation is a duration token, so `prefers-reduced-motion` stops it without
 * this component knowing anything about the media query.
 */
export function Spinner({ size = 'md', label = 'Loading', className, ...rest }: SpinnerProps) {
  return (
    <span
      className={cx('cds-spinner', `cds-spinner--${size}`, className)}
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
    />
  )
}
